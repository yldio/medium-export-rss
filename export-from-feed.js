const Got = require('got');
const Export = require('./src');

module.exports.handler = async () => {
  const { body } = await Got('https://medium.com/feed/yld-blog');

  let result;

  try {
    result = await Export([body]);
  } catch (error) {
    throw new Error(error);
  }

  return result;
};
