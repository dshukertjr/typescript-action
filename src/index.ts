import * as hubspot from '@hubspot/api-client'

exports.main = async (event, callback) => {
  const hubspotClient = new hubspot.Client({
    apiKey: process.env.HAPIKEY
  })
  hubspotClient.crm.contacts.basicApi.getById(event.object.objectId, ["email", "phone"])
    .then(results => {
      let email = results.body.properties.email
      let phone = results.body.properties.phone

      console.log('email', email)

      callback({
        outputFields: {
          email: email,
          phone: phone
        }
      })
    })
    .catch(err => {
      console.error(err)
    })
}

