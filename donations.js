
var http = require('http');
var url = require('url');

http.createServer(function(req, res){
	res.writeHead(200, {'Content-Type':'text/html'});
	var qobj = url.parse(req.url, true).query;
	var f_name = qobj.f_name;
	var l_name = qobj.l_name;
	res.end(f_name + l_name);
}).listen(8080);