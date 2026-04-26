#!/usr/bin/env python3
"""Generate multilingual CSV story decks from Project Gutenberg texts.

Usage:
    uv run csv-reader/generate.py --book 11339 --story "The Tortoise and the Hare" \
        --languages chinese french --pages 20 --output csv-reader/tortoise.csv

    # List stories in a book:
    uv run csv-reader/generate.py --book 11339 --list-stories
"""
import argparse
import csv
import json
import os
import re
import sys
import textwrap
import urllib.request

import requests
from deep_translator import GoogleTranslator

GUTENDEX_API = "https://gutendex.com/books"
PEXELS_API = "https://api.pexels.com/v1/search"
UNSPLASH_API = "https://api.unsplash.com/search/photos"

LANG_CODES = {
    "chinese": "zh-CN",
    "french": "fr",
    "spanish": "es",
    "german": "de",
    "japanese": "ja",
    "korean": "ko",
    "portuguese": "pt",
    "italian": "it",
    "russian": "ru",
    "arabic": "ar",
    "hindi": "hi",
}


def fetch_book_text(book_id: int) -> str:
    meta = json.loads(urllib.request.urlopen(f"{GUTENDEX_API}/{book_id}").read())
    formats = meta.get("formats", {})
    txt_url = formats.get("text/plain; charset=utf-8") or formats.get("text/plain")
    if not txt_url:
        for k, v in formats.items():
            if "text/plain" in k:
                txt_url = v
                break
    if not txt_url:
        sys.exit(f"no plain text format for book {book_id}")
    return urllib.request.urlopen(txt_url).read().decode("utf-8", errors="replace")


def strip_gutenberg_header_footer(text: str) -> str:
    start = re.search(r"\*\*\*\s*START OF.*?\*\*\*", text)
    end = re.search(r"\*\*\*\s*END OF.*?\*\*\*", text)
    if start:
        text = text[start.end():]
    if end:
        text = text[:end.start()]
    return text.strip()


def extract_stories(text: str) -> dict[str, str]:
    chunks: dict[str, str] = {}
    parts = re.split(r"\n{2,}(?=[A-Z][A-Z ]{5,}(?:\n|$))", text)
    if len(parts) < 3:
        parts = re.split(r"\n{2,}(?=(?:FABLE|STORY|CHAPTER|TALE)[\s\dIVXLC.:]+)", text, flags=re.IGNORECASE)
    if len(parts) < 3:
        heading_re = re.compile(r"^(?:#{1,3}\s+)?(.+)$", re.MULTILINE)
        current_title = None
        current_body: list[str] = []
        for line in text.split("\n"):
            m = heading_re.match(line.strip())
            if m and len(line.strip()) < 80 and line.strip().isupper():
                if current_title and current_body:
                    chunks[current_title] = "\n".join(current_body)
                current_title = m.group(1).strip().title()
                current_body = []
            elif current_title is not None:
                current_body.append(line)
        if current_title and current_body:
            chunks[current_title] = "\n".join(current_body)
    else:
        for part in parts:
            lines = part.strip().split("\n")
            title = lines[0].strip().strip(".")
            body = "\n".join(lines[1:]).strip()
            if title and body and len(body) > 100:
                chunks[title.title()] = body
    return chunks


def split_into_sentences(text: str) -> list[str]:
    text = re.sub(r"\s+", " ", text).strip()
    raw = re.split(r'(?<=[.!?])\s+(?=[A-Z"\'])', text)
    sentences = []
    for s in raw:
        s = s.strip()
        if s:
            sentences.append(s)
    return sentences


def chunk_sentences(sentences: list[str], max_per_page: int) -> list[str]:
    pages = []
    for i in range(0, len(sentences), max_per_page):
        pages.append(" ".join(sentences[i : i + max_per_page]))
    return pages


def translate_text(text: str, target_lang: str) -> str:
    code = LANG_CODES.get(target_lang, target_lang)
    try:
        return GoogleTranslator(source="en", target=code).translate(text) or text
    except Exception as e:
        print(f"  translate({target_lang}): {e}", file=sys.stderr)
        return text


def search_image(query: str, unsplash_key: str, pexels_key: str) -> str:
    short_query = " ".join(query.split()[:6])
    if unsplash_key:
        try:
            resp = requests.get(
                UNSPLASH_API,
                params={"query": short_query, "per_page": 1},
                headers={"Authorization": f"Client-ID {unsplash_key}"},
                timeout=5,
            )
            data = resp.json()
            if data.get("results"):
                return data["results"][0]["urls"]["regular"]
        except Exception as e:
            print(f"  unsplash: {e}", file=sys.stderr)
    if pexels_key:
        try:
            resp = requests.get(
                PEXELS_API,
                params={"query": short_query, "per_page": 1, "size": "medium"},
                headers={"Authorization": pexels_key},
                timeout=5,
            )
            data = resp.json()
            if data.get("photos"):
                return data["photos"][0]["src"]["medium"]
        except Exception as e:
            print(f"  pexels: {e}", file=sys.stderr)
    return ""


