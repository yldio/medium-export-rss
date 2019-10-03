const { default: Map } = require('apr-map');
const Waterfall = require('apr-waterfall');
const { createClient } = require('contentful-management');

const TransformImageData = require('./transform-image-data');
const TransformIFrames = require('./transform-iframes');

const { CMS_CRUD, CONTENTFUL_SPACE } = process.env;

const client = createClient({
  accessToken: CMS_CRUD,
});

module.exports = async posts => {
  const space = await client.getSpace(CONTENTFUL_SPACE);
  const environment = await space.getEnvironment('development');

  return Map(posts, async post => {
    const processedMarkdown = await Waterfall([
      async () => TransformImageData(post, environment),
      async md => TransformIFrames(md),
    ]);

    return {
      ...post,
      md: processedMarkdown,
    };
  });
};
