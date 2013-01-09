#!/usr/bin/env python

from glob import glob
import os
from shutil import rmtree

from PIL import Image

output_dir = 'www/img/art'
widths = [120, 480, 979, 1200]

rmtree(output_dir)
os.mkdir(output_dir)

for path in glob('art/*.png'):
    filename = os.path.split(path)[-1]
    name = os.path.splitext(filename)[0]

    original = Image.open(path)

    # Convert alpha layer to black background
    # Wisdom from:
    # http://stackoverflow.com/a/9459208
    # http://stackoverflow.com/a/1963146
    if original.mode in ['LA', 'RGBA']:
        opaque = Image.new('RGB', original.size, (0, 0, 0))
        opaque.paste(original, mask=original.convert('RGBA').split()[-1])

        original = opaque

    for width in widths:
        output_path = os.path.join(output_dir, '%s_%i.jpg' % (name, width)) 

        width_pct = width / float(original.size[0])
        height = int(float(original.size[1] * width_pct))

        if width == widths[0]:
            if original.size[1] < original.size[0] * 3 / 4:
                h = original.size[1]
                w = h * 4 / 3
            else:
                w = original.size[0]
                h = w * 3 / 4

            img = original.crop((0, 0, w, h))
        
            width_pct = width / float(img.size[0])
            height = int(float(img.size[1] * width_pct))
        else:
            img = original

        print 'Cutting %s at %ix%i' % (name, width, height)
        img = img.resize((width, height), Image.ANTIALIAS)
        img.save(output_path)
