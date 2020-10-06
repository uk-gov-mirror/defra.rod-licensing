import Joi from 'joi'
import moment from 'moment'
import JoiDate from '@hapi/joi-date'
import { START_AFTER_PAYMENT_MINUTES, ADVANCED_PURCHASE_MAX_DAYS } from '@defra-fish/business-rules-lib'
import { LICENCE_TO_START } from '../../../uri.js'
import pageRoute from '../../../routes/page-route.js'
import { dateFormats } from '../../../constants.js'
import { nextPage } from '../../../routes/next-page.js'

const JoiX = Joi.extend(JoiDate)

const validator = payload => {
  const licenceStartDate = `${payload['licence-start-date-year']}-${payload['licence-start-date-month']}-${payload['licence-start-date-day']}`
  Joi.assert(
    {
      'licence-start-date': licenceStartDate,
      'licence-to-start': payload['licence-to-start']
    },
    Joi.object({
      'licence-to-start': Joi.string()
        .valid('after-payment', 'another-date')
        .required(),
      'licence-start-date': Joi.alternatives().conditional('licence-to-start', {
        is: 'another-date',
        then: JoiX.date()
          .format(dateFormats)
          .min(moment().startOf('day'))
          .max(moment().add(ADVANCED_PURCHASE_MAX_DAYS, 'days'))
          .required(),
        otherwise: Joi.string().empty('')
      })
    }).options({ abortEarly: false, allowUnknown: true })
  )
}

const getData = () => {
  const fmt = 'DD MM YYYY'
  return {
    exampleStartDate: moment()
      .add(1, 'days')
      .format(fmt),
    minStartDate: moment().format(fmt),
    maxStartDate: moment()
      .add(ADVANCED_PURCHASE_MAX_DAYS, 'days')
      .format(fmt),
    advancedPurchaseMaxDays: ADVANCED_PURCHASE_MAX_DAYS,
    startAfterPaymentMinutes: START_AFTER_PAYMENT_MINUTES
  }
}

export default pageRoute(LICENCE_TO_START.page, LICENCE_TO_START.uri, validator, nextPage, getData)
