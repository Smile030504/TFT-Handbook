#!/usr/bin/env python3
"""Build a single-file, offline TFT Handbook from readable source files.

Usage: python build.py
Output: ./index.html (do not edit this generated file directly)
"""
from pathlib import Path
import base64, json, re

ROOT=Path(__file__).resolve().parent
SRC=ROOT/'src'
TEMPLATE=(SRC/'template.html').read_text(encoding='utf-8')

# The order is intentionally the original runtime order.
STYLE_FILES=['base.css', 'traits.css', 'unlocks.css']
JS_FILES=['core.js','unlocks.js','units-and-filters.js','traits.js']
DATA_IDS={
 'unlockRules':'unlocks.json',
 'skillData':'skills.json',
 'rosterData':'champions.json',
 'effectDefs':'effects.json',
 'traitInfo':'traits.json',
}

def image_data_url(path):
    mime={'.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png',
          '.webp':'image/webp','.svg':'image/svg+xml'}[path.suffix.lower()]
    return f'data:{mime};base64,'+base64.b64encode(path.read_bytes()).decode('ascii')

def image_map(name):
    mapping=json.loads((SRC/'data'/name).read_text(encoding='utf-8'))
    for key,value in mapping.items():
        if isinstance(value,str) and value.startswith('assets/'):
            target=(SRC/value).resolve()
            if not target.is_relative_to(SRC.resolve()):
                raise ValueError('Invalid asset path: '+value)
            mapping[key]=image_data_url(target)
    return mapping


def json_script(script_id,data):
    payload=json.dumps(data,ensure_ascii=False,separators=(',',':'))
    payload=payload.replace('</','<\\/')
    return f'<script id="{script_id}" type="application/json">{payload}</script>'

def main():
    html=TEMPLATE
    css=[(SRC/'styles'/name).read_text(encoding='utf-8') for name in STYLE_FILES]
    # Preserve the same ordering and cascade as the original page.
    html=html.replace('<!-- INJECT:CSS:0 -->','<style>'+css[0]+'</style>')
    html=html.replace('<!-- INJECT:CSS:1 -->','<style>'+'\n'.join(css[1:])+'</style>')
    for script_id,filename in DATA_IDS.items():
        data=json.loads((SRC/'data'/filename).read_text(encoding='utf-8'))
        html=html.replace('<!-- INJECT:DATA:'+script_id+' -->',json_script(script_id,data))
    html=html.replace('<!-- INJECT:DATA:savedData -->',
                       json_script('savedData',image_map('champion-images.json')))
    html=html.replace('<!-- INJECT:DATA:traitIconData -->',
                       json_script('traitIconData',image_map('trait-icons.json')))
    js='\n'.join((SRC/'js'/filename).read_text(encoding='utf-8') for filename in JS_FILES)
    html=html.replace('<!-- INJECT:JS -->',
                      '<script>(()=>{\n'+js.replace('</script','<\\/script')+'\n})();</script>')
    if '<!-- INJECT:' in html:
        raise ValueError('Unresolved build placeholder')
    (ROOT/'index.html').write_text(html,encoding='utf-8')
    print('Built index.html:',(ROOT/'index.html').stat().st_size,'bytes')

if __name__=='__main__':
    main()
