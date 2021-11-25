# html2url( HTML to URL )
converts small html into urls directly ,live on https://html2url.netlify.app/
(Making good use of Cross site Scripting Vulnerability)

#WHY?
1) People Search for it  -> https://www.quora.com/Is-there-any-way-to-convert-a-HTML-link-into-URL-link

2) To simply explore the concept that url can actually contain the data vs url pointing to a location containing data 

3)No backend Processing required! (Server serves only html and js directly as a static site )

4) Because of 3) Website is served directly via CDN -> FASTER Loading 
#HOW?
Works similar to image data urls
Data is compressed and base64 encoded and placed in the url 

#Is it Innovative?
Certainly , As there is no similar product as per my knowledge

#Problems / Disadvantages?
1)Since the contents of the webpage depend on contents in the url , Its a disaster recepie for Cross site scripting attack
2)Urls can be horrendously long !  

#How would I solve these Problems?(Possibly in a future version)
1) Can add a Checksum-like value at the end of Url and which would be stored in backend and checked everytime a url is rendered
2) Efficient Data Compression / Template based techniques can be used to overcome long urls 
