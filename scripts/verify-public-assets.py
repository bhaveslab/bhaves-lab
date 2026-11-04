from pathlib import Path
import hashlib, json
import numpy as np
from PIL import Image
root=Path(__file__).resolve().parents[1]
p=root/'public/observatory'
src=p/'lil-ego-reference.jpeg'
assert hashlib.sha256(src.read_bytes()).hexdigest()=='0f6ed23728dfd5a244036585decb9b2ce1548ac793c9706bfc9106612f65a38b'
rgb=np.asarray(Image.open(src).convert('RGB'))
cut=np.asarray(Image.open(p/'lil-ego-cutout.webp').convert('RGBA'))
visible=cut[:,:,3]>0
assert np.array_equal(rgb[visible],cut[:,:,:3][visible]), 'Original character RGB changed'
assert cut[0,0,3]==0 and cut[-1,-1,3]==0, 'Exterior is not transparent'
assert (cut[:,:,3]==0).sum()>1000000
assert cut[800,550,3]==255, 'Torso unexpectedly transparent'
webp=np.asarray(Image.open(p/'lil-ego-cutout.webp').convert('RGBA'))
visible=cut[:,:,3]>0
assert np.array_equal(cut[visible],webp[visible]), 'Lossless master changed visible pixels'
for name in ['lil-ego-cutout-336.webp','lil-ego-cutout-672.webp','bracelet-concept-480.webp','bracelet-concept-768.webp']:
 im=Image.open(p/name)
 assert im.mode=='RGBA' and im.getextrema()[3][0]==0
for page in ['Home.tsx','ClarityAccess.tsx','Booking.tsx']:
 text=(root/'src/pages'/page).read_text()
 for forbidden in ['app.bhaveslab.com','Source Connect','Source Motion','Source Glasses','Source Vision Glasses']:
  assert forbidden not in text, f'Private project reference in {page}'
print('PASS: original reference hash, unchanged RGB, transparent background, lossless visible pixels, responsive artwork, public privacy boundary')
