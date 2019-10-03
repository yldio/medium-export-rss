const UploadToContentful = require('./upload-to-contentful');
const { default: Map } = require('apr-map');

module.exports = async (post, environment) => {
  const { md, images = [], title: postTitle } = post;
  let transformedMd = md;

  // Upload images to Contentful from medium url
  await Map(images, async image => {
    const { url, caption, fileName } = await UploadToContentful(
      image,
      postTitle,
      environment,
    );

    transformedMd = transformedMd.replace(
      `<image:${fileName}>`,
      `<Medium src="${url}" caption="${caption}"/>`,
    );
  });

  if (images && images.length > 0) {
    transformedMd = `import { MediumImage } from '@blocks/kit'
${transformedMd}
`;
  }

  return transformedMd;
};
