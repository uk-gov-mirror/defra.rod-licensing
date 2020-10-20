import Boom from '@hapi/boom'
import pageRoute from '../../../routes/page-route.js'
import { PAYMENT_CANCELLED, NEW_TRANSACTION } from '../../../uri.js'
import { nextPage } from '../../../routes/next-page.js'

import { COMPLETION_STATUS } from '../../../constants.js'
import { getPaymentStatus, cancelPayment } from '../../../services/payment/govuk-pay-service.js'
import { salesApi } from '@defra-fish/connectors-lib'
import { PAYMENT_JOURNAL_STATUS_CODES } from '@defra-fish/business-rules-lib'

const getData = async request => {
  const status = await request.cache().helpers.status.get()
  const transaction = await request.cache().helpers.transaction.get()
  const { state } = await getPaymentStatus(transaction.payment.payment_id)

  // If the payment created flag is not set to true then throw an exception
  if (!status[COMPLETION_STATUS.paymentCreated] || state.finished) {
    throw Boom.forbidden('Attempt to access the cancellation page handler with no agreed flag set')
  }

  if (state.status !== 'cancelled') {
    if (await cancelPayment(transaction.payment.payment_id)) {
      await salesApi.updatePaymentJournal(transaction.id, { paymentStatus: PAYMENT_JOURNAL_STATUS_CODES.Cancelled })
      status[COMPLETION_STATUS.paymentCancelled] = true
      await request.cache().helpers.status.set(status)
    } else {
      throw Boom.badImplementation('Error accessing the GOV.UK pay API')
    }
  }

  return {
    uri: {
      new: NEW_TRANSACTION.uri
    }
  }
}

export default pageRoute(PAYMENT_CANCELLED.page, PAYMENT_CANCELLED.uri, null, nextPage, getData)
