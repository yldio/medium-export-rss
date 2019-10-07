/**
 * This is a simple html to markdown converter using turndown
 * the main reason for this file is mainly so that we can use
 * it to convert the HTML from the RSS feeds but hopefully the
 * html from the medium export we have.
 *
 * We need a custom solution to be able to convert the iframes
 * the MDX element we're going to generate gist snippets with.
 */
const url = require('url');
const path = require('path');

const TurndownService = require('turndown');
const turndownService = new TurndownService();

let images = [];

const getImageMeta = function(imgSrc) {
  const imgUrl = url.parse(imgSrc);
  let imgFileName = path.basename(imgUrl.pathname);

  const parsed = path.parse(imgFileName);
  const name = parsed.name.replace(/[^a-zA-Z0-9]/g, '__');
  const ext = parsed.ext ? parsed.ext : '.jpg'; // if no extension, add .jpg

  imgFileName = name + ext;

  return { name: imgFileName, ext };
};

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
  replacement: content => {
    const [, href] = content.match(/href="(.*)">/);

    return `<iframecontent:${href}>`;
  },
});

// parsing figure and figcaption for markdown
turndownService.addRule('img', {
  filter: 'figure',
  replacement: content => {
    const lines = content.split('\n');
    const caption = lines[1];
    const [, imgSrc] = content.match(/!\[\]\((.*)\)/);

    const { name, ext } = getImageMeta(imgSrc);

    images.push({
      src: imgSrc,
      ext,
      name,
      caption,
    });

    return `<image:${name}>`;
  },
});

module.exports = async ({ html, ...rest }) => {
  images = [];
  const md = turndownService.turndown(html);

  return {
    ...rest,
    md,
    images,
  };
};
