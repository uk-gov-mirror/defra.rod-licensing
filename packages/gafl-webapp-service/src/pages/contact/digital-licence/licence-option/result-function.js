import { CONTACT_SUMMARY_SEEN, CommonResults } from '../../../../constants.js'
import { HOW_LICENCE } from '../../../../processors/mapping-constants.js'

export const licenceByMethod = { DIGITAL: 'digital', POST: 'post' }

export default async request => {
  const permission = await request.cache().helpers.transaction.getCurrentPermission()
  console.log(permission.licenceOption)
  if(permission.fromSummary === CONTACT_SUMMARY_SEEN)  {
      return CommonResults.SUMMARY
  } else if(permission.licenceOption === HOW_LICENCE.paper) {
      return licenceByMethod.POST
  } else {
      return licenceByMethod.DIGITAL
  }
}
