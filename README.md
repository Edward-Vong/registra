# Registra

Registra is a full-stack art-authorship platform for creators who want stronger proof of ownership.
It combines a GIMP proof-of-process plugin, cryptographic certificate verification, account-bound signing keys, and reverse image search tools.

## What You Can Do

- Register artwork with a certificate generated from your creation workflow.
- Validate certificate signatures and hash integrity during upload.
- Use one-time upload challenges to reduce replay abuse.
- Track your portfolio in a creator dashboard.
- Run reverse image search for uploaded files and registered artwork.
- Publish verified work in a public gallery.
- View public artist profiles (with socials).
- Perform admin moderation for certificate verification/rejection.

## Project Structure

```text
registra/
	backend/              Flask API + Supabase integration
		app.py
		supabase_client.py
		requirements.txt
		uploads/
			artworks/
			proofs/
	frontend/             Vite frontend (JS/JSX)
		src/
			pages/
			components/
			context/
			api.js
			supabase.js
		vite.config.js
	gimp_plugin/          Proof of Process plugin for GIMP 3.2
		proof_of_process.py
		README.md
	README.md
```

## Tech Stack

- Frontend: Vite, React Router, Supabase JS client
- Backend: Flask, Flask-CORS, Supabase Python client, PyCryptodome
- Auth + Data: Supabase Auth and Postgres tables via Supabase API
- External services: ImgBB + SerpApi for reverse image search, Resend for key reset email

## Prerequisites

- Node.js 20+
- Python 3.10+
- Supabase project (URL, anon key, service role key)
- Optional but recommended for full feature set:
	- ImgBB API key
	- SerpApi API key
	- Resend API key

## Environment Variables

Use a single root-level .env file. The frontend is configured to read env vars from repo root via frontend/vite.config.js.

Create .env at repository root:

```env
# Supabase (backend)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-or-server-key
SUPABASE_SERVICE_KEY=your-supabase-service-role-key

# Supabase (frontend)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Frontend -> backend API base
VITE_API_BASE_URL=http://localhost:5000

# Reverse image search
IMGBB_KEY=your-imgbb-key
SERPAPI_KEY=your-serpapi-key

# Email for signing key reset
RESEND_API_KEY=your-resend-key
```

Notes:

- If IMGBB_KEY or SERPAPI_KEY are missing, reverse image search endpoints will return an error.
- If RESEND_API_KEY is missing, signing key reset emails cannot be sent.

## Local Development

### 1. Backend

```bash
cd backend
python -m venv .venv

# Windows PowerShell
.venv\Scripts\Activate.ps1

# macOS/Linux
# source .venv/bin/activate

pip install -r requirements.txt
python app.py
```

Backend runs on:

- http://localhost:5000

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on Vite default:

- http://localhost:5173

## Main Frontend Routes

- / home
- /about about and trust model
- /gallery public verified gallery
- /artist/:username public artist profile
- /api API information page
- /dashboard creator dashboard (verified users)
- /upload upload and certify flow (verified users)
- /reversesearch reverse image search (verified users)
- /portfolio/:certificateId artwork detail (verified users)
- /admin moderation panel (admin users)

## Main Backend Endpoints

- GET /health
- POST /register-with-cert
- POST /me/upload-challenge
- GET/POST /me/signing-key
- GET /gallery/verified
- GET /artists/:username
- POST /reverse-search
- POST /certificates/:certificate_id/reverse-search
- GET /admin/certificates
- POST /admin/certificates/:certificate_id/verify
- POST /admin/certificates/:certificate_id/reject

## GIMP Plugin

The plugin lives in gimp_plugin/ and exports artwork + certificate data used in registration.

See gimp_plugin/README.md for installation and usage.

## Typical Workflow

1. Generate/upload challenge from Upload page.
2. Export artwork + certificate from GIMP plugin.
3. Upload artwork, certificate, and proof file in Upload page.
4. Backend verifies challenge, hash, signature, and signing key constraints.
5. Artwork appears in dashboard and can be reverse-searched.
6. Verified works can appear in public gallery and artist profile pages.

## Troubleshooting

- Reverse search fails immediately:
	- Confirm IMGBB_KEY and SERPAPI_KEY are set in root .env.
- Upload challenge mismatch:
	- Regenerate challenge and export a fresh certificate with that exact challenge.
- Frontend cannot call backend:
	- Check VITE_API_BASE_URL in root .env and ensure Flask is running.
- Supabase auth or data errors:
	- Verify SUPABASE_URL, SUPABASE_KEY, SUPABASE_SERVICE_KEY, and VITE_SUPABASE_* values.

## License

Add your license here (for example MIT, Apache-2.0, or proprietary).