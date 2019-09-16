require('dotenv').config()

const { createClient } = require('contentful-management')

const generatePost = async postData => {
  // Get contentful data
  const { CMS_CRUD } = process.env;
  const client = createClient({
    accessToken: CMS_CRUD
  })

  const space = await client.getSpace('g6423bljuuyt')
  const environment = await space.getEnvironment('master')
  
  //check if post is already on contentful

  const publishEntry = async entry => {
    const id = await environment.createEntry('meetupEven', generatedEvent)
    const newEntry = await environment.getEntry(id.sys.id)
  
    console.log(`Publishing creted entry ${meetup.eventName}`)
    return newEntry.publish()
  }

  const { title, link, category, author, pubDate, content, markdown } = postData;
  // console.log('postData', JSON.stringify(postData, 2, null));
  console.log('final markdown: ', markdown);
}



module.exports = postData => generatePost(postData);