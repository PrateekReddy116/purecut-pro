from io import BytesIO
import base64
import os
import re
import shutil
import subprocess
from typing import Optional
import zipfile

import cv2
import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from PIL import Image, ImageEnhance, ImageFilter
from pypdf import PdfReader, PdfWriter
from pypdf.constants import UserAccessPermissions as PdfUserPerms
import fitz  # PyMuPDF
from rembg import remove

try:
    # Optional import: only used for upscaling if available
    from realesrgan import RealESRGANer
    from basicsr.archs.rrdbnet_arch import RRDBNet  # type: ignore
except Exception:  # pragma: no cover - optional heavy deps
    RealESRGANer = None  # type: ignore
    RRDBNet = None  # type: ignore


app = FastAPI(title="PureCut Pro AI Backend", version="0.1.0")

# CORS configuration
# Allow connections from localhost and any IP address on the local network
# This enables mobile devices on the same network to access the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development (restrict in production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _pil_to_bytes(image: Image.Image, format: str = "PNG") -> BytesIO:
    buf = BytesIO()
    image.save(buf, format=format)
    buf.seek(0)
    return buf


def _is_pdf_upload(upload: UploadFile) -> bool:
    """Accept PDFs when MIME is correct or when the client omits/wrong MIME but the name is .pdf."""
    ct = (upload.content_type or "").strip().lower()
    name = (upload.filename or "").lower()
    if ct in ("application/pdf", "application/x-pdf"):
        return True
    if name.endswith(".pdf") and ct in ("", "application/octet-stream", "binary/octet-stream"):
        return True
    return False


def _sanitize_archive_basename(name: str) -> str:
    base = os.path.basename(name or "archive").strip() or "archive"
    base = re.sub(r"[^\w\-. ]+", "", base, flags=re.UNICODE).strip(" .")
    return base[:200] if base else "archive"


def _bytes_to_streaming_pdf(buf: BytesIO, filename: str = "output.pdf") -> StreamingResponse:
    """
    Helper to return a PDF file as a streaming response with a download filename.
    """
    buf.seek(0)
    headers = {"Content-Disposition": f'attachment; filename="{filename}"'}
    return StreamingResponse(buf, media_type="application/pdf", headers=headers)


def _file_to_streaming_pdf(path: str, filename: str = "output.pdf") -> StreamingResponse:
    """
    Stream a PDF file from disk as a download response.
    """
    f = open(path, "rb")
    headers = {"Content-Disposition": f'attachment; filename="{filename}"'}
    return StreamingResponse(f, media_type="application/pdf", headers=headers)


def _which_or_env(env_key: str, default_name: str) -> Optional[str]:
    """
    Resolve an external binary path from env var or PATH.
    """
    p = (os.getenv(env_key) or "").strip()
    if p:
        return p
    return shutil.which(default_name)


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


