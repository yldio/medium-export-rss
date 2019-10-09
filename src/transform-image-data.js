const UploadToContentful = require('./upload-to-contentful');
const { default: Map } = require('apr-map');

module.exports = async (post, environment) => {
  const { md, images = [], title: postTitle } = post;
  let transformedMd = md;

  // Upload images to Contentful from medium url
  await Map(images, async image => {
    // const { url, caption, alt, fileName } = await UploadToContentful(
    //   image,
    //   postTitle,
    //   environment,
    // );

    const { url, caption, alt, fileName } = {
      url: 'https://foo.imges/',
      caption: 'A Bunch of Foo',
      alt: 'Some more foo',
      fileName: image.name,
    };

    const captionProp = caption ? `caption="${caption}"` : '';
    const altProp = alt ? `alt="${alt}"` : '';

    transformedMd = transformedMd.replace(
      `<image:${fileName}>`,
      `<FigureImage src="${url}" ${captionProp} ${altProp} />`,
    );
  });

  return {
    ...post,
    md: transformedMd,
  };
};
