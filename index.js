const Main = require('apr-main');
const { default: Map } = require('apr-map');
const Waterfall = require('apr-waterfall');

const ExportRSSToJSON = require('./src/export-rss-json');
const ParseHtmlToMd = require('./src/parse-html-to-markdown');
const TransformCustomMDX = require('./src/transform-custom-mdx');
const PublishToContentful = require('./src/publish-to-contentful');

const sampleData = require('./xml/posts_1_to_10.js');

const development = true;

const { createClient } = require('contentful-management');
const { CMS_CRUD, CONTENTFUL_SPACE } = process.env;

const client = createClient({
  accessToken: CMS_CRUD,
});

const environmentName = development ? 'development' : 'master';

Main(async () => {
  const space = await client.getSpace(CONTENTFUL_SPACE);
  const environment = await space.getEnvironment(environmentName);

  const result = await Waterfall([
    async () => ExportRSSToJSON(development && sampleData),
    async posts => Map(posts, async post => ParseHtmlToMd(post, environment)),
    async posts => TransformCustomMDX(posts, environment),
    async posts => PublishToContentful(posts, environment),
  ]);

  console.log(JSON.stringify({ result }, null, 2));
});
