from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from supabase_client import supabase, supabase_admin
from Crypto.PublicKey import RSA
from Crypto.Signature import PKCS1_v1_5
from Crypto.Hash import SHA256 as CryptoSHA256
import hashlib
import datetime
import base64
import json
import os
import secrets
import uuid
from werkzeug.utils import secure_filename
import resend

app = Flask(__name__)
CORS(app)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
ARTWORK_UPLOAD_DIR = os.path.join(UPLOAD_DIR, "artworks")
PROOF_UPLOAD_DIR = os.path.join(UPLOAD_DIR, "proofs")
os.makedirs(ARTWORK_UPLOAD_DIR, exist_ok=True)
os.makedirs(PROOF_UPLOAD_DIR, exist_ok=True)


def parse_json_value(value):
    if value is None:
        return None
    if isinstance(value, dict):
        return value
    if isinstance(value, str):
        try:
            return json.loads(value)
        except Exception:
            return None
    return None


def utc_now():
    return datetime.datetime.now(datetime.timezone.utc)


def canonical_json_bytes(payload):
    return json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")


def normalize_pem_text(public_key_pem):
    if not public_key_pem:
        return None
    if isinstance(public_key_pem, bytes):
        public_key_pem = public_key_pem.decode("utf-8")
    return public_key_pem.replace("\r\n", "\n").strip() + "\n"


def compute_public_key_fingerprint(public_key_pem):
    normalized = normalize_pem_text(public_key_pem)
    if not normalized:
        return None
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()


def require_cert_fields(cert, fields):
    missing = [field for field in fields if not cert.get(field)]
    if missing:
        raise ValueError("Missing required certificate fields: " + ", ".join(missing))


def fetch_registered_signing_key(user_id):
    result = supabase_admin.table("user_signing_keys") \
        .select("*") \
        .eq("user_id", str(user_id)) \
        .execute()
    return (result.data or [None])[0]


def serialize_datetime_iso(value):
    if not value:
        return None
    if isinstance(value, str):
        return value
    return value.isoformat()


def parse_datetime_value(value):
    if not value:
        return None
    if isinstance(value, datetime.datetime):
        return value if value.tzinfo else value.replace(tzinfo=datetime.timezone.utc)
    try:
        return datetime.datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except Exception:
        return None


def delete_local_upload_asset(asset_url):
    if not asset_url or not isinstance(asset_url, str):
        return
    marker = "/uploads/"
    idx = asset_url.find(marker)
    if idx == -1:
        return
    rel_path = asset_url[idx + len(marker):]
    parts = rel_path.split("/", 1)
    if len(parts) != 2:
        return
    folder, file_name = parts
    if folder == "artworks":
        target = os.path.join(ARTWORK_UPLOAD_DIR, file_name)
    elif folder == "proofs":
        target = os.path.join(PROOF_UPLOAD_DIR, file_name)
    else:
        return
    if os.path.isfile(target):
        os.remove(target)


def build_certificate_detail_payload(cert):
    artwork = None
    if cert.get("artwork_id"):
        artwork_result = supabase_admin.table("artworks") \
            .select("*") \
            .eq("id", cert["artwork_id"]) \
            .single() \
            .execute()
        artwork = artwork_result.data

    cert_data = parse_json_value(cert.get("cert_data")) or {}
    submitted_by = cert_data.get("submitted_by") or {}

    user_info = {
        "id": artwork.get("artist_id") if artwork else submitted_by.get("id"),
        "username": submitted_by.get("username"),
    }

    artist_id = user_info.get("id")
    if artist_id:
        try:
            admin_user_resp = supabase_admin.auth.admin.get_user_by_id(artist_id)
            admin_user = getattr(admin_user_resp, "user", None)
            if admin_user:
                user_meta = getattr(admin_user, "user_metadata", {}) or {}
                user_info["username"] = user_info.get("username") or user_meta.get("username") or user_meta.get("name")
                user_info["created_at"] = getattr(admin_user, "created_at", None)
        except Exception:
            pass

    return {
        "certificate": cert,
        "cert_data": cert_data,
        "artwork": artwork,
        "user": user_info,
    }


