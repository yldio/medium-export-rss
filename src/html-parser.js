/**
 * This is a simple html to markdown converter using turndown
 * the main reason for this file is mainly so that we can use
 * it to convert the HTML from the RSS feeds but hopefully the
 * html from the medium export we have.
 *
 * We need a custom solution to be able to convert the iframes
 * the MDX element we're going to generate gist snippets with.
 */

const TurndownService = require('turndown');
const turndownService = new TurndownService();

/**
 * Medium wraps github gists like this:
 * <iframe>
 *    <a href="{medium link}"/>
 * </iframe>
 *
 * here {medium link} is a url that redirects to a gist
 * which is then rendered to the page in their own way.
 *
 */
turndownService.addRule('iframe', {
  filter: 'iframe',
  replacement: function (content, node, options) {
    const [ , href ] = content.match(/href=\\\\"(.*)\\\\">/);

    return `<iframecontent:${href}>`;
  }
})

let images = [];

// parsing figure and figcaption for markdown
turndownService.addRule('img', {
  filter: 'figure',
  replacement: function (content, node) {
      const lines = content.split('\n');
      const caption = lines[2];
      const [ , imgSrc ] = content.match(/\(\\"(.*?)\\"\)/);

      // console.log('imgSrc', imgSrc);
      const imgFileName = getImageName(imgSrc);
      // console.log('imgFileName', imgFileName);
      const localImgPath = path.join('img', imgFileName);
      // console.log('localImgPath', localImgPath);
      element = "![](" + localImgPath + ")";
      // console.log('element', element);

      images.push({
        src: imgSrc,
        name: imgFileName,
        caption
      });

      return `<image:${imgFileName}>`;
      return `![](path_to_image)
      *image_caption*`;
  }
})

const convert = function (html) {
  images = [];
  return { md: turndownService.turndown(JSON.stringify(html)), images };
}

const getImageName = function (imgSrc) {
  const imgUrl = url.parse(imgSrc);
  let imgFileName = path.basename(imgUrl.pathname);
  const parsed = path.parse(imgFileName);
  const name = parsed.name.replace(/[^a-zA-Z0-9]/g, '__');
  const ext = parsed.ext ? parsed.ext : ".jpg"; // if no extension, add .jpg
  imgFileName = name + ext;
  return imgFileName;
}


module.exports = convert;
