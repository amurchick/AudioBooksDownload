/**
 * Created by a.murin on 03.04.15.
 *
 */

const util = require('util');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const rp = require('request-promise-native');
const fs = require('fs');
//noinspection SpellCheckingInspection
const ffmetadata = require("ffmetadata");

const access = util.promisify(fs.access);
//noinspection SpellCheckingInspection
const ffmetadataWrite = util.promisify(ffmetadata.write);

let fileExists = async fileName => {

  try {

    await access(fileName, fs.constants.R_OK);
    return true;
  }
  catch (err) {

    // console.log(`fileExists() error:`, err);
    return null;
  }
};

let saveUrlToFile = async (path, urlToLoad) => {

  try {

    let fileName = null;
    if (path) {

      fileName = path + '/' + urlToLoad.replace(/^.+\/([^/]+)$/, '$1');

      let exists = await fileExists(fileName);
      if (exists) {

        console.log(`Download "${urlToLoad}" to "${fileName}" skipped - file exists`);
        return fileName;
      }

      console.log(`Download "${urlToLoad}" to "${fileName}"...`);
    }
    else {

      console.log(`Download "${urlToLoad}"...`);
    }

    let host = urlToLoad.match(/\/\/([^/]+)\//);
    if (host) {

      host = host[1];
    }

    let res = await rp({
      url: encodeURI(urlToLoad),
      encoding: null,
      headers: {
        'User-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.104 Safari/537.36',
        'Referer': url,
        'Cache-Control': 'no-cache',
        'Host': host,
      },
    });

    if (!path) {

      // If no PATH - no save required -> return readed body
      return res.toString('utf8');
    }

    fs.writeFileSync(fileName, res);
    console.log(`Done${fileName ? ` "${fileName}"` : ''}: ${res.length} bytes`);

    return fileName;
  }
    catch (err) {

      console.error(`saveUrlToFile(${path}, ${urlToLoad})`, err);
      throw err;
    }
};

const processFile = async (path, item, artist, book, tracks, imgFileName) => {

  try {

    let fileName = await saveUrlToFile(path, item.mp3);

    if (fileName) {

      //let meta = ffmetadata.read.sync(ffmetadata, fileName);
      //console.log(meta);

      // let num = fileName.match(/(\d+)[^/]+$/);
      // num = num ? parseInt(num[1]) : 0;

      await ffmetadataWrite(
        fileName,
        {
          artist: artist,
          album: book,
          title: fileName.split(/\//)[1]
            // .replace(/^\d+_/, '')
            .replace(/\.mp3$/i, ''),
          track: `${item.num}/${tracks}`,
        },
        {
          attachments: [imgFileName]
        }
      );
    }
  }
  catch (err) {

    console.error(`processFile(${path}, ${url})`, err);
    throw err;
  }
};

const processFunction = async (errors, dom) => {

  try {

    let document = dom.window.document;
    let title = document.querySelector('[property="og:title"]').attributes.content.textContent;
    // let title = $('[property="og:title"]').attr('content');
    let parts = title.split(/\s+-\s+/);
    let artist = parts[0];
    let book = parts[1];

    // let content = $('#content');
    let content = document.querySelector('#content');
    // let img = content.find('img[alt=image]:first').attr('src');
    // debugger;
    let img = content.querySelector('.picture-side img').attributes.src.textContent;
    // let scripts = content.find('script');
    let scripts = content.querySelectorAll('script');

    let found;
    for (let l = scripts.length, i = 0; i < l; i++) {

      // let matched = scripts.eq(i).text().match(/audioPlayer\((\d+),/);
      let matched = scripts[i].textContent.match(/audioPlayer\((\d+),/);
      if (matched)
        found = matched[1];
    }

    if (!found) {

      throw 'Unable to find ID';
    }

    let data = await saveUrlToFile(null, 'http://audioknigi.club/rest/bid/' + found);

    data = JSON.parse(data);
    data.forEach((item, idx) => item.num = idx + 1);
    let tracks = data.length;

    console.log('Title:', title);
    console.log('Image:', img);
    console.log('Tracks:', tracks);

    if (!fs.existsSync(title)) {

      fs.mkdirSync(title);
    }

    fs.writeFileSync(`${title}/url.txt`, url);

    let imgFileName = await saveUrlToFile(title, img);

    //data = data.match(/{[^{]+title:"[^"]+"[^}]+mp3:"[^"]+"[^}]+}/gmi);

    let promises = [];

    let maxConcurrentDownloads = 5;

    while (data.length) {

      while (data.length && promises.length < maxConcurrentDownloads) {

        let item = data.shift();
        promises.push({
          promise: processFile(title, item, artist, book, tracks, imgFileName)
            .then(() => item.mp3)
            .catch(err => {

              console.log(`'${item.mp3} failed to download - push it to queue again...`);
              data.push(item);
            }),
          id: item.mp3,
        });
      }

      let resolved = await Promise.race(promises.map(item => item.promise));
      promises = promises
        .filter(p => p.id !== resolved);
    }

    if (promises.length) {

      await Promise.all(promises.map(item => item.promise));
    }

  }
  catch(err) {

    console.log('processFunction() error', err.stack || err);
  }
};

const main = async (url) => {

  try {


    // jsdom.env(
    //   url,
    //   ['http://code.jquery.com/jquery.js'],
    //   processFunction
    // );

    console.log(`Downloading ${url}...`);

    // const index = await saveUrlToFile(null, url);

    // console.log(`Parsing ${url}...`);
    // const dom = new JSDOM(index);

    const dom = await JSDOM.fromURL(url);
    // console.log(`Processing ${url}...`);
    await processFunction(null, dom);
  }
  catch (err) {

    console.log(`main() error:`, err.stack || err);
  }
};

// const argv = require('yargs')
//   .option('verbose', {
//     alias: 'v',
//     default: false
//   })
//   .help()
//   .argv;
//
// console.log(argv);
// process.exit(-1);

const args = process.argv.slice(process.argv[0].match(/node/i) ? 1 : 0);
const url = args.pop();

if (!url.match(/^http/i)) {

  console.log(`Usage: ${args[0]} url`);
  process.exit(-1);
}

const promise = main(url);

