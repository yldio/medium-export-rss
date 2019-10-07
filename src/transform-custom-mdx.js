const { default: Map } = require('apr-map');
const Waterfall = require('apr-waterfall');

const TransformImageData = require('./transform-image-data');
const TransformIFrames = require('./transform-iframes');

module.exports = async (posts, environment) => {
  return Map(posts, async post => {
    const processedMarkdown = await Waterfall([
      async () => TransformImageData(post, environment),
      async post => TransformIFrames(post),
    ]);

    return {
      ...post,
      md: processedMarkdown,
    };
  });
};
