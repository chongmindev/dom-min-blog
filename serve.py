# Local preview that matches GitHub Pages: /work serves work.html, unknown paths get 404.html.
#   python3 serve.py        then open http://localhost:8000
import http.server, os, sys

class Handler(http.server.SimpleHTTPRequestHandler):
    def send_head(self):
        path = self.path.split('?', 1)[0].split('#', 1)[0]
        local = self.translate_path(path)
        if not os.path.exists(local) and os.path.exists(local + '.html'):
            self.path = path + '.html' + self.path[len(path):]
        elif not os.path.exists(local):
            self.send_response(404)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.end_headers()
            return open('404.html', 'rb')
        return super().send_head()

port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
http.server.ThreadingHTTPServer(('', port), Handler).serve_forever()
