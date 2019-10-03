const { createClient } = require('contentful-management');

const { CMS_CRUD, CONTENTFUL_SPACE } = process.env;

const client = createClient({
  accessToken: CMS_CRUD,
});

module.exports.init = async () => {
  const space = await client.getSpace(CONTENTFUL_SPACE);
  const environment = await space.getEnvironment('master');

  const { items } = environment.getEntries({
    content_type: 'service',
    limit: 10,
  });

  console.log(JSON.stringify({ items }, null, 2));

  const unpublishedAsset = await environment.createAsset({
    fields: {
      title: {
        'en-US': 'Playsam Streamliner',
      },
      file: {
        'en-US': {
          contentType: 'image/jpeg',
          fileName: 'test-asset-please-delete.jpeg',
          upload:
            'https://cdn-images-1.medium.com/max/1024/1*o7lUGdzcGtBtv_b1TbGFEQ.jpeg',
        },
      },
    },
  });

  const finalAsset = await unpublishedAsset.processForAllLocales();

  console.log(JSON.stringify({ unpublishedAsset, finalAsset }, null, 2));
};
