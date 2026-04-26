#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import gi
import sys
import os
import hashlib
import json
import base64
import datetime

# 1. SETUP PATHS BEFORE IMPORTS
# This ensures GIMP's Python can find your bundled dependencies
plugin_dir = os.path.dirname(os.path.abspath(__file__))
site_packages_path = os.path.join(plugin_dir, "site-packages")
if site_packages_path not in sys.path:
    sys.path.insert(0, site_packages_path)

# 2. RESILIENT IMPORT LOADING
# We wrap these to prevent the "silent failure" during GIMP's startup scan
try:
    gi.require_version("Gimp", "3.0")
    gi.require_version("Gio", "2.0")
    from gi.repository import Gimp, GObject, GLib, Gio

    # Try to load cryptographic dependencies
    from Crypto.PublicKey import RSA
    from Crypto.Signature import PKCS1_v1_5
    from Crypto.Hash import SHA256
    HAS_DEPS = True
    DEP_ERROR = ""
except Exception as e:
    HAS_DEPS = False
    DEP_ERROR = str(e)

PLUGIN_PROC = "plug-in-export-with-authenticity"
PLUGIN_BINARY = "proof-of-process"
KEY_DIR_NAME = ".gimp_proof_of_process"
PRIVATE_KEY_FILE = "private_key.pem"
PUBLIC_KEY_FILE = "public_key.pem"

# --- Helper Functions ---

def _key_dir():
    return os.path.join(os.path.expanduser("~"), KEY_DIR_NAME)

def _key_paths():
    d = _key_dir()
    return os.path.join(d, PRIVATE_KEY_FILE), os.path.join(d, PUBLIC_KEY_FILE)

def _ensure_keys():
    key_dir = _key_dir()
    private_path, public_path = _key_paths()
    if not os.path.exists(key_dir):
        os.makedirs(key_dir)
    if os.path.exists(private_path) and os.path.exists(public_path):
        with open(private_path, "rb") as f: private_pem = f.read()
        with open(public_path, "rb") as f: public_pem = f.read()
        return private_pem, public_pem
    
    key = RSA.generate(2048)
    private_pem = key.export_key("PEM")
    public_pem = key.publickey().export_key("PEM")
    with open(private_path, "wb") as f: f.write(private_pem)
    with open(public_path, "wb") as f: f.write(public_pem)
    return private_pem, public_pem

def _normalize_output_file(output_file):
    """Ensure the output file has a .png extension."""
    path = output_file.get_path()
    if not path.lower().endswith(".png"):
        path = path + ".png"
        return Gio.File.new_for_path(path)
    return output_file


def _export_flattened_png(image, output_file):
    dup = image.duplicate()
    try:
        dup.merge_visible_layers(Gimp.MergeType.CLIP_TO_IMAGE)
        Gimp.file_save(Gimp.RunMode.NONINTERACTIVE, dup, output_file, None)
    finally:
        dup.delete()

# --- Certificate Helpers ---

def _normalize_pem_text(pem):
    if isinstance(pem, bytes):
        pem = pem.decode("utf-8")
    return pem.replace("\r\n", "\n").strip() + "\n"

def _key_fingerprint(public_pem):
    return hashlib.sha256(_normalize_pem_text(public_pem).encode("utf-8")).hexdigest()

def _canonical_json_bytes(payload):
    return json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")

def _sign_payload(private_pem, payload):
    key = RSA.import_key(private_pem)
    signer = PKCS1_v1_5.new(key)
    digest = SHA256.new(_canonical_json_bytes(payload))
    return base64.b64encode(signer.sign(digest)).decode("ascii")

# --- Main Execution Logic ---

