import urllib.request
import json

req = urllib.request.Request('http://localhost:3000/api/reports')
with urllib.request.urlopen(req) as response:
    data = json.loads(response.read())
    for r in data.get('reports', []):
        print(f"ID: {r['id']}, Created: {r['created_at']}, Severity: {r['severity']}")
