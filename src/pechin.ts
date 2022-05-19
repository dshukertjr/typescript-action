import * as hubspot from '@hubspot/api-client';
import * as axios from 'axios';

exports.main = async (event, callback) => {
  const hubspotClient = new hubspot.Client({
    apiKey: process.env.HAPIKEY,
  });
  let contacts = await hubspotClient.crm.contacts.getAll();
  contacts = contacts.filter((contact) => contact.id != event.object.objectId);
  const randomContact = contacts[Math.floor(Math.random() * contacts.length)];

  const engagementsAPIURL = `https://api.hubapi.com/engagements/v1/engagements?hapikey=${process.env.HAPIKEY}`;

  const postBody = {
    engagement: {
      active: true,
      type: 'CALL',
      timestamp: new Date().getTime(),
    },
    associations: {
      contactIds: [randomContact.id],
      companyIds: [],
      dealIds: [],
      ownerIds: [],
      ticketIds: [],
    },
    attachments: [{}],
    metadata: {
      toNumber: '5618769964',
      fromNumber: '(857) 829-5489',
      durationMilliseconds: 38000,
      body: '👏 ペチン!!',
      status: 'COMPLETED',
    },
  };

  const res = await axios.default.post(engagementsAPIURL, postBody);

  await hubspotClient.crm.contacts.basicApi.update(randomContact.id, {
    properties: {
      last_pechin_time: `${new Date().getTime()}`,
    },
  });

  await delay(3000);

  console.log(`${randomContact.properties.email}にペチン`);

  callback({
    outputFields: {},
  });
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
