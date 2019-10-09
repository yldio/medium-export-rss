const mdx = require('@mdx-js/mdx');
const Main = require('apr-main');
const Intercept = require('apr-intercept');
const Reduce = require('apr-reduce');
const fs = require('mz/fs');
const { default: Map } = require('apr-map');
const Waterfall = require('apr-waterfall');

const ParseXMLToJSON = require('./src/parse-xml-to-json');
const ParseHtmlToMd = require('./src/parse-html-to-markdown');
const TransformCustomMDX = require('./src/transform-custom-mdx');
const PublishToContentful = require('./src/publish-to-contentful');

const development = true;

const { createClient } = require('contentful-management');
const { CMS_CRUD, CONTENTFUL_SPACE } = process.env;

const client = createClient({
  accessToken: CMS_CRUD,
});

const environmentName = development ? 'development' : 'master';

const transpile = async md => {
  const jsx = await mdx(md);
  return jsx;
};

Main(async () => {
  // const XmlFileNames = await fs.readdir('./xml/full');
  const XmlFileNames = ['posts_93_to_102.xml'];
  const XmlData = await Map(XmlFileNames, async file =>
    fs.readFile(`./xml/full/${file}`),
  );

  const space = await client.getSpace(CONTENTFUL_SPACE);
  const environment = await space.getEnvironment(environmentName);

  const [err, result] = await Intercept(
    Waterfall([
      async () =>
        Reduce(XmlData, async (sum = [], acc) =>
          sum.concat(await ParseXMLToJSON(acc)),
        ),
      async posts => Map(posts, async post => ParseHtmlToMd(post, environment)),
      async posts => TransformCustomMDX(posts, environment),
      async posts => {
        return posts.map(async ({ md, slug }) => {
          // let result;
          try {
            fs.writeFile(`./md/${slug}.mdx`, md);
            // result = await transpile(md);
          } catch (error) {
            return error;
          }

          return slug;
        });
      },
    ]),
  );

  console.log({ err, result });
  // await PublishToContentful(result, environment),
});
