# Mobile Access Guide

## How to Access PureCut Suite from Your Mobile Phone

### Step 1: Find Your Computer's IP Address

**On Windows:**
1. Open Command Prompt (cmd)
2. Type: `ipconfig`
3. Look for "IPv4 Address" under your active network adapter (usually WiFi or Ethernet)
4. Example: `192.168.1.100`

**On macOS/Linux:**
1. Open Terminal
2. Type: `ifconfig` or `ip addr`
3. Look for your local IP address (usually starts with 192.168.x.x or 10.0.x.x)

### Step 2: Start the Backend Server

Make sure your backend is listening on all network interfaces (not just localhost):

```bash
cd backend
.\.venv\Scripts\activate  # Windows
# or: source .venv/bin/activate  # macOS/Linux

uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

**Important:** Use `--host 0.0.0.0` instead of `--host 127.0.0.1` to allow network access.

### Step 3: Start the Frontend Server

The frontend also needs to be accessible from the network:

```bash
npm run dev -- --host
```

The `--host` flag makes Vite accessible from your network.

### Step 4: Access from Mobile

1. Make sure your mobile phone is on the **same WiFi network** as your computer
2. Open your mobile browser
3. Navigate to: `http://YOUR_COMPUTER_IP:5173`
   - Example: `http://192.168.1.100:5173`

### Troubleshooting

**Tools not working?**
- ✅ Check that backend is running with `--host 0.0.0.0`
- ✅ Check that frontend is running with `--host` flag
- ✅ Verify both devices are on the same WiFi network
- ✅ Check Windows Firewall isn't blocking ports 5173 and 8000

**To allow through Windows Firewall:**
1. Open Windows Defender Firewall
2. Click "Allow an app through firewall"
3. Allow Python and Node.js for Private networks

**Check if backend is accessible:**
- From mobile browser, visit: `http://YOUR_COMPUTER_IP:8000/health`
- Should see: `{"status":"ok"}`

### What Changed?

1. **Frontend**: Now automatically detects the correct API URL based on how you access it
   - On localhost → uses `http://127.0.0.1:8000`
   - On network → uses `http://YOUR_IP:8000`

2. **Backend**: CORS now allows all origins (for development)
   - In production, you should restrict this to specific domains

### Quick Start Commands

**Terminal 1 (Backend):**
```bash
cd purecut-suite/backend
.\.venv\Scripts\activate
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 (Frontend):**
```bash
cd purecut-suite
npm run dev -- --host
```

**Access URLs:**
- Computer: `http://localhost:5173`
- Mobile: `http://YOUR_COMPUTER_IP:5173` (e.g., `http://192.168.1.100:5173`)
