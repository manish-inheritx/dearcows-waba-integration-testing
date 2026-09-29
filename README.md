# DearCows - WABA QA Testing Suite 🐄

A single-page utility console built for QA and Frontend teams to test the WhatsApp Business API (WABA) notification flows and manipulate user wallet states without direct database access.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev
```

Visit the app at `http://localhost:5173` (or the port Vite outputs, e.g. `http://localhost:5174`).

---

## ⚡ The 3 Testing APIs Supported

### 1. Trigger WhatsApp Queue Processor
- **Method:** `POST`
- **Endpoint:** `/api/v3/taskRunner/triggerWhatsappQueueProcessor`
- **Description:** Simulates the 14:00 & 14:30 daily cron jobs on demand. Evaluates active users, enqueues Low Balance (`< 1L`) & Vacation Ending alerts, and drains the queue in the background using Meta's rate limits (6s delay/user).

### 2. Get WABA Test Users
- **Method:** `GET`
- **Endpoint:** `/api/v3/taskRunner/getWabaUsers`
- **Description:** Fetches test users whose `lastName` contains the word "WABA".
- **Features in Dashboard:**
  - Search by Name, Phone, or MongoDB ObjectId
  - Filter tabs: *All Users*, *Low Balance (≤ 0L)*, *Safe Balance (> 0L)*, *Daily Delivery*
  - 1-click copy for Phone and Mongo ID
  - Direct WhatsApp Web chat link (`https://wa.me/91<phone>`)
  - Table View and Card Grid View modes

### 3. Update User Balance (Ledger Safe)
- **Method:** `POST`
- **Endpoint:** `/api/v3/taskRunner/updateUserBalance`
- **Request Body:**
  ```json
  {
    "userId": "64c9d81f2b1a9c30f4e1a001",
    "amount": 5
  }
  ```
- **Description:** Instantly updates wallet balance in liters, writes an audit record to `BalanceHistory` to maintain database integrity, and automatically resets `lowBalanceDays` count.
- **Features in Dashboard:**
  - Quick inline buttons directly on each row: `[-1L]`, `[+1L]`, `[+5L]`
  - Modal with custom amount inputs, quick stepper chips (`-10L` to `+10L`), and live projected balance preview.

---

## 🛠 Features & Capabilities

- **🌐 Configurable Gateway & Proxy:**
  - Select preset Base URLs (`/api/v3/taskRunner` via Vite proxy targeting `http://localhost:3015`, direct `http://localhost:3015`, etc.) or input custom URL.
  - Optional Bearer Authorization header support.
  - "Test Ping" button to verify server reachability and latency.
- **📊 Real-time Network & Activity Console:**
  - Click **Console** in header to inspect every API request & response payload, HTTP status code, and latency in milliseconds.
  - 1-click JSON copy for request payloads and response objects.
- **📖 Integrated Documentation & cURL Snippets:**
  - Click **Docs & cURL** to view the full endpoint specifications with copy-pasteable terminal commands.
