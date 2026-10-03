"""Reproduce only resized/cropped WebP exports of the supplied licensed photo."""
from pathlib import Path
import hashlib
import json
import PIL
from PIL import Image, ImageOps

folder = Path(__file__).resolve().parent
repo = folder.parents[2]
source = folder / 'oda-hero-wolfgang-moritzer-original.jpg'
assert hashlib.sha256(source.read_bytes()).hexdigest() == '830bd84d81a7cd41135ff6ec0c1c77a57087506964945aabea0521e3cf600a37'
image = ImageOps.exif_transpose(Image.open(source)).convert('RGB')
assert image.size == (3243, 1842)
out = repo / 'public/assets/oda/landing-photo'
out.mkdir(parents=True, exist_ok=True)
exports = []

def export(name, pixels, width, crop):
    height = round(pixels.height * width / pixels.width)
    resized = pixels.resize((width, height), Image.Resampling.LANCZOS)
    path = out / name
    resized.save(path, format='WEBP', quality=86, method=6)
    data = path.read_bytes()
    exports.append({'file':str(path.relative_to(repo)), 'width':width, 'height':height, 'bytes':len(data), 'sha256':hashlib.sha256(data).hexdigest(), 'sourceCrop':crop, 'transform':'EXIF orientation; RGB; uniform LANCZOS resize; WebP quality86/method6. No recolor, retouch, generated pixels or text.'})

for width in (768, 1280, 1920, 2560):
    export(f'hero-dolomites-{width}.webp', image, width, [0, 0, 3243, 1842])
# Portrait art direction retains the trail/illuminated peak and saves mobile bytes.
portrait_width = 1200
left = round((image.width - portrait_width) * .94)
crop = [left, 0, left + portrait_width, image.height]
portrait = image.crop(crop)
for width in (480, 960):
    export(f'hero-dolomites-mobile-{width}.webp', portrait, width, crop)
manifest = {'source':'brand-assets/landing-photo/wolfgang-moritzer/oda-hero-wolfgang-moritzer-original.jpg', 'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(), 'sourceBytes':source.stat().st_size, 'sourceDimensions':[3243,1842], 'photographer':'Wolfgang Moritzer', 'sourceUrl':'https://unsplash.com/photos/landscape-photo-of-mountain-range-during-golden-hour-pn_Pp9P8P2U', 'licenseUrl':'https://unsplash.com/license', 'tool':f'Pillow {PIL.__version__}', 'imageGenerationUsed':False, 'exports':exports}
(folder / 'derivatives.json').write_text(json.dumps(manifest, indent=2)+'\n')
print(json.dumps(exports, indent=2))
