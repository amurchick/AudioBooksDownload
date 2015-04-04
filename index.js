/**
 * Created by a.murin on 03.04.15.
 */

var jsdom = require('jsdom');
var request = require('request');
var Sync = require('sync');
var fs = require('fs');

require('./fmt.js');

var url = process.argv[process.argv.length - 1];

var saveUrlToFile = function (path, url, cb) {

	var fileName = path + '/' + url.replace(/^.+\/([^/]+)$/, '$1');

	console.log('Download "%@" to "%@"'.fmt(url, fileName));

	request(url, function (err, res, body) {

		if (err)
			return cb(err);

		console.log('Response code: %@'.fmt(res.statusCode));

		delete res.body;
		console.log(res);
		fs.writeFile(fileName, body, {encoding: 'ansi'}, cb);
		console.log(body.length);
	});
};

var processFunction = function (errors, window) {

	Sync(
		function () {

			var $ = window.$;
			var title = $('[property="og:title"]').attr('content');
			var content = $('#content');
			var img = content.find('img[alt=image]:first').attr('src');
			var data = content.find('script:first').text();

			console.log('Title:', title);
			console.log('Image:', img);

			if (!fs.existsSync(title))
				fs.mkdirSync(title);

			saveUrlToFile.sync(null, title, img);

			data
				.match(/{[^{]+title:"[^"]+"[^}]+mp3:"[^"]+"[^}]+}/gmi)
				.forEach(function (item) {

					item = item.replace(/(title|mp3):/g, '"$1":').replace(/(\n|\r)/g, '').replace(/,\s+}/g, '}');
					item = JSON.parse(item);

					//saveUrlToFile.sync(null, title, item.mp3);

					//	if (!error && response.statusCode == 200) {
					//		console.log(body) // Show the HTML for the Google homepage.
					//	}
					//})

					//console.log(response);
					process.exit();
				});


		},
		function (err, out) {

			if (err)
				throw err && err.stack ? err.stack : err;
		}
	);
};

console.log('Downloading "%@"...'.fmt(url));

jsdom.env(
	url,
	['http://code.jquery.com/jquery.js'],
	processFunction
);

