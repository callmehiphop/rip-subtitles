# rip-subtitles

> Rip subtitles from video files

This module requires [ffmpeg](https://www.ffmpeg.org/)

## Install

```sh
$ npm install --save rip-subtitles
```

## Usage

```javascript
var ripSubtitles = require('rip-subtitles');
var fs = require('fs');

ripSubtitles('clip.mkv', function (err, subtitles) {
  fs.writeFile('subtitles.srt', subtitles, function (err) {});
});

// or if streams are your thing
ripSubtitles('clip.mkv')
  .pipe(fs.createWriteStream('subtitles.srt'));
```

## API

### ripSubtitles(filename, [options], [callback])

## filename

**Required**

Type `string`

Path to the video file

## options

Type `object`

Subtitle options

#### lang

Type `string`

Default `eng`

The chosen language - e.g. `eng`

#### format

Type `string`

Default `srt`

The subtitle format - e.g. `srt`, `webvtt`

## callback

Type `function`

A callback function - if not present a stream is returned

## CLI

```sh
Usage
  $ rip-subtitles <input-file> > <output-file>

Options
  -l, --lang     Subtitle language (eng, etc.)
  -f, --format   Format of subtitles (srt, ass, etc.)

Example
  $rip-subtitles clip.mkv > subs.srt

```

## Formats

Formats available depend on your `ffmpeg` version, for a list use the following command

```sh
$ ffmpeg -formats | grep "subtitle"
```

## License

MIT
