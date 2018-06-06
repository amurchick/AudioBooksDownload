# AudioBooksDownload

**Caution**: node version must be >= `8.0`.

Script to download audio books from [audioknigi.club](https://audioknigi.club) and save as `mp3` files with injecting cover image and correct `mp3` tags (e.g. book name, author, track name, number...). Supports cyrillic charset.

**Note**: [ffmpeg](https://www.ffmpeg.org/) must [be installed](https://github.com/adaptlearning/adapt_authoring/wiki/Installing-FFmpeg) - it is needed for saving correct track information and book's image into `mp3`-file.

# Usage
1. Open site [audioknigi.club](https://audioknigi.club) and find book to download, for example - [Элтон Бен - Два брата](https://audioknigi.club/elton-ben-dva-brata);
2. Run downloader with url of audio book: `node index https://audioknigi.club/elton-ben-dva-brata`.

