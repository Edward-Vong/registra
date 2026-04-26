from supabase import create_client
import os
from dotenv import load_dotenv
from pathlib import Path

# Load .env from root directory
root_dir = Path(__file__).parent.parent
load_dotenv(root_dir / '.env')

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
service_key = os.getenv("SUPABASE_SERVICE_KEY")

supabase = create_client(url, key)

# Service role client — bypasses RLS, used only for server-side admin checks
supabase_admin = create_client(url, service_key) if service_key else supabase