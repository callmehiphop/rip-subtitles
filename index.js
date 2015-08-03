'use strict';

var probe = require('node-ffprobe');
var assign = require('object-assign');
var spawn = require('child_process').spawn;
var through = require('through2');
var concat = require('concat-stream');
var isVideo = require('is-video');

var defaults = {
  lang: 'eng',
  format: 'srt'
};

/**
 * Gets stream info for supplied video then tries to locate
 * the desired subtitle stream and spits it out in the specified format
 *
 * @throws {TypeError} if filename is not a valid video
 * @param {string} filename - path to the video
 * @param {object=} options - subtitle options
 * @param {string} options.lang - desired language
 * @param {string} options.format - desired format
 * @param {function=} callback - callback function
 * @return {stream} stream - only if a callback is not provided
 */
module.exports = function (filename, options, callback) {
  if (!isVideo(filename)) {
    throw new TypeError('invalid parameter `filename`');
  }

  if (typeof options !== 'object') {
    callback = options;
    options = {};
  }

  options = assign({}, defaults, options);

  var stream = through();

  getSubtitleIndex(filename, options.lang, function (err, index) {
    if (err) {
      stream.emit('error', err);
      return stream.end();
    }

    getSubtitleStream(filename, index, options.format)
      .on('error', stream.emit.bind(stream, 'error'))
      .pipe(stream);
  });

  if (typeof callback !== 'function') {
    return stream;
  }

  stream
    .on('error', callback)
    .pipe(concat(function (subtitles) {
      callback(null, subtitles);
    }));
};

/**
 * Attempts to get the index of the subtitle stream
 * The callback will pass back an error if we can't find it
 *
 * @param {string} filename - video file name
 * @param {string} lang - language of desired subtitle
 * @param {function} callback - rly
 */
function getSubtitleIndex (filename, lang, callback) {
  probe(filename, function (err, data) {
    if (err) {
      return callback(err);
    }

    var streams = data.streams.filter(function (stream) {
      var isSubtitle = stream.codec_type === 'subtitle';
      var hasLang = stream['TAG:language'] === lang;

      return isSubtitle && hasLang;
    });

    if (!streams.length) {
      return callback(new Error('subtitle not found for lang "' + lang + '"'));
    }

    callback(null, data.streams.indexOf(streams[0]));
  });
}

/**
 * Streams the subtitle file in the desired format
 *
 * @param {string} filename - video filename
 * @param {number} index - index of desired subtitle stream
 * @param {string} format - subtitle format (srt, ass, etc.)
 * @return {stream}
 */
function getSubtitleStream (filename, index, format) {
  var stream = through();

  var ffmpeg = spawn('ffmpeg', [
    '-i', filename,
    '-an', '-vn',
    '-map', '0:' + index,
    '-c:s:0', format,
    '-f', format,
    'pipe:1'
  ]);

  ffmpeg.on('error', stream.emit.bind(stream, 'error'));
  ffmpeg.on('exit', stream.end.bind(stream));

  ffmpeg.stdout.pipe(stream);

  return stream;
}
