const Got = require('got');
const Xml2Js = require('xml2js');
const { default: Map } = require('apr-map');
const { promisify } = require('util');
const Get = require('lodash.get');

const ParseString = promisify(Xml2Js.parseString);

module.exports = async data => {
  const { body } = await Got.get('https://medium.com/feed/yld-blog');
  const parsed = await ParseString(data || body);

  const posts = await Map(
    Get(parsed, 'rss.channel[0].item', []),
    ({
      title,
      link,
      category,
      'dc:creator': author,
      pubDate,
      'content:encoded': content,
    }) => {
      const [, slug] = link[0].match(/yld-blog\/(.*)/);

      return {
        title,
        link,
        category,
        author,
        pubDate,
        html: content[0],
        slug,
      };
    },
  );

  return posts;
};
