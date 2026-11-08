"""Deterministic alpha-only background extraction. Original RGB is never changed."""
from pathlib import Path
import hashlib, json
import numpy as np
from PIL import Image
from scipy import ndimage
root = Path(__file__).resolve().parents[1]
src = root / 'public/observatory/lil-ego-reference.jpeg'
im = Image.open(src).convert('RGB')
rgb = np.asarray(im)
lo, hi = rgb.min(axis=2), rgb.max(axis=2)
background_candidate = (lo > 202) & ((hi.astype(int)-lo.astype(int)) < 35)
seed = np.zeros(lo.shape, dtype=bool)
seed[0,:] = seed[-1,:] = True
seed[:,0] = seed[:,-1] = True
background = ndimage.binary_propagation(seed & background_candidate, mask=background_candidate)
fg = ~background
labels, count = ndimage.label(fg)
sizes = np.bincount(labels.ravel()); sizes[0] = 0
fg = labels == sizes.argmax()
# Exclude the detached photographic floor/shadow outside the sneaker silhouettes.
y,x = np.indices(lo.shape)
fg &= ~(((y > 1280) & (x > 500) & (x < 650)) | (y > 1357) | ((y > 1290) & ((x < 278) | (x > 850))))
alpha = (fg * 255).astype('uint8')
# Feather inward only: never add white exterior pixels to the cutout.
distance = ndimage.distance_transform_edt(fg)
alpha = np.minimum(alpha, np.clip(distance * 180, 0, 255).astype('uint8'))
out = np.dstack([rgb, alpha])
cutout = Image.fromarray(out, 'RGBA')
cutout.save(root / 'public/observatory/lil-ego-cutout.webp', lossless=True, quality=100, method=6, exact=True)
for width in [336, 672]:
    cutout.resize((width, round(cutout.height * width / cutout.width)), Image.Resampling.LANCZOS).save(root / f'public/observatory/lil-ego-cutout-{width}.webp', lossless=True, quality=100, method=6)
evidence = {'source':src.name,'source_sha256':hashlib.sha256(src.read_bytes()).hexdigest(),'dimensions':list(im.size),'original_rgb_retained':bool(np.array_equal(out[:,:,:3],rgb)),'changed_rgb_pixels':int(np.any(out[:,:,:3] != rgb,axis=2).sum()),'extraction':'Edge-connected neutral background mask; alpha-only; no generative redraw.'}
(root / 'docs/lil-ego-provenance.json').write_text(json.dumps(evidence,indent=2)+'\n')
print(json.dumps(evidence))
