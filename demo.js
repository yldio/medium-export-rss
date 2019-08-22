const express = require('express');
const http = require('http');

const Export = require('./src/export-rss');

console.log({ Export });
const app = express();

app.get('/', async (req, res) => {
  res.status(200);
  res.write(`
    <!DOCTYPE html>
    <html lang="en" dir="ltr">
      <head>
        <meta charset="utf-8">
        <title>Open Source Stats</title>
        <style>
          body {
            font-family: -apple-system;
            margin: 40px;
          }
          * {
            box-sizing: border-box;
          }
          .big {
            font-size: 35px;
            margin-bottom: 30px;
            max-width: 400px;
          }
          .repo-container {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            width: 1020px;
            margin: 0 auto;
          }
          .repo {
            border: 1px solid black;
            padding: 20px;
            font-size: 20px;
            margin: 5px;
            overflow: hidden;
          }
          .repo > div {
            margin-bottom: 10px;
          }
          .repo-name {
            font-weight: 500;
          }
          .topics {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
          }
          .topic {
            padding: 5px;
            border: 1px solid rgba(0,0,0,0.5);
            margin-right: 5px;
            margin-bottom: 5px;
          }
          .content {
            height: 500px;
            overflow: hidden;
          }
        </style>
      </head>
      <body>
  `);

  const posts = await Export();

  res.write(`
  <div class="repo-container">
    ${posts
      .map(post => {
        const { title, link, category, author, pubDate, content } = post;

        return `
        <div class="repo">    
          <div class="repo-name"><a href="${link}">${title}</a></div>
          <div class="repo-name">${author}</div>
          <div class="repo-name">${pubDate}</div>
          <div class="topics">${category
            .map(t => `<div class="topic">${t}</div>`)
            .slice(0, 5)
            .join('')}</div>  
          <div class="content">${content}</div>
        </div>`;
      })
      .join('')}
        </div>
  `);

  res.write(`</body></html>`);
  res.end();
});

const server = http.createServer(app);
const port = process.env.PORT || 3000;

server.listen(port, function() {
  console.log('Express server running on *:' + port);
});