def _decode_mask_bytes(contents: bytes, size: Optional[tuple[int, int]]) -> np.ndarray:
    try:
        mask_img = Image.open(BytesIO(contents)).convert("L")
        if size is not None:
            mask_img = mask_img.resize(size, Image.Resampling.NEAREST)
        mask = np.array(mask_img)
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
    try:
        img_bytes = await image.read()
        mask_bytes = await mask.read()
    except Exception:
        raise HTTPException(status_code=400, detail="Failed to read upload")

    try:
        pil_img = Image.open(BytesIO(img_bytes)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")

    np_img = np.array(pil_img)
    h, w, _ = np_img.shape

    np_mask = _decode_mask_bytes(mask_bytes, size=(w, h))

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


# =========================
# PDF TOOL ENDPOINTS
# =========================


@app.post("/pdf/merge")
async def pdf_merge(files: list[UploadFile] = File(...)) -> StreamingResponse:
    """
    Merge multiple PDFs into a single document.
    """
    if len(files) < 2:
        raise HTTPException(status_code=400, detail="At least two PDF files are required")

    writer = PdfWriter()

    try:
        for upload in files:
            if not _is_pdf_upload(upload):
                raise HTTPException(status_code=400, detail="Only PDF files are supported")
            data = await upload.read()
            reader = PdfReader(BytesIO(data))
            for page in reader.pages:
                writer.add_page(page)

        out_buf = BytesIO()
        writer.write(out_buf)
        writer.close()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to merge PDFs: {e}")

    return _bytes_to_streaming_pdf(out_buf, filename="merged.pdf")


@app.post("/pdf/split")
async def pdf_split(
    file: UploadFile = File(...),
    mode: str = Form("pages"),  # "pages" | "range"
    ranges: str = Form(""),
) -> StreamingResponse:
    """
    Split a PDF file.

    - mode="pages": split into single-page PDFs
    - mode="range": `ranges` string like "1-3,5,7-9"

    Returns a ZIP file containing the resulting PDFs.
    """
    if not _is_pdf_upload(file):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    try:
        data = await file.read()
        reader = PdfReader(BytesIO(data))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid PDF file")

    def parse_ranges(total_pages: int) -> list[tuple[int, int]]:
        if not ranges.strip():
            return [(1, total_pages)]
        result: list[tuple[int, int]] = []
        for part in ranges.split(","):
            part = part.strip()
            if not part:
                continue
            if "-" in part:
                start_s, end_s = part.split("-", 1)
                start = max(1, int(start_s))
                end = min(total_pages, int(end_s))
            else:
                start = end = max(1, min(total_pages, int(part)))
            if start <= end:
                result.append((start, end))
        return result

    zip_buf = BytesIO()
    with zipfile.ZipFile(zip_buf, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        if mode == "pages":
            for i, page in enumerate(reader.pages):
                writer = PdfWriter()
                writer.add_page(page)
                out = BytesIO()
                writer.write(out)
                writer.close()
                out.seek(0)
                zf.writestr(f"page-{i+1}.pdf", out.read())
        else:
            total_pages = len(reader.pages)
            for idx, (start, end) in enumerate(parse_ranges(total_pages), start=1):
                writer = PdfWriter()
                for p in range(start - 1, end):
                    writer.add_page(reader.pages[p])
                out = BytesIO()
                writer.write(out)
                writer.close()
                out.seek(0)
                zf.writestr(f"part-{idx}-{start}-{end}.pdf", out.read())

    zip_buf.seek(0)
    headers = {"Content-Disposition": 'attachment; filename="split.zip"'}
    return StreamingResponse(zip_buf, media_type="application/zip", headers=headers)


@app.post("/pdf/page-count")
async def pdf_page_count(file: UploadFile = File(...)) -> dict:
    """
    Return the total number of pages in a PDF.
    Used by the frontend Split PDF tool for accurate page counts.
    """
    if not _is_pdf_upload(file):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    try:
        data = await file.read()
        reader = PdfReader(BytesIO(data))
        total_pages = len(reader.pages)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid PDF file")

    return {"pages": total_pages}


@app.post("/pdf/preview-pages")
async def pdf_preview_pages(
    file: UploadFile = File(...),
    max_pages: int = Form(24),
    max_width: int = Form(132),
) -> dict:
    """
    Return small JPEG thumbnails (base64 data URLs) for the first N pages.
    """
    if not _is_pdf_upload(file):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    cap = max(1, min(int(max_pages), 50))
    thumb_w = max(48, min(int(max_width), 240))

    try:
        data = await file.read()
        doc = fitz.open(stream=data, filetype="pdf")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid PDF file")

    total = len(doc)
    previews: list[dict] = []

    try:
        for i in range(min(total, cap)):
            page = doc.load_page(i)
            rect = page.rect
            if rect.width <= 0:
                continue
            scale = thumb_w / rect.width
            mat = fitz.Matrix(scale, scale)
            pix = page.get_pixmap(matrix=mat, alpha=False)
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            buf = BytesIO()
            img.save(buf, format="JPEG", quality=80, optimize=True)
            b64 = base64.standard_b64encode(buf.getvalue()).decode("ascii")
            previews.append({"page": i + 1, "image": f"data:image/jpeg;base64,{b64}"})
    finally:
        doc.close()

    return {"total_pages": total, "previews": previews}


@app.post("/pdf/to-images")
async def pdf_to_images(
    file: UploadFile = File(...),
    format: str = Form("png"),
    quality: str = Form("high"),  # high / medium / low
) -> StreamingResponse:
    """
    Convert PDF pages to images using PyMuPDF.

    - format: "png" or "jpg"
    - quality: controls DPI (300/150/72)

    Returns a ZIP containing all page images.
    """
    if not _is_pdf_upload(file):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    fmt = format.lower()
    if fmt not in {"png", "jpg", "jpeg"}:
        raise HTTPException(status_code=400, detail="Invalid format, must be png or jpg")

    dpi_map = {"high": 300, "medium": 150, "low": 72}
    dpi = dpi_map.get(quality.lower(), 300)
    zoom = dpi / 72.0  # 72 DPI is default

    try:
        data = await file.read()
        doc = fitz.open(stream=data, filetype="pdf")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid PDF file")

    zip_buf = BytesIO()
    with zipfile.ZipFile(zip_buf, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for page_index in range(len(doc)):
            page = doc.load_page(page_index)
            mat = fitz.Matrix(zoom, zoom)
            pix = page.get_pixmap(matrix=mat, alpha=False)
            img_mode = "RGB"
            img = Image.frombytes(img_mode, [pix.width, pix.height], pix.samples)

            img_buf = BytesIO()
            if fmt in {"jpg", "jpeg"}:
                img.save(img_buf, format="JPEG", quality=90)
                ext = "jpg"
            else:
                img.save(img_buf, format="PNG")
                ext = "png"
            img_buf.seek(0)
            zf.writestr(f"page-{page_index+1}.{ext}", img_buf.read())

    doc.close()
    zip_buf.seek(0)
    headers = {"Content-Disposition": 'attachment; filename="pages.zip"'}
    return StreamingResponse(zip_buf, media_type="application/zip", headers=headers)


@app.post("/pdf/from-images")
async def images_to_pdf(
    files: list[UploadFile] = File(...),
    page_size: str = Form("fit"),  # a4 | letter | fit
) -> StreamingResponse:
    """
    Create a PDF from multiple images using Pillow.

    page_size:
      - "a4": 210x297mm at 72 DPI approx 595x842 px
      - "letter": 8.5x11in at 72 DPI approx 612x792 px
      - "fit": each image keeps native size, one per page
    """
    if not files:
        raise HTTPException(status_code=400, detail="At least one image is required")

    images: list[Image.Image] = []
    for upload in files:
        try:
            contents = await upload.read()
            img = Image.open(BytesIO(contents)).convert("RGB")
            images.append(img)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid image file in upload")

    page_size = page_size.lower()
    if page_size == "a4":
        target_size = (595, 842)
    elif page_size == "letter":
        target_size = (612, 792)
    else:
        target_size = None

    processed: list[Image.Image] = []
    for img in images:
        if target_size is None:
            processed.append(img)
        else:
            # Fit image inside target_size while preserving aspect ratio, pad with white
            img_copy = img.copy()
            img_copy.thumbnail(target_size, Image.Resampling.LANCZOS)
            canvas = Image.new("RGB", target_size, (255, 255, 255))
            x = (target_size[0] - img_copy.width) // 2
            y = (target_size[1] - img_copy.height) // 2
            canvas.paste(img_copy, (x, y))
            processed.append(canvas)

    pdf_buf = BytesIO()
    first, *rest = processed
    first.save(pdf_buf, format="PDF", save_all=True, append_images=rest)
    pdf_buf.seek(0)
    return _bytes_to_streaming_pdf(pdf_buf, filename="images.pdf")


def _pdf_save_optimized(doc: fitz.Document, buf: BytesIO, *, garbage: int = 4) -> None:
    """
    Lossless size reduction: compress streams, object streams, xref GC.
    clean=False avoids sanitizing content streams (safer for complex/CID fonts).
    """
    doc.save(
        buf,
        garbage=garbage,
        deflate=True,
        clean=False,
        deflate_images=True,
        deflate_fonts=True,
        use_objstms=1,
    )


@app.post("/pdf/compress")
async def pdf_compress(
    file: UploadFile = File(...),
    level: str = Form("medium"),
    engine: str = Form("pymupdf"),  # pymupdf | qpdf | ghostscript
    preset: str = Form("ebook"),  # ghostscript only: screen|ebook|printer|prepress
) -> StreamingResponse:
    """
    Lossless PDF optimization only (deflate streams, object streams, garbage collection).
    Does not re-encode or replace image xrefs (that approach corrupts many PDFs with text).

    level selects garbage-collection strength only: low=3, medium/high=4.
    For heavier compression use external tools (qpdf, Ghostscript) — see README.
    """
    if not _is_pdf_upload(file):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    level = (level or "medium").strip().lower()
    if level not in ("low", "medium", "high"):
        raise HTTPException(status_code=400, detail="level must be one of: low, medium, high")

    engine = (engine or "pymupdf").strip().lower()
    if engine not in ("pymupdf", "qpdf", "ghostscript"):
        raise HTTPException(status_code=400, detail="engine must be one of: pymupdf, qpdf, ghostscript")

    preset = (preset or "ebook").strip().lower()
    if preset not in ("screen", "ebook", "printer", "prepress"):
        raise HTTPException(status_code=400, detail="preset must be one of: screen, ebook, printer, prepress")

    # For large PDFs, avoid reading the entire upload into memory.
    # Writing to a temporary file allows PyMuPDF to operate without duplicating buffers.
    tmp_path = None
    try:
        import tempfile

        suffix = ".pdf" if (file.filename or "").lower().endswith(".pdf") else ".pdf"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp_path = tmp.name
            while True:
                chunk = await file.read(1024 * 1024)
                if not chunk:
                    break
                tmp.write(chunk)
    except Exception:
        if tmp_path:
            try:
                os.unlink(tmp_path)
            except Exception:
                pass
        raise HTTPException(status_code=400, detail="Failed to read uploaded PDF")

    import tempfile

    out_path = None
    try:
        original_size = os.path.getsize(tmp_path) if tmp_path else None

        if engine == "pymupdf":
            garbage = 3 if level == "low" else 4
            out_buf = BytesIO()
            try:
                try:
                    doc = fitz.open(tmp_path)  # type: ignore[arg-type]
                except Exception:
                    raise HTTPException(status_code=400, detail="Invalid PDF file")
                try:
                    _pdf_save_optimized(doc, out_buf, garbage=garbage)
                finally:
                    doc.close()
            except HTTPException:
                raise

            out_buf.seek(0)
            try:
                optimized_size = len(out_buf.getbuffer())
            except Exception:
                optimized_size = None
            if (
                original_size is not None
                and optimized_size is not None
                and optimized_size >= original_size
                and tmp_path
            ):
                with open(tmp_path, "rb") as f:
                    out_buf = BytesIO(f.read())
            return _bytes_to_streaming_pdf(out_buf, filename="compressed.pdf")

        # External engines write directly to a file.
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as out_tmp:
            out_path = out_tmp.name

        timeout_s = int(os.getenv("PDF_COMPRESS_TIMEOUT_SECONDS", "600"))

        if engine == "qpdf":
            qpdf_bin = _which_or_env("QPDF_PATH", "qpdf")
            if not qpdf_bin:
                raise HTTPException(
                    status_code=503,
                    detail="qpdf is not installed. Install qpdf and/or set QPDF_PATH to the qpdf executable.",
                )
            cmd = [
                qpdf_bin,
                "--optimize-images",
                "--object-streams=generate",
                "--stream-data=compress",
                tmp_path,
                out_path,
            ]
        else:
            gs_bin = (
                _which_or_env("GHOSTSCRIPT_PATH", "gs")
                or _which_or_env("GHOSTSCRIPT_PATH", "gswin64c")
                or _which_or_env("GHOSTSCRIPT_PATH", "gswin32c")
            )
            if not gs_bin:
                raise HTTPException(
                    status_code=503,
                    detail="Ghostscript is not installed. Install Ghostscript and/or set GHOSTSCRIPT_PATH to the console executable (e.g. gswin64c).",
                )
            cmd = [
                gs_bin,
                "-sDEVICE=pdfwrite",
                "-dCompatibilityLevel=1.4",
                f"-dPDFSETTINGS=/{preset}",
                "-dNOPAUSE",
                "-dQUIET",
                "-dBATCH",
                f"-sOutputFile={out_path}",
                tmp_path,
            ]

        try:
            subprocess.run(cmd, check=True, timeout=timeout_s)
        except subprocess.TimeoutExpired:
            raise HTTPException(status_code=504, detail="Compression timed out. Try a smaller file or a faster mode.")
        except subprocess.CalledProcessError:
            raise HTTPException(status_code=500, detail="Compression failed in external engine.")

        # If external engine didn't shrink, return original.
        try:
            out_size = os.path.getsize(out_path) if out_path else None
        except Exception:
            out_size = None
        if original_size is not None and out_size is not None and out_size >= original_size:
            return _file_to_streaming_pdf(tmp_path, filename="compressed.pdf")

        return _file_to_streaming_pdf(out_path, filename="compressed.pdf")
    finally:
        # Cleanup temp files
        if out_path:
            try:
                os.unlink(out_path)
            except Exception:
                pass
        if tmp_path:
            try:
                os.unlink(tmp_path)
            except Exception:
                pass


@app.post("/pdf/protect")
async def pdf_protect(
    file: UploadFile = File(...),
    password: str = Form(...),
    allow_print: bool = Form(True),
    allow_copy: bool = Form(False),
    allow_edit: bool = Form(False),
) -> StreamingResponse:
    """
    Add password protection to a PDF using pypdf.
    """
    if not _is_pdf_upload(file):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    try:
        data = await file.read()
        reader = PdfReader(BytesIO(data))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid PDF file")

    try:
        import cryptography  # noqa: F401 — required for AES encryption in pypdf
    except ImportError:
        raise HTTPException(
            status_code=503,
            detail="PDF encryption needs crypto support. Install with: pip install 'pypdf[crypto]'",
        )

    writer = PdfWriter()
    for page in reader.pages:
        writer.add_page(page)

    perms_flag = 0
    if allow_print:
        perms_flag |= PdfUserPerms.PRINT | PdfUserPerms.PRINT_TO_REPRESENTATION
    if allow_copy:
        perms_flag |= PdfUserPerms.EXTRACT | PdfUserPerms.EXTRACT_TEXT_AND_GRAPHICS
    if allow_edit:
        perms_flag |= PdfUserPerms.MODIFY | PdfUserPerms.ADD_OR_MODIFY

    try:
        writer.encrypt(
            user_password=password,
            owner_password=password,
            permissions_flag=perms_flag,
            algorithm="AES-256",
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Encryption failed: {e}. Ensure 'pypdf[crypto]' is installed.",
        )

    out_buf = BytesIO()
    try:
        writer.write(out_buf)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to write protected PDF: {e}")
    writer.close()

    return _bytes_to_streaming_pdf(out_buf, filename="protected.pdf")


@app.post("/pdf/unlock")
async def pdf_unlock(
    file: UploadFile = File(...),
    password: str = Form(...),
) -> StreamingResponse:
    """
    Remove password protection from a PDF when the correct password is provided.
    """
    if not _is_pdf_upload(file):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    data = await file.read()
    try:
        reader = PdfReader(BytesIO(data))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid PDF file")

    if reader.is_encrypted:
        try:
            ok = reader.decrypt(password)
        except Exception:
            ok = 0
        # pypdf returns 0 on failure, 1/2 for success depending on password type
        if ok == 0:
            raise HTTPException(status_code=401, detail="Incorrect password")

    writer = PdfWriter()
    for page in reader.pages:
        writer.add_page(page)

    out_buf = BytesIO()
    writer.write(out_buf)
    writer.close()

    return _bytes_to_streaming_pdf(out_buf, filename="unlocked.pdf")


# =========================
# FILE TOOL ENDPOINTS (ZIP)
# =========================


@app.post("/file/create-archive")
async def file_create_archive(
    files: list[UploadFile] = File(...),
    archive_name: str = Form("archive"),
) -> StreamingResponse:
    """
    Pack uploaded files into a single ZIP download.
    """
    if not files:
        raise HTTPException(status_code=400, detail="At least one file is required")

    safe_name = _sanitize_archive_basename(archive_name)

    zip_buf = BytesIO()
    with zipfile.ZipFile(zip_buf, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        used_names: set[str] = set()
        for upload in files:
            try:
                raw = await upload.read()
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Failed to read upload: {e}")
            base = os.path.basename(upload.filename or "file")
            if not base or base in (".", ".."):
                base = "file"
            member = base
            n = 1
            while member in used_names:
                stem, _, ext = base.rpartition(".")
                if ext and stem:
                    member = f"{stem}_{n}.{ext}"
                else:
                    member = f"{base}_{n}"
                n += 1
            used_names.add(member)
            zf.writestr(member, raw)

    zip_buf.seek(0)
    headers = {"Content-Disposition": f'attachment; filename="{safe_name}.zip"'}
    return StreamingResponse(zip_buf, media_type="application/zip", headers=headers)


# =========================
# IMAGE TOOL ENDPOINTS
# =========================


@app.post("/image/compress")
async def image_compress(
    files: list[UploadFile] = File(...),
    quality: int = Form(75),  # 10-100
) -> StreamingResponse:
    """
    Compress images by reducing quality (JPEG/WebP) or optimizing (PNG).
    Returns a ZIP file with all compressed images.
    """
    if not files:
        raise HTTPException(status_code=400, detail="At least one image is required")
    
    quality = max(10, min(100, quality))  # Clamp to valid range
    
    zip_buf = BytesIO()
    with zipfile.ZipFile(zip_buf, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for upload in files:
            try:
                contents = await upload.read()
                img = Image.open(BytesIO(contents))
                
                # Convert RGBA to RGB for JPEG
                if img.mode in ("RGBA", "LA", "P"):
                    if upload.filename and upload.filename.lower().endswith((".jpg", ".jpeg")):
                        # Create white background for JPEG
                        rgb_img = Image.new("RGB", img.size, (255, 255, 255))
                        if img.mode == "P":
                            img = img.convert("RGBA")
                        rgb_img.paste(img, mask=img.split()[-1] if img.mode in ("RGBA", "LA") else None)
                        img = rgb_img
                    else:
                        img = img.convert("RGB")
                
                # Determine output format from original filename or use JPEG
                ext = "jpg"
                if upload.filename:
                    lower = upload.filename.lower()
                    if lower.endswith(".png"):
                        ext = "png"
                    elif lower.endswith(".webp"):
                        ext = "webp"
                
                img_buf = BytesIO()
                if ext == "png":
                    # PNG: optimize by converting to RGB if no transparency needed
                    if img.mode == "RGBA":
                        # Keep PNG for transparency
                        img.save(img_buf, format="PNG", optimize=True, compress_level=9)
                    else:
                        # Convert to RGB and save as optimized PNG
                        img = img.convert("RGB")
                        img.save(img_buf, format="PNG", optimize=True, compress_level=9)
                elif ext == "webp":
                    img.save(img_buf, format="WEBP", quality=quality, method=6)
                else:
                    # JPEG
                    img.save(img_buf, format="JPEG", quality=quality, optimize=True)
                
                img_buf.seek(0)
                filename = upload.filename or f"image-{len(zf.namelist())}.{ext}"
                base_name = filename.rsplit(".", 1)[0] if "." in filename else filename
                zf.writestr(f"{base_name}_compressed.{ext}", img_buf.read())
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Failed to process {upload.filename}: {e}")
    
    zip_buf.seek(0)
    headers = {"Content-Disposition": 'attachment; filename="compressed_images.zip"'}
    return StreamingResponse(zip_buf, media_type="application/zip", headers=headers)


@app.post("/image/resize")
async def image_resize(
    image: UploadFile = File(...),
    width: int = Form(...),
    height: int = Form(...),
    maintain_aspect: bool = Form(True),
) -> StreamingResponse:
    """
    Resize an image to specific dimensions.
    - maintain_aspect: If True, fits image within dimensions preserving aspect ratio
    """
    if width <= 0 or height <= 0:
        raise HTTPException(status_code=400, detail="Width and height must be positive")
    
    try:
        contents = await image.read()
        img = Image.open(BytesIO(contents)).convert("RGB")
        
        if maintain_aspect:
            # Fit within dimensions while preserving aspect ratio
            img.thumbnail((width, height), Image.Resampling.LANCZOS)
        else:
            # Resize to exact dimensions (may distort)
            img = img.resize((width, height), Image.Resampling.LANCZOS)
        
        buf = _pil_to_bytes(img, format="JPEG")
        return StreamingResponse(buf, media_type="image/jpeg")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to resize image: {e}")


@app.post("/image/rotate")
async def image_rotate(
    image: UploadFile = File(...),
    rotation: int = Form(0),  # degrees: 0, 90, 180, 270, or any angle
    flip_horizontal: bool = Form(False),
    flip_vertical: bool = Form(False),
) -> StreamingResponse:
    """
    Rotate and/or flip an image.
    - rotation: degrees (0-360), will be normalized
    - flip_horizontal: mirror left-right
    - flip_vertical: mirror top-bottom
    """
    try:
        contents = await image.read()
        img = Image.open(BytesIO(contents)).convert("RGB")
        
        # Normalize rotation to 0-360
        rotation = rotation % 360
        
        # Apply rotation
        if rotation != 0:
            # For 90/180/270, use transpose for better quality
            if rotation == 90:
                img = img.transpose(Image.Transpose.ROTATE_90)
            elif rotation == 180:
                img = img.transpose(Image.Transpose.ROTATE_180)
            elif rotation == 270:
                img = img.transpose(Image.Transpose.ROTATE_270)
            else:
                # Arbitrary angle rotation
                img = img.rotate(-rotation, expand=True, fillcolor=(255, 255, 255))
        
        # Apply flips
        if flip_horizontal:
            img = img.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
        if flip_vertical:
            img = img.transpose(Image.Transpose.FLIP_TOP_BOTTOM)
        
        buf = _pil_to_bytes(img, format="JPEG")
        return StreamingResponse(buf, media_type="image/jpeg")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to rotate image: {e}")


@app.post("/image/convert")
async def image_convert(
    files: list[UploadFile] = File(...),
    output_format: str = Form("png"),  # png, jpg, webp, gif
) -> StreamingResponse:
    """
    Convert images to a different format.
    Supports batch conversion - returns ZIP with all converted images.
    """
    if not files:
        raise HTTPException(status_code=400, detail="At least one image is required")
    
    fmt = output_format.lower()
    if fmt not in {"png", "jpg", "jpeg", "webp", "gif"}:
        raise HTTPException(status_code=400, detail="Invalid format. Use: png, jpg, webp, or gif")
    
    # Normalize format names
    if fmt == "jpeg":
        fmt = "jpg"
    
    zip_buf = BytesIO()
    with zipfile.ZipFile(zip_buf, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for upload in files:
            try:
                contents = await upload.read()
                img = Image.open(BytesIO(contents))
                
                # Convert RGBA to RGB for formats that don't support transparency
                if fmt in ("jpg", "jpeg") and img.mode in ("RGBA", "LA", "P"):
                    rgb_img = Image.new("RGB", img.size, (255, 255, 255))
                    if img.mode == "P":
                        img = img.convert("RGBA")
                    rgb_img.paste(img, mask=img.split()[-1] if img.mode in ("RGBA", "LA") else None)
                    img = rgb_img
                elif img.mode == "P":
                    img = img.convert("RGBA" if fmt == "png" else "RGB")
                elif fmt in ("jpg", "jpeg") and img.mode not in ("RGB", "L"):
                    img = img.convert("RGB")
                
                img_buf = BytesIO()
                if fmt == "png":
                    img.save(img_buf, format="PNG", optimize=True)
                elif fmt == "webp":
                    img.save(img_buf, format="WEBP", quality=90, method=6)
                elif fmt == "gif":
                    # GIF conversion
                    if img.mode != "P":
                        img = img.convert("P", palette=Image.Palette.ADAPTIVE)
                    img.save(img_buf, format="GIF", optimize=True)
                else:  # jpg
                    img.save(img_buf, format="JPEG", quality=90, optimize=True)
                
                img_buf.seek(0)
                filename = upload.filename or f"image-{len(zf.namelist())}"
                base_name = filename.rsplit(".", 1)[0] if "." in filename else filename
                zf.writestr(f"{base_name}.{fmt}", img_buf.read())
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Failed to convert {upload.filename}: {e}")
    
    zip_buf.seek(0)
    headers = {"Content-Disposition": f'attachment; filename="converted_{fmt}.zip"'}
    return StreamingResponse(zip_buf, media_type="application/zip", headers=headers)


@app.post("/image/watermark")
async def image_watermark(
    image: UploadFile = File(...),
    watermark_type: str = Form("text"),  # "text" or "image"
    watermark_text: str = Form(""),
    watermark_image: UploadFile = File(None),
    position: str = Form("bottom-right"),  # top-left, top-right, center, bottom-left, bottom-right
    opacity: int = Form(50),  # 10-100
) -> StreamingResponse:
    """
    Add a text or image watermark to an image.
    """
    if watermark_type == "text" and not watermark_text:
        raise HTTPException(status_code=400, detail="Watermark text is required for text watermarks")
    if watermark_type == "image" and not watermark_image:
        raise HTTPException(status_code=400, detail="Watermark image is required for image watermarks")
    
    opacity = max(10, min(100, opacity)) / 100.0  # Convert to 0.0-1.0
    
    try:
        contents = await image.read()
        base_img = Image.open(BytesIO(contents)).convert("RGBA")
        
        if watermark_type == "text":
            # Create text watermark
            from PIL import ImageDraw, ImageFont
            
            # Try to use a default font, fallback to basic if not available
            try:
                # Try to load a system font (varies by OS)
                font_size = max(24, min(base_img.width, base_img.height) // 20)
                try:
                    font = ImageFont.truetype("arial.ttf", font_size)
                except:
                    try:
                        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
                    except:
                        font = ImageFont.load_default()
            except:
                font = ImageFont.load_default()
            
            # Create a temporary image to measure text
            temp_img = Image.new("RGBA", (1, 1))
            draw_temp = ImageDraw.Draw(temp_img)
            bbox = draw_temp.textbbox((0, 0), watermark_text, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
            
            # Create watermark image with padding
            padding = 20
            watermark = Image.new("RGBA", (text_width + padding * 2, text_height + padding * 2), (0, 0, 0, 0))
            draw = ImageDraw.Draw(watermark)
            
            # Draw text with semi-transparent background
            text_x = padding
            text_y = padding
            draw.text((text_x, text_y), watermark_text, fill=(255, 255, 255, int(255 * opacity)), font=font)
            
        else:
            # Image watermark
            wm_contents = await watermark_image.read()
            watermark = Image.open(BytesIO(wm_contents)).convert("RGBA")
            
            # Resize watermark to be ~20% of base image (max)
            max_size = (int(base_img.width * 0.2), int(base_img.height * 0.2))
            watermark.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # Apply opacity
            alpha = watermark.split()[3]
            alpha = alpha.point(lambda p: int(p * opacity))
            watermark.putalpha(alpha)
        
        # Calculate position
        wm_width, wm_height = watermark.size
        margin = 20
        
        if position == "top-left":
            x, y = margin, margin
        elif position == "top-right":
            x, y = base_img.width - wm_width - margin, margin
        elif position == "center":
            x, y = (base_img.width - wm_width) // 2, (base_img.height - wm_height) // 2
        elif position == "bottom-left":
            x, y = margin, base_img.height - wm_height - margin
        else:  # bottom-right (default)
            x, y = base_img.width - wm_width - margin, base_img.height - wm_height - margin
        
        # Composite watermark onto base image
        result = Image.alpha_composite(base_img, Image.new("RGBA", base_img.size, (0, 0, 0, 0)))
        result.paste(watermark, (x, y), watermark)
        
        # Convert back to RGB for JPEG output (or keep RGBA for PNG)
        output_format = "PNG" if base_img.mode == "RGBA" else "JPEG"
        if output_format == "JPEG":
            result = result.convert("RGB")
        
        buf = _pil_to_bytes(result, format=output_format)
        media_type = "image/png" if output_format == "PNG" else "image/jpeg"
        return StreamingResponse(buf, media_type=media_type)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to add watermark: {e}")


