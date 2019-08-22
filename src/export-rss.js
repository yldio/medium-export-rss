const Got = require('got');
const Xml2Js = require('xml2js');
const Main = require('apr-main');
const { default: Map } = require('apr-map');
const { promisify } = require('util');
const Get = require('lodash.get');

const ParseString = promisify(Xml2Js.parseString);

module.exports = async () => {
  const { body } = await Got.get('https://medium.com/feed/yld-blog');
  const parsed = await ParseString(body);

  const posts = await Map(
    Get(parsed, 'rss.channel[0].item'),
    ({
      title,
      link,
      category,
      'dc:creator': author,
      pubDate,
      'content:encoded': content,
    }) => ({
      title,
      link,
      category,
      author,
      pubDate,
      content,
    })
  );

  return posts;
};
