var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');
var axios = require('axios');
var url_obj = {};
var url_arr = [];

http.createServer(function(req, res) {
	if(req.url === '/') {
		var realPath = path.join(__dirname, '/front/index.html');
		res.writeHeader(200, {"Content-Type": "text/html"});
		fs.readFile(realPath, function(err, data) {
			if(err) throw err;
			res.write(data.toString());
			res.end();
		});
	} else if(req.url != '/favicon.ico') {
		var pathname = url.parse(req.url).pathname.substring(1);
		if(pathname.search(/new/i) === 0) {
			pathname = pathname.substring(4);
		}
		axios.get(pathname).then(resp => {
			console.log("yes");
			var result = {
				original_url: pathname,
				short_url: url.parse(req.url).hostname + new Date().getTime()
			};
			url_obj.fake = result.short_url;
			url_obj.real = pathname;
			url_arr.push(url_obj);
			console.log(url_obj);
			res.end(JSON.stringify(result));
		}).catch(err => {
			console.log("no");
			var error = {
				error: 'URL invalid'
			};
			res.end(JSON.stringify(error));
		});
		
	}
	
}).listen(process.env.PORT || 8000);