def save_uploaded_bytes(file_name, content_bytes, prefix, folder):
    safe_name = secure_filename(file_name or "file")
    storage_name = f"{prefix}_{uuid.uuid4().hex}_{safe_name}"
    target_dir = ARTWORK_UPLOAD_DIR if folder == "artworks" else PROOF_UPLOAD_DIR
    full_path = os.path.join(target_dir, storage_name)
    with open(full_path, "wb") as fh:
        fh.write(content_bytes)
    return {
        "file_name": file_name,
        "stored_name": storage_name,
        "folder": folder,
        "url": f"{request.host_url.rstrip('/')}/uploads/{folder}/{storage_name}",
    }


def verify_signature_for_payload(public_key_pem, signature_b64, payload):
    public_key = RSA.import_key(normalize_pem_text(public_key_pem))
    verifier = PKCS1_v1_5.new(public_key)
    digest = CryptoSHA256.new(canonical_json_bytes(payload))
    sig_bytes = base64.b64decode(signature_b64)
    return verifier.verify(digest, sig_bytes)


# ------------------------
# ADMIN AUTH HELPER
# ------------------------
def get_admin_user():
    """
    Extracts Bearer token from request, validates it with Supabase Auth,
    and checks that the user exists in the admin_users table.
    Returns the user dict on success, or raises a tuple (message, status_code).
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise PermissionError("Missing or invalid Authorization header")

    token = auth_header[len("Bearer "):]

    try:
        user_response = supabase.auth.get_user(token)
        user = user_response.user
        if not user:
            raise PermissionError("Invalid token")
    except Exception:
        raise PermissionError("Invalid token")

    try:
        admin_check = supabase_admin.table("admin_users") \
            .select("user_id") \
            .eq("user_id", user.id) \
            .execute()
        if not admin_check.data:
            raise PermissionError("Forbidden: admin access only")
    except PermissionError:
        raise
    except Exception as exc:
        raise PermissionError(f"Admin check failed: {exc}")

    return user


# ------------------------
# AUTH HELPER (any logged-in user)
# ------------------------
def get_authenticated_user():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise PermissionError("Missing or invalid Authorization header")
    token = auth_header[len("Bearer "):]
    try:
        user_response = supabase.auth.get_user(token)
        user = user_response.user
        if not user:
            raise PermissionError("Invalid token")
        return user
    except PermissionError:
        raise
    except Exception:
        raise PermissionError("Invalid token")


# ------------------------
# REGISTER WITH GIMP CERTIFICATE
# ------------------------
@app.route("/register-with-cert", methods=["POST"])
def register_with_cert():
    try:
        user = get_authenticated_user()
    except PermissionError as e:
        return jsonify({"error": str(e)}), 401

    if "file" not in request.files:
        return jsonify({"error": "Missing artwork file"}), 400

    file = request.files["file"]
    proof_file = request.files.get("proof_file")
    title = request.form.get("title", "").strip()
    cert_str = request.form.get("cert", "")
    proof_type = request.form.get("proof_type", "").strip()
    proof_file_name = request.form.get("proof_file_name", "").strip()

    if not title:
        return jsonify({"error": "Missing title"}), 400
    if not cert_str:
        return jsonify({"error": "Missing certificate"}), 400
    if not proof_file:
        return jsonify({"error": "Missing proof file"}), 400

    try:
        cert = json.loads(cert_str)
    except Exception:
        return jsonify({"error": "Invalid certificate JSON"}), 400

    try:
        require_cert_fields(cert, [
            "image_hash",
            "proof_hash",
            "signature",
            "public_key_pem",
            "key_fingerprint",
            "challenge_id",
            "challenge_nonce",
            "signed_payload",
        ])
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    registered_key = fetch_registered_signing_key(user.id)
    
    # AUTO-REGISTER: If no key exists, register the cert's key (TOFU - Trust On First Use)
    if not registered_key:
        cert_key_pem = normalize_pem_text(cert.get("public_key_pem"))
        cert_key_fingerprint = cert.get("key_fingerprint")
        if not cert_key_pem or not cert_key_fingerprint:
            return jsonify({"error": "Certificate missing public key or fingerprint"}), 400
        try:
            supabase_admin.table("user_signing_keys").insert({
                "user_id": user.id,
                "public_key_pem": cert_key_pem,
                "key_fingerprint": cert_key_fingerprint,
            }).execute()
            registered_key = {
                "user_id": user.id,
                "public_key_pem": cert_key_pem,
                "key_fingerprint": cert_key_fingerprint,
            }
        except Exception as exc:
            return jsonify({"error": f"Failed to auto-register signing key: {exc}"}), 500

    normalized_cert_key = normalize_pem_text(cert.get("public_key_pem"))
    if normalized_cert_key != normalize_pem_text(registered_key.get("public_key_pem")):
        return jsonify({"error": "Certificate public key does not match your registered signing key"}), 400

    if cert.get("key_fingerprint") != registered_key.get("key_fingerprint"):
        return jsonify({"error": "Certificate key fingerprint does not match your registered signing key"}), 400

    challenge_result = supabase_admin.table("upload_challenges") \
        .select("*") \
        .eq("id", cert.get("challenge_id")) \
        .eq("user_id", user.id) \
        .execute()
    challenge = (challenge_result.data or [None])[0]
    if not challenge:
        return jsonify({"error": "Upload challenge was not found"}), 400
    if challenge.get("used_at"):
        return jsonify({"error": "Upload challenge has already been used"}), 400
    expires_at = parse_datetime_value(challenge.get("expires_at"))
    if not expires_at or expires_at < utc_now():
        return jsonify({"error": "Upload challenge has expired"}), 400
    if cert.get("challenge_nonce") != challenge.get("nonce"):
        return jsonify({"error": "Upload challenge nonce does not match"}), 400

    image_bytes = file.read()
    proof_bytes = proof_file.read()

    # 1. Verify image hash matches certificate
    computed_hash = hashlib.sha256(image_bytes).hexdigest()
    if computed_hash != cert.get("image_hash"):
        return jsonify({"error": "Image hash does not match certificate"}), 400

    computed_proof_hash = hashlib.sha256(proof_bytes).hexdigest()
    if computed_proof_hash != cert.get("proof_hash"):
        return jsonify({"error": "Proof file hash does not match certificate"}), 400

    signed_payload = cert.get("signed_payload") or {}
    expected_payload = {
        "image_hash": computed_hash,
        "proof_hash": computed_proof_hash,
        "challenge_id": cert.get("challenge_id"),
        "challenge_nonce": cert.get("challenge_nonce"),
        "timestamp_utc": signed_payload.get("timestamp_utc") or cert.get("timestamp_utc"),
        "image_file": signed_payload.get("image_file") or cert.get("image_file"),
        "proof_file": signed_payload.get("proof_file") or proof_file.filename,
        "key_fingerprint": cert.get("key_fingerprint"),
    }
    if signed_payload != expected_payload:
        return jsonify({"error": "Signed payload contents do not match the uploaded assets or challenge"}), 400

    artwork_asset = None
    proof_asset = None
    try:
        artwork_asset = save_uploaded_bytes(file.filename, image_bytes, "artwork", "artworks")
        proof_asset = save_uploaded_bytes(proof_file.filename, proof_bytes, "proof", "proofs")
    except Exception as exc:
        return jsonify({"error": f"Failed to store upload assets: {exc}"}), 500

    # 2. Verify RSA signature
    try:
        is_valid_signature = verify_signature_for_payload(
            registered_key.get("public_key_pem"),
            cert["signature"],
            signed_payload,
        )
        if not is_valid_signature:
            return jsonify({"error": "Certificate signature is invalid"}), 400
    except Exception:
        return jsonify({"error": "Certificate signature is invalid"}), 400

    cert_payload = {
        "gimp_certificate": cert,
        "submitted_by": {
            "id": user.id,
            "email": getattr(user, "email", None),
            "username": ((getattr(user, "user_metadata", {}) or {}).get("username") or (getattr(user, "user_metadata", {}) or {}).get("name")),
        },
        "signing": {
            "key_fingerprint": registered_key.get("key_fingerprint"),
            "challenge_id": cert.get("challenge_id"),
            "challenge_nonce": cert.get("challenge_nonce"),
        },
        "artwork": artwork_asset,
        "proof": {
            "type": proof_type or None,
            "file_name": proof_file_name or None,
            "url": proof_asset.get("url") if proof_asset else None,
            "sha256": computed_proof_hash,
        },
    }

    # 3. Insert artwork
    try:
        artwork_result = supabase_admin.table("artworks").insert({
            "title": title,
            "artist_id": user.id,
            "final_file_hash": cert["image_hash"],
        }).execute()
        artwork = artwork_result.data[0]
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500

    # 4. Insert certificate with full cert data
    try:
        cert_result = supabase_admin.table("certificates").insert({
            "artwork_id": artwork["id"],
            "certificate_hash": cert["image_hash"],
            "cert_data": cert_payload,
            "signature_verified": True,
        }).execute()
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500

    try:
        supabase_admin.table("upload_challenges") \
            .update({"used_at": serialize_datetime_iso(utc_now())}) \
            .eq("id", cert.get("challenge_id")) \
            .execute()
    except Exception:
        pass

    return jsonify({
        "artwork": artwork,
        "certificate": cert_result.data[0],
    })



# ------------------------
@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Backend is running"})


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/me/signing-key", methods=["GET"])
def get_signing_key():
    try:
        user = get_authenticated_user()
    except PermissionError as e:
        return jsonify({"error": str(e)}), 401

    try:
        row = fetch_registered_signing_key(user.id)
        return jsonify({
            "registered": bool(row),
            "key_fingerprint": row.get("key_fingerprint") if row else None,
            "public_key_pem": row.get("public_key_pem") if row else None,
        })
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@app.route("/me/signing-key", methods=["POST"])
def register_signing_key():
    try:
        user = get_authenticated_user()
    except PermissionError as e:
        return jsonify({"error": str(e)}), 401

    data = request.json or {}
    public_key_pem = data.get("public_key_pem")
    if not public_key_pem:
        return jsonify({"error": "Missing public_key_pem"}), 400

    try:
        normalized_pem = normalize_pem_text(public_key_pem)
        RSA.import_key(normalized_pem)
        key_fingerprint = compute_public_key_fingerprint(normalized_pem)

        existing = fetch_registered_signing_key(user.id)
        payload = {
            "user_id": user.id,
            "public_key_pem": normalized_pem,
            "key_fingerprint": key_fingerprint,
            "updated_at": serialize_datetime_iso(utc_now()),
        }
        if existing:
            result = supabase_admin.table("user_signing_keys") \
                .update(payload) \
                .eq("user_id", user.id) \
                .execute()
        else:
            payload["created_at"] = serialize_datetime_iso(utc_now())
            result = supabase_admin.table("user_signing_keys") \
                .insert(payload) \
                .execute()

        return jsonify({
            "registered": True,
            "key_fingerprint": key_fingerprint,
            "record": result.data[0] if result.data else payload,
        })
    except Exception as exc:
        return jsonify({"error": str(exc)}), 400


@app.route("/me/upload-challenge", methods=["POST"])
def create_upload_challenge():
    try:
        user = get_authenticated_user()
    except PermissionError as e:
        return jsonify({"error": str(e)}), 401

    try:
        # TOFU: No need to check for existing key — it will register on first upload
        challenge_id = str(uuid.uuid4())
        nonce = secrets.token_hex(16)
        expires_at = utc_now() + datetime.timedelta(minutes=20)
        payload = {
            "id": challenge_id,
            "user_id": user.id,
            "nonce": nonce,
            "created_at": serialize_datetime_iso(utc_now()),
            "expires_at": serialize_datetime_iso(expires_at),
            "used_at": None,
        }
        supabase_admin.table("upload_challenges").insert(payload).execute()
        return jsonify({
            "challenge_id": challenge_id,
            "nonce": nonce,
            "expires_at": serialize_datetime_iso(expires_at),
        })
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@app.route("/uploads/<path:filename>", methods=["GET"])
def uploaded_asset(filename):
    return send_from_directory(UPLOAD_DIR, filename)


@app.route("/uploads/<folder>/<path:filename>", methods=["GET"])
def uploaded_asset_by_folder(folder, filename):
    if folder == "artworks":
        return send_from_directory(ARTWORK_UPLOAD_DIR, filename)
    if folder == "proofs":
        return send_from_directory(PROOF_UPLOAD_DIR, filename)
    return jsonify({"error": "Invalid upload folder"}), 404


# ------------------------
# CREATE ARTWORK
# ------------------------
@app.route("/create-artwork", methods=["POST"])
def create_artwork():
    data = request.json

    title = data.get("title")
    artist_id = data.get("artist_id")
    final_file_hash = data.get("hash")

    if not title or not artist_id or not final_file_hash:
        return jsonify({"error": "Missing fields"}), 400

    try:
        result = supabase.table("artworks").insert({
            "title": title,
            "artist_id": artist_id,
            "final_file_hash": final_file_hash
        }).execute()
        return jsonify(result.data), 201
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@app.route("/artworks/<artist_id>", methods=["GET"])
def get_artist_artworks(artist_id):
    try:
        user = get_authenticated_user()
    except PermissionError as e:
        return jsonify({"error": str(e)}), 401

    if user.id != artist_id:
        return jsonify({"error": "Forbidden"}), 403

    try:
        result = supabase_admin.table("artworks") \
            .select("*") \
            .eq("artist_id", artist_id) \
            .order("created_at", desc=True) \
            .execute()

        artworks = result.data or []
        if not artworks:
            return jsonify([])

        artwork_ids = [a["id"] for a in artworks]
        certs_result = supabase_admin.table("certificates") \
            .select("id, artwork_id, status, created_at, verified_at, rejection_reason, cert_data") \
            .in_("artwork_id", artwork_ids) \
            .order("created_at", desc=True) \
            .execute()

        latest_by_artwork = {}
        for cert in (certs_result.data or []):
            if cert["artwork_id"] not in latest_by_artwork:
                latest_by_artwork[cert["artwork_id"]] = cert

        enriched = []
        for artwork in artworks:
            cert = latest_by_artwork.get(artwork["id"], {})
            cert_data = parse_json_value(cert.get("cert_data")) or {}
            enriched.append({
                **artwork,
                "certificate_id": cert.get("id"),
                "certificate_status": cert.get("status", "pending"),
                "certificate_verified_at": cert.get("verified_at"),
                "certificate_rejection_reason": cert.get("rejection_reason"),
                "artwork_url": ((cert_data.get("artwork") or {}).get("url")),
            })

        return jsonify(enriched)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


# ------------------------
# SAVE SNAPSHOT (FROM GIMP)
# ------------------------
@app.route("/snapshots", methods=["POST"])
def save_snapshot():
    data = request.json

    artwork_id = data.get("artwork_id")
    screenshot_hash = data.get("screenshot_hash")
    step_number = data.get("step_number")

    if not artwork_id or not screenshot_hash:
        return jsonify({"error": "Missing fields"}), 400

    result = supabase.table("creation_snapshots").insert({
        "artwork_id": artwork_id,
        "screenshot_hash": screenshot_hash,
        "step_number": step_number
    }).execute()

    return jsonify(result.data), 201


# ------------------------
# CREATE CERTIFICATE
# ------------------------
@app.route("/create-certificate", methods=["POST"])
def create_certificate():
    data = request.json

    artwork_id = data.get("artwork_id")
    final_hash = data.get("hash")

    if not artwork_id or not final_hash:
        return jsonify({"error": "Missing fields"}), 400

    timestamp = str(datetime.datetime.utcnow())

    cert_hash = hashlib.sha256(
        f"{artwork_id}:{final_hash}:{timestamp}".encode()
    ).hexdigest()

    try:
        result = supabase.table("certificates").insert({
            "artwork_id": artwork_id,
            "certificate_hash": cert_hash,
            "status": "pending"
        }).execute()
        return jsonify(result.data), 201
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


# ------------------------
# GET CERTIFICATE
# ------------------------
@app.route("/certificate/<certificate_id>", methods=["GET"])
def get_certificate(certificate_id):
    result = supabase.table("certificates") \
        .select("*") \
        .eq("id", certificate_id) \
        .single() \
        .execute()

    return jsonify(result.data)

# ------------------------
# VERIFY
# ------------------------
@app.route("/verify", methods=["GET"])
def verify():
    hash = request.args.get("hash")
    if not hash:
        return jsonify({"error": "Missing hash"}), 400

    try:
        result = supabase.table("artworks") \
            .select("*") \
            .eq("final_file_hash", hash) \
            .execute()
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500

    if result.data:
        artwork = result.data[0]
        return jsonify({
            "verified": True,
            "title": artwork["title"],
            "artist_id": artwork["artist_id"],
            "registered": artwork["created_at"]
        })
    return jsonify({"verified": False}), 404


# ------------------------
# RECENT VERIFIED — public
# ------------------------
@app.route("/recent-verified", methods=["GET"])
def recent_verified():
    try:
        certs = supabase_admin.table("certificates") \
            .select("artwork_id, verified_at, cert_data") \
            .eq("status", "verified") \
            .order("verified_at", desc=True) \
            .limit(5) \
            .execute()

        if not certs.data:
            return jsonify([])

        artwork_ids = [c["artwork_id"] for c in certs.data]

        artworks = supabase_admin.table("artworks") \
            .select("id, title, final_file_hash") \
            .in_("id", artwork_ids) \
            .execute()

        artwork_map = {a["id"]: a for a in (artworks.data or [])}

        result = []
        for cert in certs.data:
            art = artwork_map.get(cert["artwork_id"])
            cert_data = parse_json_value(cert.get("cert_data")) or {}
            if art:
                result.append({
                    "title": art["title"],
                    "hash": art["final_file_hash"],
                    "verified_at": cert["verified_at"],
                    "artwork_url": ((cert_data.get("artwork") or {}).get("url")),
                })

        return jsonify(result)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


# ------------------------
# ADMIN — list pending certificates
# ------------------------
@app.route("/admin/certificates", methods=["GET"])
def admin_list_certificates():
    try:
        admin = get_admin_user()
    except PermissionError as e:
        return jsonify({"error": str(e)}), 403

    try:
        certs_result = supabase_admin.table("certificates") \
            .select("*") \
            .order("created_at", desc=True) \
            .execute()

        certs = certs_result.data or []
        if not certs:
            return jsonify([])

        artwork_ids = [c.get("artwork_id") for c in certs if c.get("artwork_id")]
        artworks_result = supabase_admin.table("artworks") \
            .select("id, title, artist_id, final_file_hash, created_at") \
            .in_("id", artwork_ids) \
            .execute()

        artwork_map = {a["id"]: a for a in (artworks_result.data or [])}
        merged = []
        for cert in certs:
            merged.append({
                **cert,
                "artworks": artwork_map.get(cert.get("artwork_id"), {}),
            })

        return jsonify(merged)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


# ------------------------
# ADMIN — certificate detail view
# ------------------------
@app.route("/admin/certificates/<certificate_id>", methods=["GET"])
def admin_certificate_detail(certificate_id):
    try:
        get_admin_user()
    except PermissionError as e:
        return jsonify({"error": str(e)}), 403

    try:
        cert_result = supabase_admin.table("certificates") \
            .select("*") \
            .eq("id", certificate_id) \
            .single() \
            .execute()
        cert = cert_result.data
        if not cert:
            return jsonify({"error": "Certificate not found"}), 404
        return jsonify(build_certificate_detail_payload(cert))
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@app.route("/certificates/<certificate_id>/detail", methods=["GET"])
def owner_certificate_detail(certificate_id):
    try:
        user = get_authenticated_user()
    except PermissionError as e:
        return jsonify({"error": str(e)}), 401

    try:
        cert_result = supabase_admin.table("certificates") \
            .select("*") \
            .eq("id", certificate_id) \
            .single() \
            .execute()
        cert = cert_result.data
        if not cert:
            return jsonify({"error": "Certificate not found"}), 404

        payload = build_certificate_detail_payload(cert)
        artwork = payload.get("artwork") or {}
        if artwork.get("artist_id") != user.id:
            return jsonify({"error": "Forbidden"}), 403

        return jsonify(payload)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


# ------------------------
# ADMIN — verify a certificate
# ------------------------
@app.route("/admin/certificates/<certificate_id>/verify", methods=["POST"])
def admin_verify_certificate(certificate_id):
    try:
        admin = get_admin_user()
    except PermissionError as e:
        return jsonify({"error": str(e)}), 403

    try:
        result = supabase_admin.table("certificates") \
            .update({
                "status": "verified",
                "verified_by": admin.id,
                "verified_at": datetime.datetime.utcnow().isoformat()
            }) \
            .eq("id", certificate_id) \
            .execute()
        return jsonify(result.data)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


# ------------------------
# ADMIN — reject a certificate
# ------------------------
@app.route("/admin/certificates/<certificate_id>/reject", methods=["POST"])
def admin_reject_certificate(certificate_id):
    try:
        get_admin_user()
    except PermissionError as e:
        return jsonify({"error": str(e)}), 403

    try:
        cert_result = supabase_admin.table("certificates") \
            .select("*") \
            .eq("id", certificate_id) \
            .single() \
            .execute()
        cert = cert_result.data
        if not cert:
            return jsonify({"error": "Certificate not found"}), 404

        cert_data = parse_json_value(cert.get("cert_data")) or {}
        artwork_asset_url = ((cert_data.get("artwork") or {}).get("url"))
        proof_asset_url = ((cert_data.get("proof") or {}).get("url"))

        artwork_id = cert.get("artwork_id")
        if artwork_id:
            supabase_admin.table("artworks") \
                .delete() \
                .eq("id", artwork_id) \
                .execute()

        # Explicit certificate delete in case FK cascade is missing.
        supabase_admin.table("certificates") \
            .delete() \
            .eq("id", certificate_id) \
            .execute()

        delete_local_upload_asset(artwork_asset_url)
        delete_local_upload_asset(proof_asset_url)

        return jsonify({"deleted": True, "certificate_id": certificate_id, "artwork_id": artwork_id})
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


# --------------------------------
# ACCOUNT — Reset signing key
# --------------------------------
@app.route("/account/signing-key/reset-request", methods=["POST"])
def request_signing_key_reset():
    try:
        user = get_authenticated_user()
    except PermissionError as e:
        return jsonify({"error": str(e)}), 401

    try:
        # Generate reset token
        token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        expires_at = utc_now() + datetime.timedelta(minutes=15)

        # Store token in database
        supabase_admin.table("key_reset_tokens").insert({
            "user_id": user.id,
            "token_hash": token_hash,
            "expires_at": serialize_datetime_iso(expires_at),
        }).execute()

        # Send email via Resend
        resend_api_key = os.getenv("RESEND_API_KEY")
        if not resend_api_key:
            return jsonify({"error": "Email service not configured"}), 500

        resend.api_key = resend_api_key
        reset_url = f"{request.host_url.rstrip('/')}/#/reset-key?token={token}"
        
        try:
            resend.Emails.send({
                "from": "noreply@registra.app",
                "to": user.email,
                "subject": "Reset your Registra signing key",
                "html": f"""<p>Click the link below to reset your signing key (expires in 15 minutes):</p>
