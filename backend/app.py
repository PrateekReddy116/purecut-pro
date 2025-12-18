from io import BytesIO
from typing import Optional

import cv2
import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from PIL import Image, ImageEnhance, ImageFilter
from rembg import remove

try:
    # Optional import: only used for upscaling if available
    from realesrgan import RealESRGANer
    from basicsr.archs.rrdbnet_arch import RRDBNet  # type: ignore
except Exception:  # pragma: no cover - optional heavy deps
    RealESRGANer = None  # type: ignore
    RRDBNet = None  # type: ignore


app = FastAPI(title="PureCut Pro AI Backend", version="0.1.0")

# CORS for local frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _pil_to_bytes(image: Image.Image, format: str = "PNG") -> BytesIO:
    buf = BytesIO()
    image.save(buf, format=format)
    buf.seek(0)
    return buf


def _load_image(file: UploadFile) -> Image.Image:
    try:
        contents = file.file.read()
        return Image.open(BytesIO(contents)).convert("RGBA")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")


@app.post("/background-remover")
async def background_remover(image: UploadFile = File(...)) -> StreamingResponse:
    """
    Remove background from the given image using a lightweight U²-Net model (via rembg).
    """
    pil_img = _load_image(image)
    try:
        output = remove(pil_img)
    except Exception as e:  # pragma: no cover - runtime-specific
        raise HTTPException(status_code=500, detail=f"Background removal failed: {e}")

    buf = _pil_to_bytes(output, format="PNG")
    return StreamingResponse(buf, media_type="image/png")


@app.post("/image-enhancer")
async def image_enhancer(
    image: UploadFile = File(...),
    sharpness: float = 1.3,
    contrast: float = 1.15,
    brightness: float = 1.05,
) -> StreamingResponse:
    """
    Lightweight image enhancement using classical techniques:
    - slight de-noise
    - unsharp mask
    - modest contrast/brightness boost
    """
    pil_img = _load_image(image).convert("RGB")

    # Basic denoise via median filter
    pil_img = pil_img.filter(ImageFilter.MedianFilter(size=3))

    # Unsharp mask for detail enhancement
    pil_img = pil_img.filter(ImageFilter.UnsharpMask(radius=2, percent=150, threshold=3))

    # Adjust sharpness / contrast / brightness with tunable factors
    pil_img = ImageEnhance.Sharpness(pil_img).enhance(sharpness)
    pil_img = ImageEnhance.Contrast(pil_img).enhance(contrast)
    pil_img = ImageEnhance.Brightness(pil_img).enhance(brightness)

    buf = _pil_to_bytes(pil_img, format="JPEG")
    return StreamingResponse(buf, media_type="image/jpeg")


def _load_mask(mask_file: UploadFile, size: Optional[tuple[int, int]]) -> np.ndarray:
    try:
        contents = mask_file.file.read()
        mask_img = Image.open(BytesIO(contents)).convert("L")
        if size is not None:
            mask_img = mask_img.resize(size, Image.NEAREST)
        mask = np.array(mask_img)
        # Binarize mask
        _, mask = cv2.threshold(mask, 127, 255, cv2.THRESH_BINARY)
        return mask
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid mask file")


@app.post("/object-remover")
async def object_remover(
    image: UploadFile = File(...),
    mask: UploadFile = File(...),
) -> StreamingResponse:
    """
    Object removal via classical inpainting (OpenCV Telea).

    The frontend should send:
    - image: the original image
    - mask: a grayscale mask where white pixels (255) mark areas to remove
    """
    pil_img = _load_image(image).convert("RGB")
    np_img = np.array(pil_img)
    h, w, _ = np_img.shape

    np_mask = _load_mask(mask, size=(w, h))

    # OpenCV expects BGR image
    bgr = cv2.cvtColor(np_img, cv2.COLOR_RGB2BGR)

    try:
        inpainted = cv2.inpaint(bgr, np_mask, 3, cv2.INPAINT_TELEA)
    except Exception as e:  # pragma: no cover - runtime-specific
        raise HTTPException(status_code=500, detail=f"Object removal failed: {e}")

    out_rgb = cv2.cvtColor(inpainted, cv2.COLOR_BGR2RGB)
    out_img = Image.fromarray(out_rgb)

    buf = _pil_to_bytes(out_img, format="JPEG")
    return StreamingResponse(buf, media_type="image/jpeg")


_upscaler = None


def _get_upscaler(scale: int = 2):
    """
    Try to initialise a Real-ESRGAN upscaler. If the heavy deps or weights
    are missing, return None so the caller can gracefully fall back to
    high-quality bicubic resize.
    """
    global _upscaler
    if _upscaler is not None:
        return _upscaler

    if RealESRGANer is None or RRDBNet is None:
        return None

    try:
        # A relatively lightweight RRDBNet config; model weights should be downloaded separately.
        model = RRDBNet(
            num_in_ch=3,
            num_out_ch=3,
            num_feat=64,
            num_block=23,
            num_grow_ch=32,
            scale=scale,
        )

        _upscaler = RealESRGANer(
            scale=scale,
            model_path="weights/RealESRGAN_x2plus.pth",  # expected path; document for user
            model=model,
            tile=0,
            tile_pad=10,
            pre_pad=0,
            half=True,
        )
    except Exception:
        _upscaler = None

    return _upscaler


@app.post("/image-upscaler")
async def image_upscaler(
    image: UploadFile = File(...),
    scale: int = 2,
) -> StreamingResponse:
    """
    Image upscaling using Real-ESRGAN when available, with a safe
    fallback to high-quality bicubic resize so the endpoint always works.
    """
    pil_img = _load_image(image).convert("RGB")

    upscaler = _get_upscaler(scale=scale)

    if upscaler is not None:
        np_img = np.array(pil_img)
        try:
            output, _ = upscaler.enhance(np_img, outscale=scale)
            out_img = Image.fromarray(output)
        except Exception:
            # Fall back if the model or weights are not usable at runtime
            out_img = pil_img.resize(
                (pil_img.width * scale, pil_img.height * scale),
                Image.Resampling.BICUBIC,
            )
    else:
        # Lightweight non-ML upscale as a guaranteed baseline
        out_img = pil_img.resize(
            (pil_img.width * scale, pil_img.height * scale),
            Image.Resampling.BICUBIC,
        )

    buf = _pil_to_bytes(out_img, format="JPEG")
    return StreamingResponse(buf, media_type="image/jpeg")


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


