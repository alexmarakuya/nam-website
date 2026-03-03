# NāM Space — Image Quality & Aspect Ratio

**Updated:** March 2026

## Current setup

### Aspect ratios (standardized to 4:3)
- **Space cards** (card-img): 4:3
- **Activity cards** (act-card): 4:3
- **Timeline entry images** (tl-entry-img): 4:3
- **Timeline sticky images** (tl-sticky-images): 4:3
- **Hero image**: 1440/723 (unchanged)

### Resolution (srcset)
- **Hero**: 2880w, `fetchpriority="high"`
- **Space cards**: 720–760w (or 4096w for casa-nam)
- **Activity cards**: 1376w

## Improving quality further

1. **Re-export at higher JPEG quality**  
   Export at 85–90% quality instead of 70–80% to reduce compression artifacts.

2. **Add WebP versions**  
   Use `<picture>` with WebP + JPEG fallback for smaller file size at same visual quality.

3. **Add 2x variants for retina**  
   For cards, add `-2x` versions (e.g. `ws-shared@2x.jpg` at 1520px) and extend srcset:
   ```html
   srcset="/assets/ws-shared.jpg 760w, /assets/ws-shared@2x.jpg 1520w"
   ```

4. **Source dimensions**  
   Current: 760px for most cards, 1376px for activities, 2880px for hero. For 4:3 at 2x on 378px cards, aim for ~756px width minimum (already met).

---

## AI upscaling

To upscale images with AI for higher resolution:

### Option 1: Upscalpic (Python, Real-ESRGAN)
```bash
pip install upscalpic
upscalpic --input nam-space/assets --output nam-space/assets/upscaled --scale 2
```

### Option 2: Real-ESRGAN (CLI)
```bash
# Install from https://github.com/xinntao/Real-ESRGAN
python inference_realesrgan.py -n RealESRGAN_x4plus -i nam-space/assets -o nam-space/assets/upscaled
```

### Option 3: Online tools
- **Upscale.media** / **Bigjpg.com** — upload and batch upscale (free tier)
- **Topaz Gigapixel AI** — paid, high quality

### Option 4: @upscalerjs/esrgan-slim (Node.js)
```bash
npm install @upscalerjs/esrgan-slim upscaling
```
Then create a script to process images in `nam-space/assets/` and output 2x versions.

### Workflow
1. Run upscaler on `nam-space/assets/*.jpg`
2. Save output as `-2x` variants (e.g. `ws-shared@2x.jpg`) or replace originals
3. Update srcset in HTML to include 2x variants
