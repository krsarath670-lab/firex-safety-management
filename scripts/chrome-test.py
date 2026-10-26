import subprocess
import time
import json
import urllib.request
import os

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
PORT = 9222
USER_DATA = r"C:\Users\USER\.gemini\antigravity\scratch\chrome_profile"

# Launch Chrome with remote debugging
cmd = [
    CHROME,
    "--headless=new",
    f"--remote-debugging-port={PORT}",
    f"--user-data-dir={USER_DATA}",
    "--disable-gpu",
    "--no-sandbox",
    "https://firex-safety-management.onrender.com"
]

proc = subprocess.Popen(cmd)
time.sleep(4)

try:
    # Query targets
    req = urllib.request.urlopen(f"http://localhost:{PORT}/json")
    targets = json.loads(req.read().decode())
    print("Targets found:", len(targets))
    for t in targets:
        print("Target:", t.get("title"), t.get("url"), t.get("webSocketDebuggerUrl"))
finally:
    proc.terminate()
