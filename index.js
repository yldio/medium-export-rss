const Main = require('apr-main');
const { default: Map } = require('apr-map');
const Waterfall = require('apr-waterfall');

const ExportRSSToJSON = require('./src/export-rss-json');
const ParseHtmlToMd = require('./src/parse-html-to-markdown');
const TransformCustomMDX = require('./src/transform-custom-mdx');

const sampleData = require('./xml/posts_1_to_10.js');

const demo = true;

Main(async () => {
  const result = await Waterfall([
    async () => ExportRSSToJSON(demo && sampleData),
    async posts => Map(posts, async post => ParseHtmlToMd(post)),
    async posts => TransformCustomMDX(posts),
  ]);

  console.log(JSON.stringify({ result }, null, 2));
});
