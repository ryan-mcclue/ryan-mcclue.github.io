#! /usr/bin/env python3
 
# NOTE(Ryan): Create ssl certificates:
# openssl req -x509 -nodes -newkey rsa:4096 -keyout localhost.key -out localhost.crt -days 365

import http.server, ssl, sys

try:
    server_address = ("localhost", 443)
    httpd = http.server.HTTPServer(server_address, http.server.SimpleHTTPRequestHandler)
    httpd.socket = ssl.wrap_socket(httpd.socket, server_side=True, 
                                   keyfile="localhost.key", certfile="localhost.crt", 
                                   ssl_version=ssl.PROTOCOL_TLS)
    print(f"Serving HTTPS on {server_address[0]} port {server_address[1]} (https://{server_address[0]}:{server_address[1]}/) ...")
    httpd.serve_forever()
except KeyboardInterrupt:
    print("\nKeyboard interrupt received. Exiting.")
    sys.exit(0)
