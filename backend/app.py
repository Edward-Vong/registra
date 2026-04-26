from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase_client import supabase
import hashlib
import datetime
import requests as req
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


# ------------------------
# HOME ROUTE (TEST)
# ------------------------
@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Backend is running"})


# ------------------------
# REVERSE SEARCH
# ------------------------
@app.route("/reverse-search", methods=["POST", "OPTIONS"])
def reverse_search():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    image_url = request.json.get("image_url")
    if not image_url:
        return jsonify({"error": "Missing image_url"}), 400

    response = req.get("https://serpapi.com/search", params={
        "engine": "google_reverse_image",
        "image_url": image_url,
        "api_key": os.getenv("SERPAPI_KEY")
    })

    return jsonify(response.json())


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

    result = supabase.table("artworks").insert({
        "title": title,
        "artist_id": artist_id,
        "final_file_hash": final_file_hash
    }).execute()

    return jsonify(result.data), 201


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

    result = supabase.table("certificates").insert({
        "artwork_id": artwork_id,
        "certificate_hash": cert_hash,
        "status": "pending"
    }).execute()

    return jsonify(result.data), 201


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

    result = supabase.table("artworks") \
        .select("*") \
        .eq("final_file_hash", hash) \
        .execute()

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
# RUN SERVER
# ------------------------
if __name__ == "__main__":
    print("Starting Flask server...")
    app.run(debug=True, port=5000)