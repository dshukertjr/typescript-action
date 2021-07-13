import * as hubspot from '@hubspot/api-client'

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
        'original_deal_id',
    ])

    const deal = results.body.properties

    const recurringDate = +deal.recurring_date

    const currentCloseDate = new Date(deal.closedate)

    const nextCloseDate = getSameDateOfNextMonth({currentCloseDate, recurringDate})

    const nextDealName = deal.dealname.replace(`${currentCloseDate.getFullYear()}-${currentCloseDate.getMonth() + 1}`, `${nextCloseDate.getFullYear()}-${nextCloseDate.getMonth() + 1}`)

    const newDealData = {
        properties: {
            closedate: `${nextCloseDate.getTime()}`,
            amount: deal.amount,
            dealname: nextDealName,
            dealstage: '16654618',
            recurring_date: `${deal.recurring_date}`,
            original_deal_id: deal.original_deal_id
        }
    }

    const res = await hubspotClient.crm.deals.basicApi.create(newDealData)

    // Associate the new deal with the company that was originally associated with
    const newDealId = res.body.id
    const associations = await hubspotClient.crm.deals.associationsApi.getAll(dealId, 'companies')
    if(associations.body.results.length > 0) {
        await hubspotClient.crm.deals.associationsApi.create(newDealId, 'companies', associations.body.results[0].id, 'deal_to_company')
    }

    callback({
        outputFields: {}
    })
}

const getSameDateOfNextMonth = ({currentCloseDate, recurringDate}: {currentCloseDate: Date, recurringDate: number}): Date => {
    const nextCloseDate = new Date(currentCloseDate.toDateString())

    nextCloseDate.setDate(recurringDate)
    nextCloseDate.setMonth(nextCloseDate.getMonth() + 1)

    // Check if newCloseDate is actually set at next month
    // This could occur when the recurring date is set at for example 31st
    // and currently it is January
    if(!isNextMonth({currentCloseDate, nextCloseDate})) {
        // If nextCloseDate is not 1 month from current close date,
        // set the next close date at the end of next month
        nextCloseDate.setDate(0)
    }

    nextCloseDate.setMilliseconds(0)
    nextCloseDate.setSeconds(0)
    nextCloseDate.setMinutes(0)
    nextCloseDate.setHours(0)
    return nextCloseDate
}

/**
 * 
 * @param currentCloseDate Close date of the current deal
 * @param nextCloseDate Close date of the next deal
 * @returns bool of whether nextCloseDate is actually 1 month from currentCloseDate
 */
const isNextMonth = ({currentCloseDate, nextCloseDate}: {currentCloseDate: Date, nextCloseDate: Date}): boolean => {
    const currentMonth = currentCloseDate.getMonth()
    const nextMonth = nextCloseDate.getMonth()
    if((currentMonth + 1) == nextMonth) {
        return true
    }
    if(currentMonth === 11 && nextMonth === 0) {
        return true
    }
    return false
}