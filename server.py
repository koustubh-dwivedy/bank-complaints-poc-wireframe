#!/usr/bin/env python3
"""
Dev server for POCWireframe.
- Serves static files on port 8787
- Accepts POST /log from browser error-capture script
- Writes all browser logs to browser_logs.txt
"""
import http.server
import json
import os
import sys
from datetime import datetime

LOG_FILE = os.path.join(os.path.dirname(__file__), "browser_logs.txt")
PORT = 8787
SERVE_DIR = os.path.dirname(os.path.abspath(__file__))

# Clear log file on start
with open(LOG_FILE, "w") as f:
    f.write(f"=== Session started {datetime.now().isoformat()} ===\n")

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=SERVE_DIR, **kwargs)

    def do_POST(self):
        if self.path == "/log":
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length).decode("utf-8")
            try:
                data = json.loads(body)
                ts = datetime.now().strftime("%H:%M:%S.%f")[:-3]
                level = data.get("level", "log").upper()
                msg = data.get("message", "")
                url = data.get("url", "")
                line = data.get("line", "")
                col = data.get("col", "")

                if url:
                    location = f" [{url.split('/')[-1]}:{line}:{col}]" if line else f" [{url.split('/')[-1]}]"
                else:
                    location = ""

                entry = f"[{ts}] {level}{location} {msg}\n"
                with open(LOG_FILE, "a") as f:
                    f.write(entry)
                sys.stdout.write(entry)
                sys.stdout.flush()
            except Exception as e:
                with open(LOG_FILE, "a") as f:
                    f.write(f"[LOG PARSE ERROR] {e} — raw: {body[:200]}\n")

            self.send_response(204)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
        else:
            self.send_response(404)
            self.end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def log_message(self, fmt, *args):
        # Only log non-asset requests to stdout
        path = args[0].split()[1] if args else ""
        if not any(path.endswith(ext) for ext in (".js", ".css", ".ico", ".png", ".jpg")):
            ts = datetime.now().strftime("%H:%M:%S")
            sys.stdout.write(f"[{ts}] HTTP {fmt % args}\n")
            sys.stdout.flush()

print(f"POCWireframe dev server running at http://localhost:{PORT}")
print(f"Browser logs → {LOG_FILE}")
print("─" * 50)

with http.server.HTTPServer(("", PORT), Handler) as httpd:
    httpd.serve_forever()
