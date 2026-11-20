from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit


class PreviewHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        requested = urlsplit(path).path
        if requested == '/vorschau' or requested.startswith('/vorschau/'):
            path = requested.removeprefix('/vorschau') or '/'
        return super().translate_path(path)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


if __name__ == '__main__':
    dist = Path(__file__).resolve().parents[1] / 'dist'
    if not (dist / 'index.html').is_file():
        raise SystemExit('Bitte zuerst npm run build ausführen.')
    handler = partial(PreviewHandler, directory=str(dist))
    with ThreadingHTTPServer(('127.0.0.1', 4173), handler) as server:
        print('Vorschau: http://127.0.0.1:4173/vorschau/', flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass
