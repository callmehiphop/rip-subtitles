#!/usr/bin/env node

'use strict';

var meow = require('meow');
var ripSubtitles = require('./');

var cli = meow({
  help: [
    'Usage',
    '  $ rip-subtitles <input-file> > <output-file>',
    '',
    'Options',
    '  -l, --lang     Subtitle language (eng, etc.)',
    '  -f, --format   Format of subtitles (srt, ass, etc.)',
    '',
    'Example',
    '  $rip-subtitles clip.mkv > subs.srt',
    ''
  ]
}, {
  alias: {
    lang: 'l',
    format: 'f'
  }
});

ripSubtitles(cli.input[0], cli.flags)
  .on('error', console.log)
  .pipe(process.stdout);
