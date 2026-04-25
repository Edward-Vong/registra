# Proof of Process GIMP Plugin (GIMP 3.2)

This folder contains a local-first GIMP plugin that exports:

- `your_artwork.png`
- `certificate.json` (same folder)

The certificate includes:

- SHA-256 hash of exported PNG bytes
- RSA signature (base64)
- Public key (PEM)
- UTC timestamp

## Files

- `proof_of_process.py` - GIMP 3 Python plugin script

## GIMP 3.2 Setup (Python 3)

1. Install `pycryptodome` into the Python environment used by GIMP 3.2.
2. Create a plugin folder named `proof_of_process` in your user plug-ins directory.
3. Place `proof_of_process.py` inside that folder.
4. On Windows, a typical location is:
   - `%APPDATA%\\GIMP\\3.0\\plug-ins\\proof_of_process\\proof_of_process.py`
5. Ensure executable permission on Linux/macOS (`chmod u+x proof_of_process.py`).
6. Restart GIMP.

## Usage

1. Open an image in GIMP.
2. Click **File > Export with Authenticity...**
3. Choose output path (PNG) in the plugin dialog.
4. Plugin exports PNG and writes `certificate.json` next to it.

On first run, RSA keys are generated and stored locally in:

- `~/.gimp_proof_of_process/private_key.pem`
- `~/.gimp_proof_of_process/public_key.pem`

## Notes

- Entirely local: no network calls, no cloud APIs.
- Hash/signature are tied to the exact exported PNG bytes.
- Plugin uses the GIMP 3 GI API (`gi.repository`) and will not run on GIMP 2.10.
