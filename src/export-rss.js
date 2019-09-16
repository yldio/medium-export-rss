const Got = require('got');
const Xml2Js = require('xml2js');
const { default: Map } = require('apr-map');
const { promisify } = require('util');
const Get = require('lodash.get');
const HtmlToMarkdown = require('./html-parser');

const ParseString = promisify(Xml2Js.parseString);

module.exports = async () => {
  const { body } = await Got.get('https://medium.com/feed/yld-blog');
  const parsed = await ParseString(body);

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
      const markdown = HtmlToMarkdown(content[0]);
      const [ , slug ] = link[0].match(/yld-blog\/(.*)/);

      return {
        title,
        link,
        category,
        author,
        pubDate,
        markdown,
        slug
      };
    }
  );

  return posts;
};
