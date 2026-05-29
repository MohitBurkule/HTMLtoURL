// HTML2URL templates.
//
// Each template is boilerplate that a snippet is likely to share. At encode
// time we pick the template that overlaps most with the user's HTML and store
// only the *difference* (see js/codec.js). The template itself never travels in
// the URL — only its index does — so any byte that matches the template costs
// nothing.
//
// IMPORTANT: templates are append-only. The index of an existing template must
// never change, or previously generated URLs would decode to the wrong page.
// Add new templates to the END of this array only.
var HTML2URL_TEMPLATES = [
  // 0 — empty (no template; raw compression only)
  "",
  // 1 — bare HTML5 document
  "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n<title>Page</title>\n</head>\n<body>\n\n</body>\n</html>",
  // 2 — single heading
  "<h1>Hello, world!</h1>",
  // 3 — heading + paragraph
  "<h1>Title</h1>\n<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>",
  // 4 — paragraph only
  "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>",
  // 5 — unordered list
  "<ul>\n<li>Item one</li>\n<li>Item two</li>\n<li>Item three</li>\n</ul>",
  // 6 — ordered list
  "<ol>\n<li>First</li>\n<li>Second</li>\n<li>Third</li>\n</ol>",
  // 7 — anchor link
  "<a href=\"https://example.com\">Click here</a>",
  // 8 — image
  "<img src=\"https://via.placeholder.com/150\" alt=\"placeholder\">",
  // 9 — figure with caption
  "<figure>\n<img src=\"https://via.placeholder.com/300\" alt=\"\">\n<figcaption>Caption text</figcaption>\n</figure>",
  // 10 — simple table
  "<table border=\"1\">\n<thead>\n<tr><th>Name</th><th>Value</th></tr>\n</thead>\n<tbody>\n<tr><td>A</td><td>1</td></tr>\n<tr><td>B</td><td>2</td></tr>\n</tbody>\n</table>",
  // 11 — definition list
  "<dl>\n<dt>Term</dt>\n<dd>Definition</dd>\n</dl>",
  // 12 — blockquote
  "<blockquote>\n<p>A memorable quote goes here.</p>\n<cite>— Author</cite>\n</blockquote>",
  // 13 — code block
  "<pre><code>function hello() {\n  console.log(\"hi\");\n}</code></pre>",
  // 14 — contact form
  "<form action=\"#\" method=\"post\">\n<label>Name <input type=\"text\" name=\"name\"></label>\n<label>Email <input type=\"email\" name=\"email\"></label>\n<label>Message <textarea name=\"message\"></textarea></label>\n<button type=\"submit\">Send</button>\n</form>",
  // 15 — login form
  "<form action=\"#\" method=\"post\">\n<h2>Sign in</h2>\n<input type=\"text\" name=\"user\" placeholder=\"Username\">\n<input type=\"password\" name=\"pass\" placeholder=\"Password\">\n<button type=\"submit\">Log in</button>\n</form>",
  // 16 — newsletter signup
  "<form action=\"#\" method=\"post\">\n<h3>Subscribe to our newsletter</h3>\n<input type=\"email\" name=\"email\" placeholder=\"you@example.com\" required>\n<button type=\"submit\">Subscribe</button>\n</form>",
  // 17 — nav bar
  "<nav>\n<a href=\"#home\">Home</a>\n<a href=\"#about\">About</a>\n<a href=\"#services\">Services</a>\n<a href=\"#contact\">Contact</a>\n</nav>",
  // 18 — header + nav
  "<header>\n<h1>Brand</h1>\n<nav>\n<a href=\"#\">Home</a>\n<a href=\"#\">About</a>\n<a href=\"#\">Contact</a>\n</nav>\n</header>",
  // 19 — footer
  "<footer>\n<p>&copy; 2024 Your Company. All rights reserved.</p>\n</footer>",
  // 20 — hero section
  "<section class=\"hero\">\n<h1>Big Bold Headline</h1>\n<p>A short supporting sentence that explains the value proposition.</p>\n<a href=\"#\" class=\"cta\">Get started</a>\n</section>",
  // 21 — card
  "<div class=\"card\">\n<img src=\"https://via.placeholder.com/200\" alt=\"\">\n<h3>Card title</h3>\n<p>Some descriptive text for the card.</p>\n<a href=\"#\">Read more</a>\n</div>",
  // 22 — pricing card
  "<div class=\"pricing\">\n<h3>Pro</h3>\n<p class=\"price\">$19/mo</p>\n<ul>\n<li>Feature one</li>\n<li>Feature two</li>\n<li>Feature three</li>\n</ul>\n<button>Choose plan</button>\n</div>",
  // 23 — three-column grid
  "<div class=\"grid\">\n<div class=\"col\">Column 1</div>\n<div class=\"col\">Column 2</div>\n<div class=\"col\">Column 3</div>\n</div>",
  // 24 — article / blog post
  "<article>\n<h1>Post title</h1>\n<p class=\"meta\">By Author on January 1, 2024</p>\n<p>First paragraph of the post.</p>\n<p>Second paragraph of the post.</p>\n</article>",
  // 25 — FAQ
  "<section class=\"faq\">\n<h2>Frequently Asked Questions</h2>\n<details>\n<summary>Question one?</summary>\n<p>Answer one.</p>\n</details>\n<details>\n<summary>Question two?</summary>\n<p>Answer two.</p>\n</details>\n</section>",
  // 26 — testimonial
  "<blockquote class=\"testimonial\">\n<p>\"This product changed how we work.\"</p>\n<footer>— Happy Customer, ACME Inc.</footer>\n</blockquote>",
  // 27 — coming soon
  "<div class=\"coming-soon\">\n<h1>Coming Soon</h1>\n<p>We're working on something awesome. Stay tuned!</p>\n</div>",
  // 28 — 404 page
  "<div class=\"error\">\n<h1>404</h1>\n<p>Page not found.</p>\n<a href=\"/\">Go home</a>\n</div>",
  // 29 — maintenance page
  "<div class=\"maintenance\">\n<h1>Under Maintenance</h1>\n<p>We'll be back shortly. Thanks for your patience.</p>\n</div>",
  // 30 — countdown / event
  "<div class=\"event\">\n<h1>Event Name</h1>\n<p>Date: January 1, 2025</p>\n<p>Location: Somewhere</p>\n<a href=\"#\">RSVP</a>\n</div>",
  // 31 — profile / bio
  "<div class=\"profile\">\n<img src=\"https://via.placeholder.com/120\" alt=\"avatar\">\n<h2>Full Name</h2>\n<p>Short bio about this person and what they do.</p>\n</div>",
  // 32 — resume header
  "<header class=\"resume\">\n<h1>Jane Doe</h1>\n<p>Software Engineer</p>\n<p>jane@example.com | +1 555 000 0000</p>\n</header>",
  // 33 — gallery
  "<div class=\"gallery\">\n<img src=\"https://via.placeholder.com/150\" alt=\"\">\n<img src=\"https://via.placeholder.com/150\" alt=\"\">\n<img src=\"https://via.placeholder.com/150\" alt=\"\">\n<img src=\"https://via.placeholder.com/150\" alt=\"\">\n</div>",
  // 34 — video embed
  "<div class=\"video\">\n<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/dQw4w9WgXcQ\" frameborder=\"0\" allowfullscreen></iframe>\n</div>",
  // 35 — audio
  "<audio controls>\n<source src=\"audio.mp3\" type=\"audio/mpeg\">\nYour browser does not support audio.\n</audio>",
  // 36 — alert / notice
  "<div class=\"alert\" style=\"padding:1em;border:1px solid #ccc;border-radius:4px;\">\n<strong>Note:</strong> This is an important message.\n</div>",
  // 37 — button group
  "<div class=\"buttons\">\n<button>Save</button>\n<button>Cancel</button>\n</div>",
  // 38 — progress bar
  "<label>Progress\n<progress value=\"70\" max=\"100\">70%</progress>\n</label>",
  // 39 — checkbox list
  "<form>\n<label><input type=\"checkbox\"> Option A</label>\n<label><input type=\"checkbox\"> Option B</label>\n<label><input type=\"checkbox\"> Option C</label>\n</form>",
  // 40 — radio group
  "<form>\n<label><input type=\"radio\" name=\"g\"> Choice 1</label>\n<label><input type=\"radio\" name=\"g\"> Choice 2</label>\n<label><input type=\"radio\" name=\"g\"> Choice 3</label>\n</form>",
  // 41 — select dropdown
  "<label>Pick one\n<select>\n<option>One</option>\n<option>Two</option>\n<option>Three</option>\n</select>\n</label>",
  // 42 — search box
  "<form role=\"search\" action=\"#\">\n<input type=\"search\" name=\"q\" placeholder=\"Search...\">\n<button type=\"submit\">Search</button>\n</form>",
  // 43 — social links
  "<div class=\"social\">\n<a href=\"#\">Twitter</a>\n<a href=\"#\">GitHub</a>\n<a href=\"#\">LinkedIn</a>\n</div>",
  // 44 — breadcrumb
  "<nav class=\"breadcrumb\">\n<a href=\"#\">Home</a> / <a href=\"#\">Category</a> / <span>Page</span>\n</nav>",
  // 45 — two-column layout
  "<div style=\"display:flex;gap:1em;\">\n<aside style=\"flex:1;\">Sidebar</aside>\n<main style=\"flex:3;\">Main content</main>\n</div>",
  // 46 — styled centered page
  "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n<title>Page</title>\n<style>\nbody{font-family:sans-serif;margin:0;display:flex;min-height:100vh;align-items:center;justify-content:center;}\n</style>\n</head>\n<body>\n<h1>Centered</h1>\n</body>\n</html>",
  // 47 — landing page skeleton
  "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n<title>Landing</title>\n</head>\n<body>\n<header><h1>Brand</h1></header>\n<section class=\"hero\"><h2>Headline</h2><p>Subtext</p><a href=\"#\">Sign up</a></section>\n<footer><p>&copy; 2024</p></footer>\n</body>\n</html>",
  // 48 — markdown-ish note
  "<h1>Note</h1>\n<h2>Section</h2>\n<p>Some notes here.</p>\n<ul>\n<li>Point one</li>\n<li>Point two</li>\n</ul>",
  // 49 — invoice/receipt
  "<div class=\"invoice\">\n<h1>Invoice #001</h1>\n<p>Billed to: Customer Name</p>\n<table border=\"1\">\n<tr><th>Item</th><th>Price</th></tr>\n<tr><td>Service</td><td>$100</td></tr>\n<tr><td>Total</td><td>$100</td></tr>\n</table>\n</div>",
  // 50 — countdown timer JS-ready container
  "<div id=\"timer\">\n<h1>Countdown</h1>\n<span id=\"time\">00:00:00</span>\n</div>",
  // 51 — modal dialog
  "<div class=\"modal\" style=\"border:1px solid #ccc;padding:1em;max-width:400px;\">\n<h2>Title</h2>\n<p>Modal body text.</p>\n<button>Close</button>\n</div>",
  // 52 — accordion
  "<div class=\"accordion\">\n<details><summary>Panel 1</summary><p>Content 1</p></details>\n<details><summary>Panel 2</summary><p>Content 2</p></details>\n<details><summary>Panel 3</summary><p>Content 3</p></details>\n</div>",
  // 53 — tabs scaffold
  "<div class=\"tabs\">\n<nav>\n<a href=\"#tab1\">Tab 1</a>\n<a href=\"#tab2\">Tab 2</a>\n</nav>\n<section id=\"tab1\">Content 1</section>\n<section id=\"tab2\">Content 2</section>\n</div>",
  // 54 — stats / metrics row
  "<div class=\"stats\" style=\"display:flex;gap:2em;\">\n<div><strong>1K+</strong><br>Users</div>\n<div><strong>99%</strong><br>Uptime</div>\n<div><strong>24/7</strong><br>Support</div>\n</div>",
  // 55 — team member grid
  "<div class=\"team\">\n<div class=\"member\"><img src=\"https://via.placeholder.com/100\" alt=\"\"><h4>Name</h4><p>Role</p></div>\n<div class=\"member\"><img src=\"https://via.placeholder.com/100\" alt=\"\"><h4>Name</h4><p>Role</p></div>\n</div>",
  // 56 — cookie banner
  "<div class=\"cookie\" style=\"position:fixed;bottom:0;width:100%;background:#222;color:#fff;padding:1em;\">\nWe use cookies. <button>Accept</button>\n</div>",
  // 57 — call to action band
  "<section class=\"cta-band\" style=\"text-align:center;padding:3em;background:#f5f5f5;\">\n<h2>Ready to get started?</h2>\n<a href=\"#\" class=\"btn\">Sign up now</a>\n</section>",
  // 58 — timeline
  "<ul class=\"timeline\">\n<li><strong>2021</strong> — Founded</li>\n<li><strong>2022</strong> — Launched</li>\n<li><strong>2023</strong> — Scaled</li>\n</ul>",
  // 59 — feature list with icons
  "<div class=\"features\">\n<div class=\"feature\"><h3>🚀 Fast</h3><p>Blazing performance.</p></div>\n<div class=\"feature\"><h3>🔒 Secure</h3><p>Privacy first.</p></div>\n<div class=\"feature\"><h3>💰 Affordable</h3><p>Fair pricing.</p></div>\n</div>"
];

if (typeof module !== 'undefined' && module.exports) { module.exports = HTML2URL_TEMPLATES; }
