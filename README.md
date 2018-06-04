# AudioBooksDownload

Script to download and save mp3's from http://audioknigi.club

**Caution**: node version must be >= 8.0

Downloads audio books from http://audioknigi.club/, save cover and correct mp3 tags (e.g. book name, author, track name, number...), supports cyrillic alphabet.

**Note**: [ffmpeg](https://www.ffmpeg.org/) must [be installed](https://github.com/adaptlearning/adapt_authoring/wiki/Installing-FFmpeg) - it is needed for saving correct track information and book's image into mp3-file.

# Usage
1. Open site [audioknigi.club](https://audioknigi.club) and find book to download, for example - [Элтон Бен - Два брата](https://audioknigi.club/elton-ben-dva-brata);
2. Run downloader with url: `node index https://audioknigi.club/elton-ben-dva-brata`

