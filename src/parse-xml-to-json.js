const Xml2Js = require('xml2json');
const { default: Map } = require('apr-map');
const Get = require('lodash.get');

module.exports = async (data, key = 'rss.channel.item') => {
  const parsed = await Xml2Js.toJson(data, { object: true });

  const posts = await Map(Get(parsed, key, []), res => {
    const {
      title,
      link,
      category: tags = [],
      'dc:creator': authorName,
      pubDate: firstPublishedAt,
      'content:encoded': content,
    } = res;

    const [, slug] = link.match(/yld-blog\/(.*)/);
    return {
      title,
      link,
      tags,
      authorName,
      firstPublishedAt,
      html: content,
      slug,
    };
  });

  return posts;
};
