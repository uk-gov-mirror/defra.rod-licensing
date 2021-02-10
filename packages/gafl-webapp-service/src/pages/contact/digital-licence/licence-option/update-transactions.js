import { DIGITAL_LICENCE_OPTION } from '../../../../uri.js'
import { HOW_LICENCE } from '../../../../processors/mapping-constants.js'
import { isPhysical } from '../../../../processors/licence-type-display.js'

export default async request => {
  const b= await request.cache().helpers.page.getCurrentPermission(DIGITAL_LICENCE_OPTION.page)
  console.log(b)
  const payload = b.payload
  const permission = await request.cache().helpers.transaction.getCurrentPermission()

  switch (payload['licence-option']) {
    case 'digital':
      permission.licenceOption = HOW_LICENCE.digital
      break

    case 'paper':
      permission.licenceOption = HOW_LICENCE.paper
      break
  }

  await request.cache().helpers.transaction.setCurrentPermission(permission)
}