<p><a href="{reset_url}">{reset_url}</a></p>
<p>If you didn't request this, ignore this email.</p>""",
            })
        except Exception as exc:
            return jsonify({"error": f"Failed to send email: {exc}"}), 500

        return jsonify({"message": "Reset email sent to your registered email address"})
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@app.route("/account/signing-key/reset-confirm", methods=["POST"])
def confirm_signing_key_reset():
    data = request.get_json() or {}
    token = data.get("token", "").strip()
    
    if not token:
        return jsonify({"error": "Missing reset token"}), 400

    try:
        token_hash = hashlib.sha256(token.encode()).hexdigest()

        # Find token in database
        result = supabase_admin.table("key_reset_tokens") \
            .select("*") \
            .eq("token_hash", token_hash) \
            .single() \
            .execute()
        token_record = result.data
        if not token_record:
            return jsonify({"error": "Invalid or expired reset token"}), 400

        # Check if already used
        if token_record.get("used_at"):
            return jsonify({"error": "Reset token has already been used"}), 400

        # Check expiry
        expires_at = parse_datetime_value(token_record.get("expires_at"))
        if not expires_at or expires_at < utc_now():
            return jsonify({"error": "Reset token has expired"}), 400

        user_id = token_record.get("user_id")

        # Delete the old signing key
        supabase_admin.table("user_signing_keys") \
            .delete() \
            .eq("user_id", user_id) \
            .execute()

        # Mark token as used
        supabase_admin.table("key_reset_tokens") \
            .update({"used_at": serialize_datetime_iso(utc_now())}) \
            .eq("id", token_record.get("id")) \
            .execute()

        return jsonify({"message": "Signing key has been reset. Your next upload will register a new key."})
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


# ------------------------
# RUN SERVER
# ------------------------
if __name__ == "__main__":
    print("Starting Flask server...")
    app.run(debug=True, port=5000)