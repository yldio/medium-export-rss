const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const Export = require('./src/export-rss');
const downloader = require('./downloader');
const generatePost = require('./src/contentful');

const stripMarkdown = str => str.substring(1, str.length - 1);

const findOccurrences = str => {
  const regex = /<iframecontent:(.*)>/gi;
  let result = [];
  const occurrences = [];

  while ((result = regex.exec(str))) {
    const [chunk, url] = result;

    occurrences.push({
      chunk,
      url,
    });
  }

  return occurrences;
};

const getIframeContent = async url => {
  const getContent = await fetch(url);
  const content = await getContent.text();
  const [, link] = content.match(/<meta property="og:url" content="(.*?)"/);

  switch (true) {
    case link.includes('gist.github'): {
      const [, gistData] = link.split('https://gist.github.com/');
      const [, gistId] = gistData.split('/');

      return {
        type: 'gist',
        id: gistId,
      };
    }

    case link.includes('youtube'): {
      const [, videoId] = link.split('https://www.youtube.com/watch?v=');

      return {
        type: 'youtube',
        id: videoId,
      };
    }

    default:
      return {
        type: 'unknown',
        link,
      };
  }
};

const gistBuilder = id => `<Gist id="${id}" />`;

const youtubeVideoBuilder = id => `<YouTube videoId="${id}" />`;

const genericIframeBuilder = link =>
  `<iframe width="560" height="315" src="${link}"`;

const processIframes = async markdown => {
  const occurrences = findOccurrences(markdown);

  if (occurrences.length > 0) {
    let processedMarkdown = markdown;
    let hasGist = false;
    let hasYoutube = false;

    await Promise.all(
      occurrences.map(async ({ chunk, url }) => {
        const { type, id, link } = await getIframeContent(url);

        switch (type) {
          case 'gist':
            hasGist = true;
            processedMarkdown = processedMarkdown.replace(
              chunk,
              gistBuilder(id),
            );
            break;
          case 'youtube':
            hasYoutube = true;
            processedMarkdown = processedMarkdown.replace(
              chunk,
              youtubeVideoBuilder(id),
            );
            break;
          default:
            processedMarkdown = processedMarkdown.replace(
              chunk,
              genericIframeBuilder(link),
            );
        }
      }),
    );

    if (hasGist) {
      processedMarkdown = `import { Gist } from '@blocks/kit'

      ${processedMarkdown}
      `;
    }

    if (hasYoutube) {
      processedMarkdown = `import { YouTube } from '@blocks/kit'

      ${processedMarkdown}
      `;
    }

    return processedMarkdown;
  }

  return markdown;
};

const downloadImages = async (images, slug) => {
  if (!fs.existsSync('images')) {
    fs.mkdirSync('images');
  }

  const imgDir = path.join('images', slug);

  if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir);
  }

  const promises = [];
  images.forEach(v => {
    const localImgPath = path.join(imgDir, v.name);
    promises.push(downloader(v.src, localImgPath));
  });

  const downloaded = await Promise.all(promises);
  console.log('finished', downloaded);
};

module.exports.init = async () => {
  const posts = await Export();

  posts.map(async post => {
    const postData = { ...post };
    const { slug, markdown } = post;
    const { md, images } = markdown;
    // console.log('md', md);
    console.log('images', images);
    const strippedMarkdown = stripMarkdown(md);
    const processedMarkdown = await processIframes(strippedMarkdown);

    // download images
    downloadImages(images, slug);
    // replace image refs on md

    postData.markdown = processedMarkdown;

    generatePost(postData);
  });
};
