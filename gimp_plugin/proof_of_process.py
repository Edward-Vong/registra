#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Proof of Process - GIMP 3.x Python plugin

Exports a flattened PNG and a local certificate.json containing:
- SHA-256 hash of the exported image bytes
- RSA signature of the image bytes hash
- Public key
- Timestamp (UTC ISO8601)

Tested target:
- GIMP 3.2 (Python 3)

Dependency:
- PyCryptodome exposing `Crypto.*` modules
"""

import gi
gi.require_version("Gimp", "3.0")
gi.require_version("Gio", "2.0")

from gi.repository import Gimp
from gi.repository import GObject
from gi.repository import GLib
from gi.repository import Gio

import base64
import hashlib
import json
import os
import datetime
import sys

# Add bundled site-packages to path (use absolute path)
plugin_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(plugin_dir, "site-packages"))

try:
    from Crypto.PublicKey import RSA
    from Crypto.Signature import PKCS1_v1_5
    from Crypto.Hash import SHA256
except ImportError as e:
    print(f"[proof_of_process] Import error: {e}")
    print(f"[proof_of_process] sys.path: {sys.path}")
    raise

PLUGIN_PROC = "plug-in-export-with-authenticity"
PLUGIN_BINARY = "proof-of-process"
KEY_DIR_NAME = ".gimp_proof_of_process"
PRIVATE_KEY_FILE = "private_key.pem"
PUBLIC_KEY_FILE = "public_key.pem"


def _key_dir():
    home = os.path.expanduser("~")
    return os.path.join(home, KEY_DIR_NAME)


def _key_paths():
    d = _key_dir()
    return (
        os.path.join(d, PRIVATE_KEY_FILE),
        os.path.join(d, PUBLIC_KEY_FILE),
    )


def _read_binary(path):
    f = open(path, "rb")
    try:
        return f.read()
    finally:
        f.close()


def _write_binary(path, data):
    f = open(path, "wb")
    try:
        f.write(data)
    finally:
        f.close()


def _write_text(path, data):
    f = open(path, "w", encoding="utf-8")
    try:
        f.write(data)
    finally:
        f.close()


def _rsa_export(key_obj):
    if hasattr(key_obj, "export_key"):
        return key_obj.export_key("PEM")
    return key_obj.exportKey("PEM")


def _rsa_import(private_pem):
    if hasattr(RSA, "import_key"):
        return RSA.import_key(private_pem)
    return RSA.importKey(private_pem)


def _ensure_keys():
    key_dir = _key_dir()
    private_path, public_path = _key_paths()

    if not os.path.exists(key_dir):
        os.makedirs(key_dir)

    if os.path.exists(private_path) and os.path.exists(public_path):
        private_pem = _read_binary(private_path)
        public_pem = _read_binary(public_path)
        return private_pem, public_pem

    key = RSA.generate(2048)
    private_pem = _rsa_export(key)
    public_pem = _rsa_export(key.publickey())

    _write_binary(private_path, private_pem)
    _write_binary(public_path, public_pem)

    return private_pem, public_pem


def _as_text(value):
    if isinstance(value, bytes):
        return value.decode("utf-8")
    return value


def _normalize_output_file(output_file):
    if output_file is None:
        return None

    path = output_file.get_path()
    if not path:
        raise RuntimeError("Please choose a local filesystem path for PNG export.")

    if not path.lower().endswith(".png"):
        path = path + ".png"
        return Gio.File.new_for_path(path)

    return output_file


def _hash_bytes(data):
    h = hashlib.sha256()
    h.update(data)
    return h.hexdigest()


def _canonical_json_bytes(payload):
    return json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")


def _sign_payload(private_pem, payload):
    key = _rsa_import(private_pem)
    signer = PKCS1_v1_5.new(key)
    digest = SHA256.new(_canonical_json_bytes(payload))
    signature = signer.sign(digest)
    return base64.b64encode(signature).decode("ascii")


def _utc_timestamp():
    return datetime.datetime.utcnow().replace(microsecond=0).isoformat() + "Z"


def _normalize_pem_text(public_pem):
    return _as_text(public_pem).replace("\r\n", "\n").strip() + "\n"


def _key_fingerprint(public_pem):
    return hashlib.sha256(_normalize_pem_text(public_pem).encode("utf-8")).hexdigest()


def _build_signed_payload(image_hash, proof_hash, challenge_id, challenge_nonce, png_path, proof_path, public_pem):
    return {
        "image_hash": image_hash,
        "proof_hash": proof_hash,
        "challenge_id": challenge_id,
        "challenge_nonce": challenge_nonce,
        "timestamp_utc": _utc_timestamp(),
        "image_file": os.path.basename(png_path),
        "proof_file": os.path.basename(proof_path) if proof_path else None,
        "key_fingerprint": _key_fingerprint(public_pem),
    }


def _build_certificate_dict(image_hash, proof_hash, signature_b64, public_pem, png_path, proof_path, challenge_id, challenge_nonce, signed_payload):
    return {
        "version": "2.0",
        "plugin": "Proof of Process",
        "hash_algorithm": "SHA-256",
        "signature_algorithm": "RSA-PKCS1-v1_5",
        "timestamp_utc": signed_payload["timestamp_utc"],
        "image_file": os.path.basename(png_path),
        "image_hash": image_hash,
        "proof_file": os.path.basename(proof_path) if proof_path else None,
        "proof_hash": proof_hash,
        "challenge_id": challenge_id,
        "challenge_nonce": challenge_nonce,
        "key_fingerprint": _key_fingerprint(public_pem),
        "signature": signature_b64,
        "public_key_pem": _normalize_pem_text(public_pem),
        "signed_payload": signed_payload,
    }


def _write_certificate(output_png_path, cert_data):
    cert_path = os.path.join(os.path.dirname(output_png_path), "certificate.json")
    text = json.dumps(cert_data, indent=2, sort_keys=True)
    _write_text(cert_path, text)
    return cert_path


def _default_output_file(image):
    source_file = image.get_file()
    home_dir = os.path.expanduser("~")

    if source_file is not None:
        src_path = source_file.get_path()
        if src_path:
            folder = os.path.dirname(src_path)
            stem = os.path.splitext(os.path.basename(src_path))[0] or "artwork"
            return Gio.File.new_for_path(os.path.join(folder, stem + "_authenticity.png"))

        src_name = source_file.get_basename()
        stem = os.path.splitext(src_name)[0] if src_name else "artwork"
        return Gio.File.new_for_path(os.path.join(home_dir, stem + "_authenticity.png"))

    image_name = image.get_name() or "artwork"
    stem = os.path.splitext(image_name)[0]
    return Gio.File.new_for_path(os.path.join(home_dir, stem + "_authenticity.png"))


def _export_flattened_png(image, output_file):
    dup = image.duplicate()
    try:
        dup.undo_disable()
        dup.merge_visible_layers(Gimp.MergeType.CLIP_TO_IMAGE)
        success = Gimp.file_save(Gimp.RunMode.NONINTERACTIVE, dup, output_file, None)
        if not success:
            raise RuntimeError("GIMP failed to export PNG.")
    finally:
        dup.delete()


def _run_export(procedure, image, output_file, proof_file, challenge_id, challenge_nonce):
    try:
        output_file = _normalize_output_file(output_file)
        if output_file is None:
            output_file = _default_output_file(image)

        output_path = output_file.get_path()
        if not output_path:
            raise RuntimeError("Could not resolve a local PNG path.")

        proof_path = proof_file.get_path() if proof_file is not None else None
        if not proof_path:
            raise RuntimeError("Please choose a proof file to bind into the certificate.")
        if not challenge_id or not challenge_nonce:
            raise RuntimeError("Challenge ID and challenge nonce are required.")

        private_pem, public_pem = _ensure_keys()

        _export_flattened_png(image, output_file)

        png_bytes = _read_binary(output_path)
        proof_bytes = _read_binary(proof_path)
        image_hash = _hash_bytes(png_bytes)
        proof_hash = _hash_bytes(proof_bytes)
        signed_payload = _build_signed_payload(
            image_hash=image_hash,
            proof_hash=proof_hash,
            challenge_id=challenge_id,
            challenge_nonce=challenge_nonce,
            png_path=output_path,
            proof_path=proof_path,
            public_pem=public_pem,
        )
        signature_b64 = _sign_payload(private_pem, signed_payload)

        cert_data = _build_certificate_dict(
            image_hash=image_hash,
            proof_hash=proof_hash,
            signature_b64=signature_b64,
            public_pem=public_pem,
            png_path=output_path,
            proof_path=proof_path,
            challenge_id=challenge_id,
            challenge_nonce=challenge_nonce,
            signed_payload=signed_payload,
        )
        cert_path = _write_certificate(output_path, cert_data)

        Gimp.message("Export complete.\nPNG: {0}\nCertificate: {1}".format(output_path, cert_path))
        return procedure.new_return_values(Gimp.PDBStatusType.SUCCESS, None)

    except Exception as e:
        return procedure.new_return_values(Gimp.PDBStatusType.EXECUTION_ERROR, GLib.Error(str(e)))


def export_with_authenticity_run(procedure, run_mode, image, drawables, config, run_data):
    if run_mode == Gimp.RunMode.INTERACTIVE:
        gi.require_version("GimpUi", "3.0")
        from gi.repository import GimpUi

        GimpUi.init(PLUGIN_BINARY)
        if config.get_property("output-png-file") is None:
            config.set_property("output-png-file", _default_output_file(image))

        dialog = GimpUi.ProcedureDialog.new(procedure, config, "Export with Authenticity")
        dialog.fill(["output-png-file", "proof-file", "challenge-id", "challenge-nonce"])
        if not dialog.run():
            dialog.destroy()
            return procedure.new_return_values(Gimp.PDBStatusType.CANCEL, None)
        dialog.destroy()

    output_file = config.get_property("output-png-file")
    proof_file = config.get_property("proof-file")
    challenge_id = config.get_property("challenge-id")
    challenge_nonce = config.get_property("challenge-nonce")
    return _run_export(procedure, image, output_file, proof_file, challenge_id, challenge_nonce)


class ProofOfProcessPlugin(Gimp.PlugIn):
    def do_query_procedures(self):
        return [PLUGIN_PROC]

    def do_create_procedure(self, name):
        procedure = None
        if name == PLUGIN_PROC:
            procedure = Gimp.ImageProcedure.new(
                self,
                name,
                Gimp.PDBProcType.PLUGIN,
                export_with_authenticity_run,
                None,
            )
            procedure.set_image_types("*")
            procedure.set_sensitivity_mask(
                Gimp.ProcedureSensitivityMask.DRAWABLE
                | Gimp.ProcedureSensitivityMask.NO_DRAWABLES
            )
            procedure.set_menu_label("Export with Authenticity...")
            procedure.add_menu_path("<Image>/File")
            procedure.set_documentation(
                "Export PNG and certificate.json with local cryptographic signature",
                "Generates local RSA keys on first run, hashes exported PNG bytes, signs the hash, and writes certificate.json.",
                None,
            )
            procedure.set_attribution("Hackathon Prototype", "Hackathon Prototype", "2026")
            procedure.add_file_argument(
                "output-png-file",
                "Output PNG file",
                "PNG export target",
                Gimp.FileChooserAction.SAVE,
                False,
                None,
                GObject.ParamFlags.READWRITE,
            )
            procedure.add_file_argument(
                "proof-file",
                "Proof file",
                "Proof asset to bind into the certificate",
                Gimp.FileChooserAction.OPEN,
                False,
                None,
                GObject.ParamFlags.READWRITE,
            )
            procedure.add_string_argument(
                "challenge-id",
                "Challenge ID",
                "Challenge ID from the web app upload screen",
                None,
                GObject.ParamFlags.READWRITE,
            )
            procedure.add_string_argument(
                "challenge-nonce",
                "Challenge nonce",
                "Challenge nonce from the web app upload screen",
                None,
                GObject.ParamFlags.READWRITE,
            )
        return procedure


Gimp.main(ProofOfProcessPlugin.__gtype__, sys.argv)
