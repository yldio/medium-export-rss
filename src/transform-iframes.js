const fetch = require('node-fetch');

const gistBuilder = id => `<Gist id="${id}" />`;

const youtubeVideoBuilder = id => `<YouTube videoId="${id}" />`;

const genericIframeBuilder = link =>
  `<iframe width="560" height="315" src="${link}"/>`;

const findOccurrences = str => {
  const regex = /<iframecontent:"(\S*)">/gi;
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
  const { url: forwardedUrl } = await fetch(url);

  switch (true) {
    case forwardedUrl.includes('gist.github'): {
      const [, gistData] = forwardedUrl.split('https://gist.github.com/');
      const [, gistId] = gistData.split('/');

      return {
        type: 'gist',
        id: gistId,
      };
    }

    case forwardedUrl.includes('youtube'): {
      const [, videoId] = forwardedUrl.split(
        'https://www.youtube.com/watch?v=',
      );

      return {
        type: 'youtube',
        id: videoId,
      };
    }

    default:
      return {
        type: 'unknown',
        link: forwardedUrl,
      };
  }
};

module.exports = async post => {
  const { md, title, slug } = post;

  let processedMarkdown = md;

  const occurrences = findOccurrences(md);

  if (occurrences.length > 0) {
    await Promise.all(
      occurrences.map(async ({ chunk, url }) => {
        const { type, id, link } = await getIframeContent(url);

        switch (type) {
          case 'gist':
            processedMarkdown = processedMarkdown.replace(
              chunk,
              gistBuilder(id),
            );
            break;
          case 'youtube':
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
  }

  const frontMatter = `---
title: "${title}"
slug: ${slug}
root: '/blog'
---
`;

  processedMarkdown = `${frontMatter}

${processedMarkdown}
`;

  return processedMarkdown;
};