def _run_export(procedure, image, output_file, challenge_id, challenge_nonce):
    try:
        if not HAS_DEPS:
            raise RuntimeError(f"Dependencies missing: {DEP_ERROR}. Check your site-packages folder.")

        if not challenge_id or not challenge_nonce:
            raise RuntimeError("Challenge ID and Challenge Nonce are required. Get them from the web app upload screen.")

        if output_file is None:
            output_file = Gio.File.new_for_path(os.path.join(os.path.expanduser("~"), "exported_artwork.png"))

        output_file = _normalize_output_file(output_file)
        output_path = output_file.get_path()

        private_pem, public_pem = _ensure_keys()
        _export_flattened_png(image, output_file)

        with open(output_path, "rb") as f:
            png_bytes = f.read()

        image_hash = hashlib.sha256(png_bytes).hexdigest()
        timestamp = datetime.datetime.utcnow().replace(microsecond=0).isoformat() + "Z"
        fingerprint = _key_fingerprint(public_pem)

        signed_payload = {
            "image_hash": image_hash,
            "challenge_id": challenge_id,
            "challenge_nonce": challenge_nonce,
            "timestamp_utc": timestamp,
            "image_file": os.path.basename(output_path),
            "key_fingerprint": fingerprint,
        }

        signature_b64 = _sign_payload(private_pem, signed_payload)

        cert_data = {
            "version": "2.0",
            "plugin": "Proof of Process",
            "hash_algorithm": "SHA-256",
            "signature_algorithm": "RSA-PKCS1-v1_5",
            "timestamp_utc": timestamp,
            "image_file": os.path.basename(output_path),
            "image_hash": image_hash,
            "challenge_id": challenge_id,
            "challenge_nonce": challenge_nonce,
            "key_fingerprint": fingerprint,
            "signature": signature_b64,
            "public_key_pem": _normalize_pem_text(public_pem),
            "signed_payload": signed_payload,
        }

        cert_path = os.path.join(os.path.dirname(output_path), "certificate.json")
        with open(cert_path, "w", encoding="utf-8") as f:
            json.dump(cert_data, f, indent=2, sort_keys=True)

        Gimp.message(f"Success!\nPNG: {output_path}\nCertificate: {cert_path}")
        return procedure.new_return_values(Gimp.PDBStatusType.SUCCESS, None)

    except Exception as e:
        return procedure.new_return_values(Gimp.PDBStatusType.EXECUTION_ERROR, GLib.Error(str(e)))

def export_with_authenticity_run(procedure, run_mode, image, drawables, config, run_data):
    if run_mode == Gimp.RunMode.INTERACTIVE:
        gi.require_version("GimpUi", "3.0")
        from gi.repository import GimpUi
        GimpUi.init(PLUGIN_BINARY)
        dialog = GimpUi.ProcedureDialog.new(procedure, config, "Export with Authenticity")
        dialog.fill(["output-png-file", "challenge-id", "challenge-nonce"])
        if not dialog.run():
            dialog.destroy()
            return procedure.new_return_values(Gimp.PDBStatusType.CANCEL, None)
        dialog.destroy()

    output_file = config.get_property("output-png-file")
    challenge_id = config.get_property("challenge-id") or ""
    challenge_nonce = config.get_property("challenge-nonce") or ""
    return _run_export(procedure, image, output_file, challenge_id, challenge_nonce)

class ProofOfProcessPlugin(Gimp.PlugIn):
    def do_query_procedures(self):
        return [PLUGIN_PROC]

    def do_create_procedure(self, name):
        if name == PLUGIN_PROC:
            procedure = Gimp.ImageProcedure.new(self, name, Gimp.PDBProcType.PLUGIN, export_with_authenticity_run, None)
            procedure.set_image_types("*")
            procedure.set_sensitivity_mask(
                Gimp.ProcedureSensitivityMask.DRAWABLE | Gimp.ProcedureSensitivityMask.NO_DRAWABLES
            )
            procedure.set_menu_label("Export with Authenticity...")
            procedure.add_menu_path("<Image>/File")
            procedure.set_documentation(
                "Export PNG and certificate.json with RSA signature",
                "Hashes the exported PNG and proof file, signs a canonical payload, and writes certificate.json.",
                None,
            )
            procedure.set_attribution("Registra", "Registra", "2026")
            procedure.add_file_argument(
                "output-png-file", "Output PNG", "PNG export target",
                Gimp.FileChooserAction.SAVE, False, None, GObject.ParamFlags.READWRITE,
            )
            procedure.add_string_argument(
                "challenge-id", "Challenge ID", "Challenge ID from the web app upload screen",
                "", GObject.ParamFlags.READWRITE,
            )
            procedure.add_string_argument(
                "challenge-nonce", "Challenge nonce", "Challenge nonce from the web app upload screen",
                "", GObject.ParamFlags.READWRITE,
            )
            return procedure
        return None

Gimp.main(ProofOfProcessPlugin.__gtype__, sys.argv)