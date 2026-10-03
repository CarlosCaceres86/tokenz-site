"""Check local document/asset/fragment integrity without external dependencies."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import re

ROOT = Path(__file__).resolve().parents[1]


class Document(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.path = path
        self.ids = set()
        self.links = []
        self.duplicates = []
        self.errors = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get('id'):
            value = attrs['id']
            if value in self.ids:
                self.duplicates.append(value)
            self.ids.add(value)
        for name in ('href', 'src'):
            if attrs.get(name):
                self.links.append(attrs[name])
        if tag == 'img' and 'alt' not in attrs:
            self.errors.append('Image missing alt')
        if tag == 'html' and attrs.get('lang') != 'es':
            self.errors.append('Spanish language missing')


documents = {}
for path in ROOT.rglob('*.html'):
    if '.git' in path.parts:
        continue
    doc = Document(path)
    doc.feed(path.read_text())
    documents[path] = doc

errors = []
checked = 0
for path, doc in documents.items():
    errors.extend(f'{path.relative_to(ROOT)}: {e}' for e in doc.errors)
    errors.extend(f'{path.relative_to(ROOT)}: duplicate ID {e}' for e in doc.duplicates)
    for link in doc.links:
        url = urlsplit(link)
        if url.scheme or url.netloc:
            continue
        target = (ROOT / unquote(url.path).lstrip('/') if url.path.startswith('/')
                  else path.parent / unquote(url.path)) if url.path else path
        target = target.resolve()
        if target.is_dir():
            target /= 'index.html'
        if not target.is_relative_to(ROOT) or not target.is_file():
            errors.append(f'{path.relative_to(ROOT)}: missing local resource {link}')
        elif url.fragment and target in documents and unquote(url.fragment) not in documents[target].ids:
            errors.append(f'{path.relative_to(ROOT)}: missing fragment {link}')
        checked += 1

for link in re.findall(r'url\([\'"]?([^\)\'\"]+)', (ROOT / 'styles.css').read_text()):
    if not (ROOT / link).is_file():
        errors.append(f'Missing CSS resource {link}')
    checked += 1

if errors:
    raise SystemExit('\n'.join(errors))
print(f'{len(documents)} HTML documents, {checked} local links/assets/fragments checked; no errors.')
