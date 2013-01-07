#!/usr/bin/env python

import csv
import json
import os

def get_photo_name(url):
    filename = url.split('/')[-1] 
    return os.path.splitext(filename)[0]

with open('data/slides.csv') as f:
    rows = list(csv.reader(f))

slides = []

for row in rows[1:]:
    slide = {
        'cue': int(row[0]),
        #'cue2': int(row[1]),
        #'cue3': int(row[2]),
        #'photo1_url': row[3],
        'caption1': row[4],
        #'photo2_url': row[5],
        'caption2': row[6],
        'text': row[7],
        'book_quote': row[8],
        'transcript': row[9],
        'is_paused': row[10].lower() == 'true',
        'chapter': row[11],
        'notes': row[12],
    }

    # Extract image_name
    slide['photo1_name'] = get_photo_name(row[3]) 
    slide['photo2_name'] = get_photo_name(row[5]) 

    slides.append(slide)

with open('www/slides.json', 'w') as f:
    f.write(json.dumps(slides))
