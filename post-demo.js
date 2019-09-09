const fetch = require('node-fetch');

const Export = require('./src/export-rss');
const generatePost = require('./src/contentful');

const stripMarkdown = str => str.substring(1, str.length-1);

const findOcorrences = str => {
  const regex = /<iframecontent:(.*)>/gi;
  let result, ocorrences = [];

  while ( (result = regex.exec(str)) ) {
    const [ chunk, url ] = result;

    ocorrences.push({
      chunk,
      url
    });
  }

  return ocorrences;
};

const getIframeContent = async url => {
  const getContent = await fetch(url);
  const content = await getContent.text();
  const [ , link ] = content.match(/<meta property="og:url" content="(.*?)"/)
  let type;

  console.log('link', link);

  switch (true) {
    case link.includes('gist.github'):
      const [ , gistData ] = link.split('https://gist.github.com/');
      const [ , gistId ] = gistData.split('/');

      return {
        type: 'gist',
        id: gistId
      };
    case link.includes('youtube'):
      const [ , videoId ] = link.split('https://www.youtube.com/watch?v=');

      return {
        type: 'youtube',
        id: videoId
      };
    default:
      return {
        type: 'unknown',
        link
      }
  }
}

const gistBuilder = id => `<Gist id="${id}" />`;

const youtubeVideoBuilder = id => `<iframe width="560" height="315" src="https://www.youtube.com/embed/${id}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`

const genericIframeBuilder = link => `<iframe width="560" height="315" src="${link}"`;

const processIframes = async markdown => {
  const ocorrences = findOcorrences(markdown);

  if(ocorrences.length > 0) {
    let processedMarkdown = markdown;
    let hasGist = false;

    await Promise.all(ocorrences.map(async ({ chunk, url }) => {
      const { type, id, link } = await getIframeContent(url);

      switch (type) {
        case 'gist':
          hasGist = true;
          processedMarkdown = processedMarkdown.replace(chunk, gistBuilder(id));
          break;
        case 'youtube':
          processedMarkdown = processedMarkdown.replace(chunk, youtubeVideoBuilder(id));
          break;
        default:
            processedMarkdown = processedMarkdown.replace(chunk, genericIframeBuilder(link));
      }
    }))

    if(hasGist) {
      processedMarkdown = `import { Gist } from '@blocks/kit'

      ${processedMarkdown}
      `;
    }

    return processedMarkdown;
  }

  return markdown;
}

module.exports.init = async () => {
  const posts = await Export();

  posts.map(async post => {
    const postData = {...post};
    const strippedMarkdown = stripMarkdown(post.markdown);
    const processedMarkdown = await processIframes(strippedMarkdown);
    postData.markdown = processedMarkdown;

    generatePost(postData);
  });
}