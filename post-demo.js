const Export = require('./src/export-rss');
const generatePost = require('./src/contentful');

module.exports.init = async() => {
  const posts = await Export();
  // posts.map(async post => await generatePost(post))
  generatePost(posts[0]);
}