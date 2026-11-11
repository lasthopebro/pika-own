"""Baut data/seed-folders.json und data/seed-dials.json aus allen lokalen Browsern.

Liest nur KOPIEN der Browserdateien. Die Ausgabe enthaelt echte Nutzerdaten und bleibt
dank .gitignore (data/) lokal. Aufruf: python -I tools/build_seed.py
"""
import glob
import json
import os
import shutil
import sqlite3
import tempfile
from collections import defaultdict
from urllib.parse import urlsplit

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data")
APPDATA, LOCAL = os.environ["APPDATA"], os.environ["LOCALAPPDATA"]
TEMPLATE = "MFgXhOmb.Profil 1"  # Firefox-Profil "555555555555": Vorlage der Ordnerstruktur
SKIP = ("Guest Profile", "System Profile")


def norm(u):
    p = urlsplit(u)
    return (p.scheme + "://" + p.netloc + p.path.rstrip("/") + ("?" + p.query if p.query else "")).lower()


def is_http(u):
    return bool(u) and u.startswith(("http://", "https://"))


def open_copy(path):
    """SQLite-Datei samt WAL in einen Temp-Ordner kopieren und schreibgeschuetzt oeffnen."""
    d = tempfile.mkdtemp()
    for ext in ("", "-wal"):
        if os.path.exists(path + ext):
            shutil.copy(path + ext, os.path.join(d, os.path.basename(path) + ext))
    return sqlite3.connect("file:" + os.path.join(d, os.path.basename(path)) + "?mode=ro", uri=True)


class Collect:
    def __init__(self):
        self.folders = {}  # path(tuple) -> list[(title,url)]
        self.seen = set()
        self.visits = {}  # norm url -> (url,title,visits)

    def folder(self, path):
        self.folders.setdefault(tuple(path), [])

    def add(self, path, title, url):
        k = norm(url)
        if k in self.seen:
            return
        self.seen.add(k)
        self.folder(path)
        self.folders[tuple(path)].append((title.strip()[:200] or url, url))

    def hist(self, url, title, v):
        if not is_http(url) or not v:
            return
        k = norm(url)
        old = self.visits.get(k)
        if not old or v > old[2]:
            self.visits[k] = (url, (title or "")[:120], v)


def firefox(c, profile, keep_empty):
    db = os.path.join(profile, "places.sqlite")
    if not os.path.exists(db):
        return
    con = open_copy(db)
    rows = con.execute("select b.id,b.parent,b.type,b.title,b.guid,p.url from moz_bookmarks b left join moz_places p on p.id=b.fk").fetchall()
    kids = defaultdict(list)
    for r in rows:
        kids[r[1]].append(r)
    roots = {"toolbar_____": [], "menu________": ["Weitere", "Menue"], "unfiled_____": ["Weitere", "Unsortiert"]}

    def walk(pid, path):
        for id_, _, typ, title, _, url in kids[pid]:
            if typ == 2:
                p = path + [title or "Ordner"]
                if keep_empty:
                    c.folder(p)
                walk(id_, p)
            elif typ == 1 and is_http(url):
                c.add(path, title or "", url)

    for r in rows:
        if r[4] in roots:
            walk(r[0], roots[r[4]])
    for url, title, v in con.execute("select url,title,visit_count from moz_places where visit_count>0"):
        c.hist(url, title, v)


def chromium(c, profile):
    bm = os.path.join(profile, "Bookmarks")
    if os.path.exists(bm):
        try:
            roots = json.load(open(bm, encoding="utf8"))["roots"]
        except (OSError, ValueError):
            roots = {}

        def walk(n, path):
            for ch in n.get("children", []):
                if ch["type"] == "folder":
                    walk(ch, path + [ch["name"] or "Ordner"])
                elif is_http(ch.get("url")):
                    c.add(path, ch.get("name", ""), ch["url"])

        for key, path in (("bookmark_bar", []), ("other", ["Weitere", "Andere"]), ("synced", ["Weitere", "Mobil"])):
            if key in roots:
                walk(roots[key], path)
    hist = os.path.join(profile, "History")
    if os.path.exists(hist):
        try:
            for url, title, v in open_copy(hist).execute("select url,title,visit_count from urls where visit_count>0"):
                c.hist(url, title, v)
        except (sqlite3.Error, OSError) as e:
            print("  History nicht lesbar:", os.path.basename(profile), e)


def main():
    c = Collect()
    ff = sorted(glob.glob(os.path.join(APPDATA, "Mozilla", "Firefox", "Profiles", "*")), key=lambda p: os.path.basename(p) != TEMPLATE)
    for p in ff:
        firefox(c, p, keep_empty=os.path.basename(p) == TEMPLATE)
    cr = glob.glob(os.path.join(LOCAL, "*", "*", "User Data", "*")) + glob.glob(os.path.join(LOCAL, "*", "User Data", "*"))
    for p in sorted(cr):
        if os.path.isdir(p) and os.path.basename(p) not in SKIP and (os.path.exists(os.path.join(p, "Bookmarks")) or os.path.exists(os.path.join(p, "History"))):
            chromium(c, p)

    folders = [{"path": list(k), "items": [{"t": t, "u": u} for t, u in v]} for k, v in c.folders.items() if k or v]
    dom = defaultdict(list)
    for url, title, v in c.visits.values():
        dom[urlsplit(url).netloc.lower().removeprefix("www.")].append((url, title, v))
    top = sorted(dom.items(), key=lambda kv: -sum(x[2] for x in kv[1]))[:400]
    dials = [{"d": d, "subs": [{"u": u, "t": t, "v": v} for u, t, v in sorted(s, key=lambda x: -x[2])[:10]]} for d, s in top]

    os.makedirs(OUT, exist_ok=True)
    json.dump(folders, open(os.path.join(OUT, "seed-folders.json"), "w", encoding="utf8"), ensure_ascii=False)
    json.dump(dials, open(os.path.join(OUT, "seed-dials.json"), "w", encoding="utf8"), ensure_ascii=False)
    print(f"Ordner: {len(folders)}, Lesezeichen: {sum(len(f['items']) for f in folders)}, Domains fuer Schnellwahl: {len(dials)}")


if __name__ == "__main__":
    main()
