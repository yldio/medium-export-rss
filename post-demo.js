const fetch = require('node-fetch');

const Export = require('./src/export-rss');
const generatePost = require('./src/contentful');

const stripMarkdown = str => str.substring(1, str.length-1);

const findOcorrences = str => {
  const regex = /mediumgist:/gi;
  let result, indexes = [];
  const keywordLength = 11;
  const urlLength = 57;

  while ( (result = regex.exec(str)) ) {
    const urlStart = result.index + keywordLength;
    const urlEnd = urlStart + urlLength;

    indexes.push({
      chunk: str.slice(result.index, urlEnd),
      url: str.slice(urlStart, urlEnd)
    });
  }

  return indexes;
};

const getGistId = async url => {
  const getMediumGist = await fetch(url);
  const gistContent = await getMediumGist.text();
  const [ , gistSubUrl ] = gistContent.match(new RegExp('"https://gist.github.com/(.*).js"'));
  const [ , gistId ] = gistSubUrl.split('/');

  return gistId;
};

const processGists = async markdown => {
  const ocorrences = findOcorrences(markdown);

  if(ocorrences.length > 0) {
    let processedMarkdown = `import { Gist } from '@blocks/kit'

    ${markdown}
    `;

    await Promise.all(ocorrences.map(async ({ chunk, url }) => {
      const gistId = await getGistId(url);
      const newMarkdown = processedMarkdown.replace(chunk, `<Gist id="${gistId}" />`);

      processedMarkdown = newMarkdown;
    }))

    return processedMarkdown;
  }

  return markdown;
}

module.exports.init = async () => {
  const posts = await Export();

  posts.map(async post => {
    const postData = {...post};
    const strippedMarkdown = stripMarkdown(post.markdown);
    const processedMarkdown = await processGists(strippedMarkdown);
    postData.markdown = processedMarkdown;

    generatePost(postData);
  });
}