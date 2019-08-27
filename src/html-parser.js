/**
 * This is a simple html to markdown converter using turndown
 * the main reason for this file is mainly so that we can use
 * it to convert the HTML from the RSS feeds but hopefully the
 * html from the medium export we have.
 *
 * We need a custom solution to be able to convert the iframes
 * the MDX element we're going to generate gist snippets with.
 */

const TurndownService = require('turndown');
const turndownService = new TurndownService();

/**
 * Medium wraps github gists like this:
 * <iframe>
 *    <a href="{medium link}"/>
 * </iframe>
 *
 * here {medium link} is a url that redirects to a gist
 * which is then rendered to the page in their own way.
 *
 */
// turndownService.addRule('snippetIframe', {
//   filter: function(node) {
//     const isMediumIframe = [
//       ['', node.getAttribute('src')],
//       ['0', node.getAttribute('width')],
//       ['0', node.getAttribute('height')],
//       ['0', node.getAttribute('frameborder')],
//       ['no', node.getAttribute('scrolling')],
//     ].every(([expected, result]) => result === expected);

//     return node.nodeName == 'IFRAME' && isMediumIframe;
//   },
//   replacement: function(content, node, options) {
//     /**
//      * Here this textContent is the <a> tag that will contain
//      * the link to medium which will redirect to a gist.
//      *
//      * We need to request this url and get the redirected url that
//      * will come back from Got.
//      */
//     console.log('node content', node.textContent);

//     /**
//      * Once we know we have the correct url we can pass it
//      * to a custom markdown element that will be processed
//      * on the front end via MDX
//      */
//     return `\n\n### IFRAME WAS\n\n`;
//   },
// });

turndownService.addRule('iframe', {
  filter: 'iframe',
  replacement: function (content, node, options) {
    // console.log('iframe content: ', content);
    return ('<script src="https://gist.github.com/jamesseanwright/22520366bd1d6b891ffa6964f8a6404c.js"></script>');
    // return content;
  }
})

// turndownService.keep(['iframe'])


module.exports = html => turndownService.turndown(JSON.stringify(html));
