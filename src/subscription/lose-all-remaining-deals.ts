import * as hubspot from '@hubspot/api-client'
import { BatchInputSimplePublicObjectId, Filter, SimplePublicObjectId } from '@hubspot/api-client/lib/codegen/crm/deals/api';


/**
 * HubSpot will display an error when you paste this code, but it actually 
 * works if you ignore it and just save it. 
 * 
 * You need to create a custom property called 'recurring_date' with a number type for this code work. 
 */
exports.main = async (event, callback) => {

    const hubspotClient = new hubspot.Client({
        apiKey: process.env.HAPIKEY
    });

    const dealId = event.object.objectId

    const results = await hubspotClient.crm.deals.basicApi.getById(dealId, [
        'closedate',
        'amount',
        'dealname',
        'dealstage',
        'recurring_date',
        'keiyakukaishibi',
        'original_deal_id',
    ])

    const deal = results.body.properties


    const newDealData = {
        properties: {
            amount: `${-deal.amount}`,
            subscription_status: '解約',
        }
    }

    await hubspotClient.crm.deals.basicApi.update(dealId, newDealData)


    const res = await hubspotClient.crm.deals.searchApi.doSearch({
        filterGroups: [
            {
                filters: [
                    { propertyName: 'original_deal_id', value: deal.original_deal_id, operator: Filter.OperatorEnum.EQ, },
                    { propertyName: 'dealstage', value: '16654618', operator: Filter.OperatorEnum.EQ, },
                ]
            },
        ],
        sorts: [],
        limit: 100,
        after: 0,
        properties: []
    })

    await hubspotClient.crm.deals.batchApi.archive({inputs: res.body.results.map(item => {return {id: item.id}})})

    callback({
        outputFields: {}
    })
}
