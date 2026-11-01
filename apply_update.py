#!/usr/bin/env python3
"""Patch an EXISTING Pace Gaming KPI ZIP with the page-2 New Players section.
Usage: python apply_update.py path/to/Pace_Gaming_KPI_System_v75_Manual_New_Player_Names.zip
Creates: ..._V76_New_Players_Page_2.zip
Uses only the Python standard library. Does not change or expose actual player-name data.
"""
from __future__ import annotations
import sys
import zipfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
JS = HERE / 'pace_kpi_new_players_page2.js'
CSS = HERE / 'pace_kpi_new_players_page2.css'


def run(source_zip: Path):
    if not source_zip.is_file():
        raise FileNotFoundError(f'ZIP file not found: {source_zip}')
    with zipfile.ZipFile(source_zip, 'r') as inp:
        files = {item.filename: inp.read(item) for item in inp.infolist() if not item.is_dir()}
    htmls = [name for name in files if name.endswith('/index.html') or name == 'index.html']
    if not htmls:
        raise ValueError('This ZIP does not contain index.html. Please choose the Pace Gaming KPI system ZIP.')
    # Prefer root containing app.js.
    htmlpath = next((name for name in htmls if (name.rsplit('/',1)[0] + '/app.js' if '/' in name else 'app.js') in files), htmls[0])
    parent = htmlpath.rsplit('/', 1)[0] + '/' if '/' in htmlpath else ''
    appjs = files.get(parent + 'app.js', b'').decode('utf-8', 'ignore')
    if 'paceKpiNewPlayerNamesV1' not in appjs:
        raise ValueError('This update is made for KPI V75 with manual new-player names. The selected ZIP does not appear to be V75.')
    markup = files[htmlpath].decode('utf-8-sig')
    css_tag = '<link rel="stylesheet" href="pace_kpi_new_players_page2.css">'
    script_tag = '<script src="pace_kpi_new_players_page2.js"></script>'
    if css_tag not in markup:
        if '</head>' not in markup: raise ValueError('index.html has no closing </head>.')
        markup = markup.replace('</head>', '  ' + css_tag + '\n</head>', 1)
    if script_tag not in markup:
        if '</body>' not in markup: raise ValueError('index.html has no closing </body>.')
        markup = markup.replace('</body>', '  ' + script_tag + '\n</body>', 1)
    files[htmlpath] = markup.encode('utf-8')
    files[parent + JS.name] = JS.read_bytes()
    files[parent + CSS.name] = CSS.read_bytes()
    files[parent + 'CHANGELOG_V76.txt'] = (
        'V76: Added New Players Added by Executive to page 2 of Month vs Month comparison PDFs.\n'
        'Counts are read from manual executive entries in V75. Player names are never displayed.\n'
        'All existing report and download options remain unchanged.\n'
    ).encode()
    output = source_zip.with_name(source_zip.stem + '_V76_New_Players_Page_2.zip')
    with zipfile.ZipFile(output, 'w', compression=zipfile.ZIP_DEFLATED) as out:
        for name, contents in files.items(): out.writestr(name, contents)
    print(f'Updated system: {output}')
    return output

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print('Usage: python apply_update.py YOUR_PACE_KPI_V75.zip')
        raise SystemExit(2)
    run(Path(sys.argv[1]).expanduser().resolve())
