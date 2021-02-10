import { CONTACT_SUMMARY_SEEN, CommonResults, allowsPhysicalLicence } from '../../../../constants.js'
import { isPhysical } from '../../../../processors/licence-type-display.js'

export default async request => {
  const permission = await request.cache().helpers.transaction.getCurrentPermission()
  
  if(permission.fromSummary === CONTACT_SUMMARY_SEEN)  {
      return CommonResults.SUMMARY
  } else if(isPhysical(permission)) {
      console.log('allows physical')
      return allowsPhysicalLicence.YES
  } else {
    console.log('no physical')
      return allowsPhysicalLicence.NO
  }
}
