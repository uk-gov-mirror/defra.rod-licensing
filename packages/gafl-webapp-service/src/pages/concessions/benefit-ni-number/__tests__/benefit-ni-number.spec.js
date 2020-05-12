import { start, stop, initialize, injectWithCookie, postRedirectGet } from '../../../../__mocks__/test-utils.js'
import { BENEFIT_NI_NUMBER, LICENCE_SUMMARY, BENEFIT_CHECK, TEST_TRANSACTION } from '../../../../uri.js'
import * as concessionHelper from '../../../../processors/concession-helper.js'
import { CONCESSION_PROOF } from '../../../../processors/mapping-constants.js'

beforeAll(d => start(d))
beforeAll(d => initialize(d))
afterAll(d => stop(d))

describe('The NI page', () => {
  it('returns success on requesting', async () => {
    const data = await injectWithCookie('GET', BENEFIT_NI_NUMBER.uri)
    expect(data.statusCode).toBe(200)
  })

  it('redirects back to itself on an empty response', async () => {
    const data = await injectWithCookie('POST', BENEFIT_NI_NUMBER.uri, {})
    expect(data.statusCode).toBe(302)
    expect(data.headers.location).toBe(BENEFIT_NI_NUMBER.uri)
  })

  it('redirects back to itself on an invalid response', async () => {
    const data = await injectWithCookie('POST', BENEFIT_NI_NUMBER.uri, { 'ni-number': '01234567890123456' })
    expect(data.statusCode).toBe(302)
    expect(data.headers.location).toBe(BENEFIT_NI_NUMBER.uri)
  })

  it('the controller redirects to the licence summary page on a valid response and sets the number in the transaction', async () => {
    await postRedirectGet(BENEFIT_CHECK.uri, { 'benefit-check': 'yes' })
    const data = await postRedirectGet(BENEFIT_NI_NUMBER.uri, { 'ni-number': '1234' })
    expect(data.statusCode).toBe(302)
    expect(data.headers.location).toBe(LICENCE_SUMMARY.uri)
    const { payload } = await injectWithCookie('GET', TEST_TRANSACTION.uri)
    expect(concessionHelper.hasDisabled(JSON.parse(payload).permissions[0])).toBeTruthy()
    expect(JSON.parse(payload).permissions[0].concessions[0].proof).toEqual({
      type: CONCESSION_PROOF.NI,
      referenceNumber: '1234'
    })
  })
})
