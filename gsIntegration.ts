import * as http from "http";
import * as fs from "fs";

port = process.env.PORT || 3000;
host = process.env.HOST || 'localhost';

server = http.createServer( function (req, res) {
    if (req.method === 'POST') {
        console.log("Handling POST request");
        res.writeHead(200, {'Content-Type': 'text/html'});

        let body = '';
        req.on('data', function (data) {
            body += data;
        });
        req.on('end', function () {
            var post = JSON.parse(body);
            console.log("Received POST request: " + post.message);
            res.end("Received POST request: " + post.message);
        });
    }
    else {
        console.log("Not expecting a " + req.method + " request");
        res.writeHead(200, {'Content-Type': 'text/html'});
        let html = '<html><body>HTTP Server at http://' + host + ':' + port + '</body></html>';
        res.end(html);
    }
});


server.listen(port, host);
console.log('Server running at http://' + host + ':' + port + '/');