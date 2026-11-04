"""Remove only the authorized review notices; verify all other text and pixels.

Usage: python scripts/finalize-ebooks.py SOURCE_DIRECTORY PRIVATE_OUTPUT_DIRECTORY
Never write the output directory under public/ or commit the PDFs.
Requires PyMuPDF and Pillow. Source files are immutable inputs.
"""
import hashlib
import json
from pathlib import Path
import re
import sys
import fitz
from PIL import Image, ImageChops, ImageDraw

EDITIONS = {
    'en': ('The_Possibility_English_Covered(1).pdf', 'The_Possibility_English_Final.pdf',
           '3d2cb2decac7617a4a7fbdbfc52ca9368e7981674c5ceba0de44a616223daeb1',
           'Editorial edition for author review; not yet released for sale.'),
    'es': ('La_Posibilidad_ES_FINAL_REVIEW(1).pdf', 'La_Posibilidad_Spanish_Final.pdf',
           '587d2ec64616b566a2febef6da26f7b8f7743bf6560bf4a537d45388417b3c31',
           'Edición editorial para revisión del autor; aún no disponible para la venta.'),
}
def sha(data):
    return hashlib.sha256(data).hexdigest()
def normalized(text):
    return re.sub(r'\s+', ' ', text).strip()

source_dir, output_dir = map(Path, sys.argv[1:3])
output_dir.mkdir(parents=True, exist_ok=True)
assert 'public' not in output_dir.resolve().parts
manifest = {}
for lang, (source_name, output_name, expected, notice) in EDITIONS.items():
    source = source_dir / source_name
    assert sha(source.read_bytes()) == expected, f'{lang}: unexpected source'
    original = fitz.open(source)
    edited = fitz.open(source)
    assert len(original) == 12
    page = edited[2]
    rects = page.search_for(notice)
    assert len(rects) == 2, f'{lang}: notice not uniquely located'
    assert normalized(notice) in normalized(page.get_text())
    for rect in rects:
        page.add_redact_annot(rect, fill=(1, 1, 1), cross_out=False)
    page.apply_redactions(images=0, graphics=0)
    metadata = edited.metadata
    if lang == 'en':
        assert metadata['subject'] == 'Bhavé’s Lab ebook review edition'
        metadata['subject'] = 'Bhavé’s Lab ebook'
        edited.set_metadata(metadata)
    output = output_dir / output_name
    edited.save(output, garbage=4, deflate=True, no_new_id=True)
    edited.close()
    final = fitz.open(output)
    for index in range(12):
        before_text = normalized(original[index].get_text())
        after_text = normalized(final[index].get_text())
        expected_text = normalized(before_text.replace(notice, '')) if index == 2 else before_text
        assert after_text == expected_text, f'{lang}: unexpected manuscript edit on page {index+1}'
        before = original[index].get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
        after = final[index].get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
        a = Image.frombytes('RGB', (before.width, before.height), before.samples)
        b = Image.frombytes('RGB', (after.width, after.height), after.samples)
        diff = ImageChops.difference(a, b)
        if index == 2:
            mask = ImageDraw.Draw(diff)
            for r in rects:
                mask.rectangle((int(r.x0*2)-2, int(r.y0*2)-2, int(r.x1*2)+2, int(r.y1*2)+2), fill=(0,0,0))
        assert diff.getbbox() is None, f'{lang}: unexpected visual change on page {index+1}'
    assert 'not yet released for sale' not in ''.join(p.get_text() for p in final)
    assert 'no disponible para la venta' not in ''.join(p.get_text() for p in final)
    final[2].get_pixmap(matrix=fitz.Matrix(1, 1)).save(output_dir / f'{lang}-copyright-final.png')
    data = output.read_bytes()
    manifest[lang] = {'filename': output_name, 'bytes': len(data), 'sha256': sha(data),
                      'sourceSha256': expected, 'pages': 12, 'manuscriptTextUnchanged': True,
                      'pixelsOutsideNoticeUnchangedAt144dpi': True, 'coverPixelsUnchanged': True}
    final.close()
    original.close()
(output_dir / 'final-ebooks-manifest.json').write_text(json.dumps(manifest, indent=2)+'\n')
print(json.dumps(manifest, indent=2))
