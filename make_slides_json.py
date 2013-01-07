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
        #'photo1_url': row[1],
        'caption1': row[2],
        #'photo2_url': row[3],
        'caption2': row[4],
        'text': row[5],
        'book_quote': row[6],
        'transcript': row[7],
        'is_paused': row[8].lower() == 'true',
        'theme': row[9],
        'notes': row[10],
    }

    # Extract image_name
    slide['photo1_name'] = get_photo_name(row[1]) 
    slide['photo2_name'] = get_photo_name(row[3]) 

    slides.append(slide)

with open('www/slides.json', 'w') as f:
    f.write(json.dumps(slides))
