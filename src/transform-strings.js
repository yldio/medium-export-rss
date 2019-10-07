/**
 * When Gatsby builds, Mdx tries to render <React.Suspense/> as a component
 * instead of just string. Here we just need to wrap in `` to get Mdx to ignore
 * trying to render this component...
 */

const toReplace = [
  ['<React.Suspense/>', '`<React.Suspense/>`'],
  ['<React.Fragment/>', '`<React.Fragment/>`'],
];

exports.module = post =>
  toReplace.map(([str, replace]) =>
    post.replace(new RegExp(str, 'g'), replace),
  );
