# HTML to URL 🔗

Convert small HTML into URLs directly with HTML to URL! This innovative tool makes good use of Cross-Site Scripting Vulnerability to transform HTML snippets into clickable URLs effortlessly.

## Why HTML to URL?

1) People are searching for it! Check out the discussion on Quora: [Is there any way to convert a HTML link into a URL link?](https://www.quora.com/Is-there-any-way-to-convert-a-HTML-link-into-URL-link)

2) Explore the concept of URLs containing data versus pointing to it.

3) No backend processing required! The server serves only HTML and JS directly as a static site, resulting in faster loading.

## How Does it Work?

Similar to image data URLs, data is compressed, base64 encoded, and placed in the URL.

## Is it Innovative?

Certainly! There's no similar product as per my knowledge.

## Problems / Disadvantages?

1) Vulnerable to Cross-Site Scripting attacks due to webpage content being dependent on URL contents.
2) URLs can become horrendously long!

## How Would I Solve These Problems? (Possibly in a Future Version)

1) Add a checksum-like value at the end of the URL, stored in the backend and checked every time a URL is rendered.
2) Implement efficient data compression or template-based techniques to overcome long URLs.