def fallback_image(idx: int) -> str:
    pic_id = 10 + (idx * 7) % 200
    return f"https://picsum.photos/id/{pic_id}/400/300"


def main():
    parser = argparse.ArgumentParser(description="Generate multilingual CSV story decks from Gutenberg")
    parser.add_argument("--book", type=int, required=True, help="Gutenberg book ID")
    parser.add_argument("--story", type=str, help="story/fable title to extract (for collections)")
    parser.add_argument("--list-stories", action="store_true", help="list available stories and exit")
    parser.add_argument("--languages", nargs="+", default=["chinese", "french"], help="target languages")
    parser.add_argument("--max-sentences", type=int, default=2, help="max sentences per page")
    parser.add_argument("--output", type=str, help="output CSV path (auto-generated from story title if omitted)")
    args = parser.parse_args()

    print(f"fetching book {args.book}...")
    raw = fetch_book_text(args.book)
    text = strip_gutenberg_header_footer(raw)
    stories = extract_stories(text)

    if args.list_stories:
        if not stories:
            print("no distinct stories found — book may be a single work")
        else:
            for title in stories:
                print(f"  - {title}")
        return

    real_stories = {k: v for k, v in stories.items() if len(v.strip()) > 500}

    story_name = None
    if args.story:
        key = args.story.strip().title()
        matches = [k for k in real_stories if key.lower() in k.lower()]
        if matches:
            story_name = matches[0]
            text = real_stories[story_name]
        else:
            story_name = args.story.strip().title()
            print(f"no section matched '{args.story}', using full text")
        print(f"using story: {story_name}")
    elif len(real_stories) > 3:
        print(f"book has {len(real_stories)} stories — use --story to pick one:\n")
        for title in real_stories:
            print(f"  - {title}")
        sys.exit(1)
    elif real_stories:
        story_name = next(iter(real_stories))
        text = real_stories[story_name]
        print(f"using story: {story_name}")
    else:
        print("using full text")

    if not args.output:
        slug = re.sub(r"[^a-z0-9]+", "-", (story_name or f"book-{args.book}").lower()).strip("-")
        script_dir = os.path.dirname(os.path.abspath(__file__))
        args.output = os.path.join(script_dir, "decks", f"{slug}.csv")
    print(f"output: {args.output}")

    sentences = split_into_sentences(text)
    print(f"found {len(sentences)} sentences")
    pages = chunk_sentences(sentences, args.max_sentences)
    print(f"chunked into {len(pages)} pages")

    unsplash_key = os.environ.get("UNSPLASH_ACCESS_KEY", "")
    pexels_key = os.environ.get("PEXELS_API_KEY", "")
    if not unsplash_key and not pexels_key:
        print("no UNSPLASH_ACCESS_KEY or PEXELS_API_KEY set — using picsum fallback images", file=sys.stderr)

    columns = ["image", "english"] + args.languages
    rows = []

    for i, page_text in enumerate(pages):
        print(f"page {i + 1}/{len(pages)}: {page_text[:60]}...")

        img = search_image(page_text, unsplash_key, pexels_key)
        if not img:
            img = fallback_image(i)

        row = {"image": img, "english": page_text}
        for lang in args.languages:
            row[lang] = translate_text(page_text, lang)

        rows.append(row)

    with open(args.output, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=columns)
        writer.writeheader()
        writer.writerows(rows)

    print(f"\nwrote {len(rows)} pages to {args.output}")

    script_dir = os.path.dirname(os.path.abspath(__file__))
    manifest_path = os.path.join(script_dir, "decks.json")
    if os.path.exists(manifest_path):
        with open(manifest_path, encoding="utf-8") as f:
            manifest = json.load(f)
    else:
        manifest = []
    rel_path = os.path.relpath(os.path.abspath(args.output), script_dir)
    deck_name = args.story or os.path.splitext(os.path.basename(args.output))[0].replace("-", " ").title()
    if not any(e["file"] == rel_path for e in manifest):
        manifest.append({"name": deck_name, "file": rel_path})
        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump(manifest, f, indent=2, ensure_ascii=False)
        print(f"added '{deck_name}' to {manifest_path}")


if __name__ == "__main__":
    main()
