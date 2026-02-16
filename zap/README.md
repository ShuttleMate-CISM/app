# 🛡️ OWASP ZAP - DAST Security Scanning

## Overview

This directory contains the OWASP ZAP (Zed Attack Proxy) configuration for Dynamic Application Security Testing (DAST) of the ShuttleMate application. ZAP scans the **running** application to find vulnerabilities that static analysis cannot detect.

## Prerequisites

1. **Docker Desktop** installed and running  
   Download: https://www.docker.com/products/docker-desktop/

3. **Pull the ZAP image** (first time only):
   ```bash
   docker pull zaproxy/zap-stable
   ```

2. **ShuttleMate services running locally:**
   ```bash
   # Terminal 1 - Backend (port 5001)
   cd Shuttlemate-Backend && npm run dev

   # Terminal 2 - Frontend (port 5173)
   cd Shuttlemate-Frontend && npm run dev
   ```

## Quick Start

### Option 1: Baseline Scan (Fast - ~2 minutes)
Passive scan only. No attack payloads sent. Great for a quick check.

```bash
chmod +x zap/run-zap-scan.sh
./zap/run-zap-scan.sh baseline
```

### Option 2: Full Scan (Thorough - ~20-30 minutes)
Includes active scanning with attack payloads against both frontend and backend.

```bash
# Scan everything
./zap/run-zap-scan.sh

# Or scan individually
./zap/run-zap-scan.sh frontend
./zap/run-zap-scan.sh backend
```

## Scan Types

| Command | Target | Duration | Depth |
|---------|--------|----------|-------|
| `./zap/run-zap-scan.sh baseline` | Frontend + Backend | ~2-5 min | Passive only |
| `./zap/run-zap-scan.sh frontend` | React app (5173) | ~10-20 min | Spider + AJAX + Active |
| `./zap/run-zap-scan.sh backend` | Express API (5001) | ~10-20 min | API crawl + Active |
| `./zap/run-zap-scan.sh` | Both | ~20-40 min | Full scan |

## Reports

Reports are saved to `zap/reports/` with timestamps:

```
zap/reports/
├── shuttlemate-frontend-report-20260214_120000.html   # Full HTML report
├── shuttlemate-frontend-report-20260214_120000.json   # Machine-readable
├── shuttlemate-backend-report-20260214_120000.html
├── shuttlemate-backend-report-20260214_120000.json
├── frontend-scan-log-20260214_120000.txt              # Scan log
└── backend-scan-log-20260214_120000.txt
```

**Open the HTML report in a browser** for the best viewing experience:
```bash
open zap/reports/shuttlemate-frontend-report-*.html
open zap/reports/shuttlemate-backend-report-*.html
```

## What's Being Scanned

### Frontend Scan (`frontend-scan.yaml`)
- **Spider** - Crawls all pages and links
- **AJAX Spider** - Handles JavaScript-rendered SPA content
- **Passive Scan** - Checks response headers, cookies, content
- **Active Scan** - Tests for XSS, injection, misconfigurations
- Focused rules: XSS (Reflected/Persistent), CSP, Clickjacking

### Backend Scan (`backend-scan.yaml`)
- **API Endpoint Seeding** - Pre-seeds all known API routes
- **Spider** - Discovers additional endpoints
- **Passive Scan** - Checks headers, server info leakage
- **Active Scan** - Tests for SQL/NoSQL injection, path traversal, CORS issues
- Focused rules: Injection, Auth/Session, Server disclosure, CORS, IDOR

## Relevant CISM Security Domains

| Student | Domain | What ZAP Tests |
|---------|--------|----------------|
| S1 (Madhura) | Authentication | Rate limiting, brute force |
| S2 (Himasha) | Payment Security | API endpoint exposure |
| S3 (Shehani) | Data Privacy (IDOR) | Direct object reference |
| S4 (Chamudi) | Input Validation | SQL/NoSQL injection |
| S5 (Sunera) | Infrastructure | Security headers, server info |
| S6 (Bhagya) | Frontend Security | XSS, CSP, content injection |

## File Structure

```
zap/
├── README.md              # This file
├── run-zap-scan.sh        # Main scan runner script
├── frontend-scan.yaml     # ZAP Automation config for frontend
├── backend-scan.yaml      # ZAP Automation config for backend API
└── reports/               # Generated reports (gitignored)
```

## Troubleshooting

### "Docker daemon is not running"
Start Docker Desktop and wait for it to be ready.

### "Service not accessible"
Make sure both the frontend and backend are running:
```bash
# Check if services are up
curl http://localhost:5173
curl http://localhost:5001/api/news
```

### Scan takes too long
Use `baseline` mode for a quick passive scan, or reduce `maxScanDurationInMins` in the YAML configs.

### Permission denied on script
```bash
chmod +x zap/run-zap-scan.sh
```

### Docker network issues on macOS
The `--network host` flag works differently on macOS. If ZAP can't reach localhost, try replacing `localhost` with `host.docker.internal` in the YAML configs.
