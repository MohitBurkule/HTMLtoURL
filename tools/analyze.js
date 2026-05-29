// Measures whether templates + compression actually shrink the URL,
// compared with the original plain-base64 scheme.
//
//   node tools/analyze.js
const TEMPLATES = require('../js/templates.js');
const codec = require('../js/codec.js');

function legacyEncode(str) {
  return Buffer.from(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
    (m, p1) => String.fromCharCode('0x' + p1)), 'binary').toString('base64');
}

// Realistic samples: someone starting from a template and tweaking it.
const samples = [
  { name: 'Hello world', html: '<h1>Hello, world!</h1>' },
  { name: 'Tweaked heading+para', html: '<h1>My Page</h1>\n<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>' },
  { name: 'Login form (renamed)', html: '<form action="#" method="post">\n<h2>Sign in</h2>\n<input type="text" name="user" placeholder="Email">\n<input type="password" name="pass" placeholder="Password">\n<button type="submit">Enter</button>\n</form>' },
  { name: 'Bare HTML5 doc, custom title', html: '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>My Cool Site</title>\n</head>\n<body>\n<h1>Welcome</h1>\n</body>\n</html>' },
  { name: 'Landing page edit', html: '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>Acme</title>\n</head>\n<body>\n<header><h1>Acme</h1></header>\n<section class="hero"><h2>Build faster</h2><p>The best tool ever.</p><a href="#">Sign up</a></section>\n<footer><p>&copy; 2024</p></footer>\n</body>\n</html>' },
  { name: 'Arbitrary (no template)', html: '<div class="xyz">random unique content 12345 with no boilerplate</div>' },
];

function roundtripOk(html) {
  return codec.decode(codec.encode(html)) === html;
}

console.log('sample'.padEnd(28), 'raw'.padStart(6), 'legacy'.padStart(8), 'new'.padStart(6), 'vs raw'.padStart(8), 'vs legacy'.padStart(10), 'tpl'.padStart(5), 'ok');
console.log('-'.repeat(90));
let totRaw = 0, totLeg = 0, totNew = 0;
for (const s of samples) {
  const raw = s.html.length;
  const leg = legacyEncode(s.html).length;
  const enc = codec.encode(s.html);
  const nw = enc.length;
  const tpl = codec.bestTemplate(s.html).idx;
  totRaw += raw; totLeg += leg; totNew += nw;
  const vsRaw = (((nw - raw) / raw) * 100).toFixed(0) + '%';
  const vsLeg = (((nw - leg) / leg) * 100).toFixed(0) + '%';
  console.log(
    s.name.padEnd(28),
    String(raw).padStart(6),
    String(leg).padStart(8),
    String(nw).padStart(6),
    vsRaw.padStart(8),
    vsLeg.padStart(10),
    String(tpl).padStart(5),
    roundtripOk(s.html) ? '✓' : '✗FAIL'
  );
}
console.log('-'.repeat(90));
console.log('TOTAL'.padEnd(28), String(totRaw).padStart(6), String(totLeg).padStart(8), String(totNew).padStart(6));
console.log('\nNew vs legacy base64: ' + (((totNew - totLeg) / totLeg) * 100).toFixed(1) + '%');
console.log('New vs raw HTML:      ' + (((totNew - totRaw) / totRaw) * 100).toFixed(1) + '%');

// Lossless check across every template verbatim.
let fails = 0;
for (let i = 0; i < TEMPLATES.length; i++) {
  if (!roundtripOk(TEMPLATES[i])) { fails++; console.log('ROUNDTRIP FAIL template', i); }
}
console.log('\nTemplates: ' + TEMPLATES.length + ', roundtrip failures: ' + fails);

// Legacy URL decode still works.
const legacySample = legacyEncode('<h1>old url</h1>');
console.log('Legacy decode still works: ' + (codec.decode(legacySample) === '<h1>old url</h1>' ? 'yes' : 'NO'));
