var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');
var axios = require('axios');
var url_arr = [];

http.createServer(function(req, res) {
	debugger;
	console.log(url_arr);
	var status = false;
	if(req.url === '/favicon.ico') {
		res.end();
	} else if(req.url === '/') {
		var realPath = path.join(__dirname, '/front/index.html');
		res.writeHeader(200, {"Content-Type": "text/html"});
		fs.readFile(realPath, function(err, data) {
			if(err) throw err;
			res.write(data.toString());
			res.end();
		});
	} else {
		var pathname = url.parse(req.url).pathname.substring(1);
		if(pathname.search(/new/i) === 0) {
			pathname = pathname.substring(4);
		}
		url_arr.forEach(function(value) {
			if(req.url === '/' + value.fake) {
				if(value.valid) {
					res.writeHeader(302, {'Location': value.real});
					res.end();
				} else {
					var error = {
						error: 'No short url found for given input'
					};
					res.end(JSON.stringify(error));
				}
			} else if(pathname === value.real) {
				status = true;
				var result = {
					original_url: pathname,
					short_url: 'https://' + req.headers.host + '/' + value.fake
				};
				res.end(JSON.stringify(result));
			}
		});
		if(!status) {
			axios.get(pathname).then(resp => {
				var result = timeStamp(req, pathname, true);
				res.end(JSON.stringify(result));
			}).catch(err => {
				if(url.parse(req.url).query.search(/allow=true/i) >= 0) {
					var result = timeStamp(req, pathname, false);
					res.end(JSON.stringify(result));
				} else {
					var error = {
						error: 'URL invalid'
					};
					res.end(JSON.stringify(error));
				}
			});
		}
	}
}).listen(process.env.PORT || 8000);

function timeStamp(req, pathname, url_valid) {
	var stamp = new Date().getTime();
	var result = {
		original_url: pathname,
		short_url: 'https://' + req.headers.host + '/' + stamp
	};
	var url_obj = {};
	url_obj.fake = stamp;
	url_obj.real = pathname;
	url_obj.valid = url_valid;
	url_arr.push(url_obj);
	return result;
}






