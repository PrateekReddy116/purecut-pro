# PureCut Suite — Project Review Cheat Sheet  
*(Frontend → Backend, APIs, models, and per-tool behavior)*

This document explains **how the implementation works** end-to-end: what runs in the browser, what runs on the server, how **HTTP APIs** are used, what **Uvicorn** does, and **each tool**—libraries, models (if any), and processing steps.

---

## 1. Big picture: how the app works

1. **Frontend (React + Vite)** runs in the user’s browser. It serves the UI (pages, upload zones, buttons).
2. User picks files. The frontend builds **`FormData`** (multipart/form-data) and sends **`fetch(...)` POST** requests to the **Python backend base URL**.
3. **Backend base URL** comes from `src/config/api.ts`:  
   - On `localhost` / `127.0.0.1` → `http://127.0.0.1:8000`  
   - When opened from another device on the LAN → `http://<same-hostname>:8000` so phones can hit the API if the server listens on `0.0.0.0`.
4. **FastAPI** receives the request, runs Python code for that route, and returns **binary streams** (`StreamingResponse`) for images, PDFs, or ZIPs—or JSON for things like page count.
5. There is **no database** in the core design: each request is independent; files live in memory during processing.

---

## 2. What is FastAPI?

**FastAPI** is a Python **web framework** for building **HTTP APIs**. You declare routes like `@app.post("/background-remover")` and functions that receive uploaded files (`UploadFile`) and form fields (`Form(...)`). It validates inputs, generates **OpenAPI** docs automatically (Swagger UI at `/docs` when the server runs).

---

## 3. What is Uvicorn?

**Uvicorn** is an **ASGI server**: it runs the FastAPI application and **listens on a TCP port** (e.g. 8000), accepts HTTP connections, and passes them to FastAPI.

Typical dev command (from `README.md`):

```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
