const url = require('url');
const { default: Map } = require('apr-map');
const slugify = require('@sindresorhus/slugify');

module.exports = posts =>
  Map(posts, post => {
    const slug = slugify(url.parse(post.slug).pathname);
    const headerImage =
      post.uploadedImages && post.uploadedImages.length > 0
        ? {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: post.uploadedImages[0].assetId,
            },
          }
        : undefined;

    return {
      ...post,
      slug,
      headerImage,
    };
  });
