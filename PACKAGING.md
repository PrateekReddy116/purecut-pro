# Desktop packaging (future phase)

This project is currently a **Vite SPA + FastAPI** dev stack. Turning it into a **double-click desktop app** that bundles Python, installs models, and starts both tiers is a separate packaging effort.

## Suggested directions

1. **Dev launcher (done in repo)**  
   Use `npm run dev:all`, or `scripts/dev-start.ps1` / `scripts/dev-start.sh`, to run the API and UI without manual two-terminal setup.

2. **Native shell (Tauri or Electron)**  
   - Ship a **production Vite build** (`npm run build`) as static assets inside the shell.  
   - Run **Python** as a **sidecar**: e.g. **PyInstaller** one-file/one-folder `purecut-api.exe` that starts `uvicorn` on `127.0.0.1:8000`.  
   - On first launch, optionally **download** rembg / Real-ESRGAN weights to a user data directory (or bundle small defaults only).

3. **Installers**  
   - **Windows**: Inno Setup or NSIS to install Node-free static UI + Python runtime or embedded API binary.  
   - **macOS**: app bundle + signed/notarized helper for the API process.

4. **GPU**  
   A UI “use GPU” toggle only helps where libraries honor it (e.g. **ONNX Runtime** GPU for rembg, **CUDA PyTorch** for Real-ESRGAN). OpenCV inpainting stays CPU-oriented.

## Complexity note

Bundling **PyTorch**, **CUDA**, and large weights often dominates installer size (multi‑GB). A **minimal** first desktop release might ship **CPU-only** inference and document optional GPU extras for power users.
