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
turndownService.addRule('iframe', {
  filter: 'iframe',
  replacement: function (content, node, options) {
    const [ , href ] = content.match(/href=\\\\"(.*)\\\\">/);

    return `<iframecontent:${href}>`;
  }
})

module.exports = html => turndownService.turndown(JSON.stringify(html));
