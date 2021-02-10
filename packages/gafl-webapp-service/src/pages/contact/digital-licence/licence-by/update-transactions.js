import { DIGITAL_LICENCE_BY } from '../../../../uri.js'
import { HOW_DIGITAL_LICENCE } from '../../../../processors/mapping-constants.js'
import { isPhysical } from '../../../../processors/licence-type-display.js'

export default async request => {
  const b= await request.cache().helpers.page.getCurrentPermission(DIGITAL_LICENCE_BY.page)
  console.log(b)
  const payload = b.payload
  const permission = await request.cache().helpers.transaction.getCurrentPermission()

  switch (payload['licence-by']) {
    case 'email':
      permission.licenceBy = DIGITAL_LICENCE_BY.email
      permission.licenceByEmail = payload.email
      permission.licenceByText = null
      break

    case 'text':
      permission.licenceBy = DIGITAL_LICENCE_BY.text
      permission.licenceByEmail = null
      permission.licenceByText = payload.text
      break
  }

  await request.cache().helpers.transaction.setCurrentPermission(permission)
}
