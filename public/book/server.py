from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import os


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


port = int(os.environ.get("PORT", "4025"))
ThreadingHTTPServer(("0.0.0.0", port), NoCacheHandler).serve_forever()
