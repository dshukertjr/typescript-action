import * as hubspot from '@hubspot/api-client'

exports.main = async (event, callback) => {
  const hubspotClient = new hubspot.Client({
    apiKey: process.env.HAPIKEY
  })
  const results = await hubspotClient.crm.contacts.basicApi.getById(event.object.objectId, ["email", "phone"])  
  let email = results.body.properties.email
  let phone = results.body.properties.phone

  callback({
    outputFields: {
      email,
      phone
    }
  })
}
