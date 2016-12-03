/**
 * Created by a.murin on 03.04.15.
 *
 */

let jsdom = require('jsdom');
let request = require('request-promise');
let co = require('co');
let fs = require('fs');
let ffmetadata = require("ffmetadata");

let args = process.argv.slice(process.argv[0].match(/node/i) ? 1 : 0);
let url = args[args.length - 1];

if (!url.match(/^http/i)) {

  console.log('Usage: %@ url'.fmt(args[0]));
  process.exit(-1);
}

let saveUrlToFile = function (path, urlToLoad) {

  return co( function* () {

    let fileName = null;
    if (path) {

      fileName = path + '/' + urlToLoad.replace(/^.+\/([^/]+)$/, '$1');
      console.log(`Download "${urlToLoad}" to "${fileName}"...`);
    }
    else {

      console.log(`Download "${urlToLoad}"...`);
    }

    let host = urlToLoad.match(/\/\/([^/]+)\//);
    if (host)
      host = host[1];

    let res = yield request({
      url: encodeURI(urlToLoad),
      encoding: null,
      headers: {
        'User-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.104 Safari/537.36',
        'Referer': url,
        //'Accept': '*/*',
        //'Accept-Encoding': 'identity;q=1, *;q=0 ',
        //'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4',
        'Cache-Control': 'no-cache',
        //'Connection': 'keep-alive',
        //'Pragma': 'no-cache',
        //'Range': 'bytes=0-',
        'Host': host,
      },
    });

    if (!path) {

      return res.toString('utf8');
    }

    fs.writeFileSync(fileName, res);
    console.log(`Done: ${res.length} bytes`);

    return fileName;
  })
    .catch(err => {

      console.error(`saveUrlToFile(${path}, ${urlToLoad})`, err);
    })
};

let processFunction = function (errors, window) {

  co(function* () {

    let $ = window.$;
    let title = $('[property="og:title"]').attr('content');
    let parts = title.split(/\s+\-\s+/);
    let artist = parts[0];
    let book = parts[1];

    let content = $('#content');
    let img = content.find('img[alt=image]:first').attr('src');
    let scripts = content.find('script');

    let found;
    for (let l = scripts.length, i = 0; i < l; i++) {

      let matched = scripts.eq(i).text().match(/audioPlayer\((\d+),/);
      if (matched)
        found = matched[1];
    }

    if (!found) {

      throw 'Unable to find ID';
    }

    let data = yield saveUrlToFile(null, 'http://audioknigi.club/rest/bid/' + found);

    data = JSON.parse(data);

    console.log('Title:', title);
    console.log('Image:', img);

    if (!fs.existsSync(title)) {

      fs.mkdirSync(title);
    }

    fs.writeFileSync(`${title}/url.txt`, url);

    let imgFileName = yield saveUrlToFile(title, img);

    //data = data.match(/{[^{]+title:"[^"]+"[^}]+mp3:"[^"]+"[^}]+}/gmi);
    let tracks = data.length;

    for (let item of data) {

      //item = item.replace(/(title|mp3):/g, '"$1":').replace(/(\n|\r)/g, '').replace(/,\s+}/g, '}');
      //item = JSON.parse(item);

      let fileName = yield saveUrlToFile(title, item.mp3);

      //let meta = ffmetadata.read.sync(ffmetadata, fileName);
      //console.log(meta);
      let num = fileName.match(/(\d+)[^/]+$/);
      num = num ? parseInt(num[1]) : 0;

      yield new Promise((resolve, reject) => {

        ffmetadata.write(
          fileName,
          {
            artist: artist,
            album: book,
            title: fileName.split(/\//)[1].replace(/^\d+_/, '').replace(/\.mp3$/i, ''),
            track: `${num}/${tracks}`,
          },
          {
            attachments: [imgFileName]
          },
          err => {

            if (err) {

              reject(err);
            }
            else {

              resolve();
            }
          }
        );
      });
    }
  })
    .catch(err => {

      if (err) {

        throw err.stack || err;
      }
    });
};

console.log(`Downloading ${url}...`);

jsdom.env(
  url,
  ['http://code.jquery.com/jquery.js'],
  processFunction
);

