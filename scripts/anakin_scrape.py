import os
import sys
import time
import json
import httpx

PUBLIC_APP_URL = "https://shaggy-lions-lead.loca.lt"

def run_scrape(api_key: str, target_url: str = PUBLIC_APP_URL):
    print("=" * 60)
    print(f"🚀 [ANAKIN.IO] SUBMITTING SCRAPE JOB FOR: {target_url}")
    print("=" * 60)

    headers = {
        "X-API-Key": api_key,
        "Content-Type": "application/json"
    }

    payload = {
        "url": target_url,
        "country": "us",
        "formats": ["markdown", "html", "cleanedHtml"]
    }

    # Step 1: Submit Scrape Job
    with httpx.Client(timeout=30.0) as client:
        res = client.post("https://api.anakin.io/v1/url-scraper", json=payload, headers=headers)
        
        if res.status_code != 200:
            print(f"❌ Failed to submit job ({res.status_code}): {res.text}")
            return None
        
        data = res.json()
        job_id = data.get("jobId")
        print(f"✅ Job Submitted Successfully! Job ID: {job_id}")

        # Step 2: Poll for Results
        print("⏳ Polling for completed results (up to 2 minutes)...")
        for i in range(60):
            time.sleep(2)
            poll_res = client.get(f"https://api.anakin.io/v1/url-scraper/{job_id}", headers=headers)
            if poll_res.status_code == 200:
                poll_data = poll_res.json()
                status = poll_data.get("status")
                print(f"   [Poll #{i+1}] Status: {status}")
                
                if status == "completed":
                    print("\n🎉 SCRAPE JOB COMPLETED SUCCESSFULLY!")
                    print(json.dumps(poll_data, indent=2))
                    return poll_data
                elif status == "failed":
                    print(f"❌ Job failed: {poll_data}")
                    return None
            else:
                print(f"⚠️ Poll HTTP error ({poll_res.status_code}): {poll_res.text}")

    print("⏱️ Polling timed out after 2 minutes.")
    return None

if __name__ == "__main__":
    key = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("ANAKIN_API_KEY")
    if not key:
        print("Please provide your ANAKIN_API_KEY as an argument: python anakin_scrape.py <ANAKIN_API_KEY>")
    else:
        run_scrape(key)
