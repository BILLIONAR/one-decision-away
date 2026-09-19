import re, json, glob, sys
pat = re.compile(r"""\b(?:t|N_)\(\s*(?:'((?:\\.|[^'\\])*)'|"((?:\\.|[^"\\])*)"|`((?:\\.|[^`\\])*)`)""")
keys = {}
bad = []
for f in sorted(glob.glob('src/**/*.ts*', recursive=True)):
    if '/i18n/' in f: continue
    s = open(f).read()
    for m in pat.finditer(s):
        raw = m.group(1) if m.group(1) is not None else (m.group(2) if m.group(2) is not None else m.group(3))
        if m.group(3) is not None and '${' in raw:
            bad.append((f, raw)); continue
        key = bytes(raw, 'utf-8').decode('unicode_escape').encode('latin1').decode('utf-8') if '\\' in raw else raw
        keys.setdefault(key, f)
json.dump(sorted(keys.keys()), open('i18n_keys.json','w'), ensure_ascii=False, indent=0)
print(len(keys), 'keys;', len(bad), 'bad template keys')
for b in bad[:20]: print(' BAD', b)
