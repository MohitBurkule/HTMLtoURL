// HTML2URL codec.
//
// Goal: put as few bytes in the URL as possible while staying lossless.
//
// Pipeline (encode):
//   1. Pick the template that shares the most leading + trailing bytes with the
//      input (a cheap, exact diff — no fuzzy matching, so it's always lossless).
//   2. Keep ONLY the differing middle. The shared prefix/suffix cost nothing but
//      the two small integers that describe their lengths.
//   3. LZString-compress the resulting payload and emit it URL-safe.
//
// A leading "~" marks the new format so the decoder can still read the old
// plain-base64 URLs that are already out in the wild.
//
// Payload (pre-compression) layout:  <tplIndex>|<prefixLen>|<suffixLen>|<middle>
(function (root) {
  var TEMPLATES = (typeof HTML2URL_TEMPLATES !== 'undefined')
    ? HTML2URL_TEMPLATES
    : (typeof require !== 'undefined' ? require('./templates.js') : ['']);
  var LZ = (typeof LZString !== 'undefined')
    ? LZString
    : (typeof require !== 'undefined' ? require('./lz-string.js') : null);

  var MARKER = '~';

  function commonPrefix(a, b) {
    var n = Math.min(a.length, b.length), i = 0;
    while (i < n && a.charCodeAt(i) === b.charCodeAt(i)) i++;
    return i;
  }

  // Longest common suffix of a and b, but never extending past `max` chars
  // (so prefix and suffix can't overlap).
  function commonSuffix(a, b, max) {
    var n = Math.min(a.length, b.length, max), i = 0;
    while (i < n && a.charCodeAt(a.length - 1 - i) === b.charCodeAt(b.length - 1 - i)) i++;
    return i;
  }

  // Choose the template that lets us drop the most bytes.
  function bestTemplate(html) {
    var best = { idx: 0, pre: 0, suf: 0, reuse: 0 };
    for (var idx = 0; idx < TEMPLATES.length; idx++) {
      var t = TEMPLATES[idx];
      if (!t) continue;
      var pre = commonPrefix(html, t);
      var room = Math.min(html.length - pre, t.length - pre);
      var suf = commonSuffix(html, t, room);
      var reuse = pre + suf;
      // Require the reuse to beat the bookkeeping cost ("idx|pre|suf|").
      if (reuse > best.reuse) best = { idx: idx, pre: pre, suf: suf, reuse: reuse };
    }
    // If no template helps, fall back to template 0 (empty), i.e. pure compression.
    if (best.reuse < 8) best = { idx: 0, pre: 0, suf: 0, reuse: 0 };
    return best;
  }

  function encode(html) {
    if (html == null) html = '';
    var b = bestTemplate(html);
    var middle = html.slice(b.pre, html.length - b.suf);
    var payload = b.idx + '|' + b.pre + '|' + b.suf + '|' + middle;
    return MARKER + LZ.compressToEncodedURIComponent(payload);
  }

  function decode(token) {
    if (token == null) return '';
    if (token.charAt(0) !== MARKER) {
      return legacyDecode(token); // old plain-base64 URLs
    }
    var payload = LZ.decompressFromEncodedURIComponent(token.slice(1));
    if (payload == null) return '';
    var p1 = payload.indexOf('|');
    var p2 = payload.indexOf('|', p1 + 1);
    var p3 = payload.indexOf('|', p2 + 1);
    var idx = parseInt(payload.slice(0, p1), 10);
    var pre = parseInt(payload.slice(p1 + 1, p2), 10);
    var suf = parseInt(payload.slice(p2 + 1, p3), 10);
    var middle = payload.slice(p3 + 1);
    var t = TEMPLATES[idx] || '';
    return t.slice(0, pre) + middle + t.slice(t.length - suf);
  }

  // Backwards compatibility with the original btoa(encodeURIComponent(x)) scheme.
  function legacyDecode(str) {
    try {
      var bin = (typeof atob !== 'undefined')
        ? atob(str)
        : Buffer.from(str, 'base64').toString('binary');
      return decodeURIComponent(bin.split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
    } catch (e) {
      return '';
    }
  }

  var api = { encode: encode, decode: decode, bestTemplate: bestTemplate, MARKER: MARKER };
  root.HTML2URLCodec = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
