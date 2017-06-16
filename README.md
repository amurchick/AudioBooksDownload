# AudioBooksDownload

Script for download and save mp3's from http://audioknigi.club

**Caution**: node version must be >= 8.0

Downloads audio books from http://audioknigi.club/ and write cover and correct tags to mp3 (book name, author, track name and number), cyrillic ready.

**Note**: ffmpeg must be installed - it is need for write correct track information and book's image into mp3-file.

# Usage
1. Open site [audioknigi.club](https://audioknigi.club) and find book to download, for example - [Элтон Бен - Два брата](https://audioknigi.club/elton-ben-dva-brata);
2. Run downloader with url: `node index https://audioknigi.club/elton-ben-dva-brata`

