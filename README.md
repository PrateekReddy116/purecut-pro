## PureCut Pro – Frontend & Python AI Backend

This repo contains the **PureCut Pro** React frontend (Vite + TypeScript + Tailwind + shadcn-ui) and a **Python FastAPI backend** that powers AI image tools:

- Background Remover
- Image Enhancer
- Object Remover
- Image Upscaler

---

## 1. Prerequisites

- **Node.js** (LTS) and **npm**
- **Python 3.11** (recommended – must be a version with NumPy wheels available)

On Windows, during Python install, select **“Add Python to PATH”**.

---

## 2. Backend (Python / FastAPI)

All backend code lives in `backend/`.

### 2.1. Create and activate a virtual environment

From the project root:

```powershell
cd "E:\PureCut Pro\purecut-suite"
py -3.11 -m venv .venv
.\.venv\Scripts\activate
```

### 2.2. Install backend dependencies

```powershell
cd backend
python -m pip install --upgrade pip
pip install -r requirements.txt
```

If `realesrgan` or its dependencies fail to install, the **Image Upscaler** endpoint will still work using a high-quality bicubic fallback.

### 2.3. (Optional) Real-ESRGAN weights for AI upscaling

If you want model-based upscaling instead of just bicubic resize:

1. Create a weights directory:
   ```powershell
   mkdir weights
   ```
2. Download `RealESRGAN_x2plus.pth` from the official Real-ESRGAN releases and place it at:
   ```text
   backend/weights/RealESRGAN_x2plus.pth
   ```

If weights or dependencies are missing, the backend automatically falls back to bicubic resize.

### 2.4. Run the backend

From `backend/` with the venv active:

```powershell
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://127.0.0.1:8000`.

### 2.5. Verify backend is running

- Health check: open `http://127.0.0.1:8000/health` → `{"status": "ok"}`  
- Interactive docs: open `http://127.0.0.1:8000/docs` and test endpoints:
  - `POST /background-remover`
  - `POST /image-enhancer`
  - `POST /object-remover`
  - `POST /image-upscaler`

**CORS** is configured for common dev origins: `http://localhost:8080`, `http://127.0.0.1:8080`, `http://localhost:5173`, `http://127.0.0.1:5173`.

---

## 3. Frontend (Vite + React)

All frontend code lives in `src/`.

### 3.1. Install dependencies

From the project root:

```bash
cd "E:\PureCut Pro\purecut-suite"
npm install
```

### 3.2. Run the frontend

```bash
npm run dev
```

By default, Vite runs on `http://127.0.0.1:5173` (or a similar port). The AI tools pages are under **AI Tools** in the navbar:

- Background Remover → `/ai-tools/background-remover`
- Image Enhancer → `/ai-tools/enhancer`
- Object Remover → `/ai-tools/object-remover`
- Image Upscaler → `/ai-tools/upscaler`

Make sure the **backend** is running before using these tools, otherwise you’ll see network errors in the UI.

---

## 4. AI models and algorithms used

For the tools implemented in the Python backend:

- **Background Remover (`/background-remover`)**
  - Uses `rembg`, which wraps a **U²-Net**-family segmentation model to separate foreground from background.
  - Returns a PNG with a transparent background.

- **Image Enhancer (`/image-enhancer`)**
  - Uses lightweight, classical image-processing via **Pillow**:
    - Median denoise
    - Unsharp mask for detail enhancement
    - Adjustable **sharpness**, **contrast**, and **brightness** based on the UI slider.
  - No heavy ML model here – intentionally fast and lightweight.

- **Object Remover (`/object-remover`)**
  - Uses **OpenCV Telea inpainting** (`cv2.inpaint` with `INPAINT_TELEA`):
    - Input: original image + a **mask image** (white = regions to remove).
    - Fills in masked regions using surrounding pixels.

- **Image Upscaler (`/image-upscaler`)**
  - Tries to use **Real-ESRGAN** (RRDBNet-based) if `realesrgan` is installed and model weights are available at `backend/weights/RealESRGAN_x2plus.pth`.
  - If Real-ESRGAN is unavailable or fails, falls back to **high-quality bicubic resize** using Pillow.

These choices balance **quality**, **performance**, and **ease of installation**, especially on Windows.
