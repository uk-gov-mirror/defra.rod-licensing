import {
  CONTACT,
  LICENCE_LENGTH,
  CONTROLLER,
  DATE_OF_BIRTH,
  LICENCE_TO_START,
  CONTACT_SUMMARY,
  NEWSLETTER,
  TEST_TRANSACTION,
  NEW_TRANSACTION,
  ADDRESS_ENTRY,
  LICENCE_SUMMARY,
  LICENCE_TYPE,
  NAME
} from '../../../../uri.js'

import { HOW_CONTACTED } from '../../../../processors/mapping-constants.js'

import { start, stop, initialize, injectWithCookies, postRedirectGet } from '../../../../__mocks__/test-utils-system.js'

import { ADULT_TODAY, dobHelper, JUNIOR_TODAY } from '../../../../__mocks__/test-utils-business-rules'
import { licenceToStart } from '../../../licence-details/licence-to-start/update-transaction'
import { licenseTypes } from '../../../licence-details/licence-type/route'

beforeAll(d => start(d))
beforeAll(d => initialize(d))
afterAll(d => stop(d))

const goodAddress = {
  premises: '14 HOWECROFT COURT',
  street: 'EASTMEAD LANE',
  locality: '',
  town: 'BRISTOL',
  postcode: 'BS9 1HJ',
  'country-code': 'GB'
}
describe('The contact preferences page', () => {
  describe('where the prerequisite are not fulfilled', async () => {
    beforeAll(async d => {
      await injectWithCookies('GET', CONTROLLER.uri)
      d()
    })

    it('redirects to the date-of-birth page if no date of birth has been set', async () => {
      const response = await injectWithCookies('GET', CONTACT.uri)
      expect(response.statusCode).toBe(302)
      expect(response.headers.location).toBe(DATE_OF_BIRTH.uri)
    })

    it('redirects to the licence to start page if no licence start date has been set has been set', async () => {
      await postRedirectGet(DATE_OF_BIRTH.uri, dobHelper(ADULT_TODAY))
      const response = await injectWithCookies('GET', CONTACT.uri)
      expect(response.statusCode).toBe(302)
      expect(response.headers.location).toBe(LICENCE_TO_START.uri)
    })

    it('redirects to the licence length page if no length has been set', async () => {
      await postRedirectGet(DATE_OF_BIRTH.uri, dobHelper(ADULT_TODAY))
      await postRedirectGet(LICENCE_TO_START.uri, { 'licence-to-start': licenceToStart.AFTER_PAYMENT })
      const response = await injectWithCookies('GET', CONTACT.uri)
      expect(response.statusCode).toBe(302)
      expect(response.headers.location).toBe(LICENCE_LENGTH.uri)
    })
  })

  describe('for a full 12 month licence, adult', async () => {
    beforeAll(async d => {
      await injectWithCookies('GET', NEW_TRANSACTION.uri)
      await postRedirectGet(DATE_OF_BIRTH.uri, dobHelper(ADULT_TODAY))
      await postRedirectGet(LICENCE_TO_START.uri, { 'licence-to-start': licenceToStart.AFTER_PAYMENT })
      await postRedirectGet(LICENCE_LENGTH.uri, { 'licence-length': '12M' })
      d()
    })

    it('return the page on request', async () => {
      const response = await injectWithCookies('GET', CONTACT.uri)
      expect(response.statusCode).toBe(200)
    })

    it('redirects to itself on an empty response', async () => {
      const response = await injectWithCookies('POST', CONTACT.uri, {})
      expect(response.statusCode).toBe(302)
      expect(response.headers.location).toBe(CONTACT.uri)
    })

    it('redirects to itself on an invalid contact method', async () => {
      const response = await injectWithCookies('POST', CONTACT.uri, { 'how-contacted': 'skype' })
      expect(response.statusCode).toBe(302)
      expect(response.headers.location).toBe(CONTACT.uri)
    })

    it('redirects to itself on an empty email', async () => {
      const response = await injectWithCookies('POST', CONTACT.uri, { 'how-contacted': 'email', email: '' })
      expect(response.statusCode).toBe(302)
      expect(response.headers.location).toBe(CONTACT.uri)
    })

    it('redirects to itself on an invalid email', async () => {
      const response = await injectWithCookies('POST', CONTACT.uri, { 'how-contacted': 'email', email: 'foo' })
      expect(response.statusCode).toBe(302)
      expect(response.headers.location).toBe(CONTACT.uri)
    })

    it('redirects to itself on an empty mobile number', async () => {
      const response = await injectWithCookies('POST', CONTACT.uri, { 'how-contacted': 'text', text: '' })
      expect(response.statusCode).toBe(302)
      expect(response.headers.location).toBe(CONTACT.uri)
    })

    it('redirects to itself on an invalid mobile number', async () => {
      const response = await injectWithCookies('POST', CONTACT.uri, { 'how-contacted': 'text', text: 'foo' })
      expect(response.statusCode).toBe(302)
      expect(response.headers.location).toBe(CONTACT.uri)
    })

    it('post response none sets how-contacted - letter, in the cache', async () => {
      await postRedirectGet(CONTACT.uri, { 'how-contacted': 'none' })
      const { payload } = await injectWithCookies('GET', TEST_TRANSACTION.uri)
      expect(JSON.parse(payload).permissions[0].licensee.preferredMethodOfConfirmation).toEqual(HOW_CONTACTED.letter)
      expect(JSON.parse(payload).permissions[0].licensee.preferredMethodOfReminder).toEqual(HOW_CONTACTED.letter)
    })

    it('if letter is specified then the licence is subsequently changed to junior, contact type none is set in the cache, in the cache', async () => {
      await postRedirectGet(CONTACT.uri, { 'how-contacted': 'none' })
      await postRedirectGet(DATE_OF_BIRTH.uri, dobHelper(JUNIOR_TODAY))
      const { payload } = await injectWithCookies('GET', TEST_TRANSACTION.uri)
      expect(JSON.parse(payload).permissions[0].licensee.preferredMethodOfConfirmation).toEqual(HOW_CONTACTED.none)
      expect(JSON.parse(payload).permissions[0].licensee.preferredMethodOfReminder).toEqual(HOW_CONTACTED.none)
    })

    it('post response email sets how-contacted - email, in the cache', async () => {
      await postRedirectGet(CONTACT.uri, { 'how-contacted': 'email', email: 'example@email.com' })
      const { payload } = await injectWithCookies('GET', TEST_TRANSACTION.uri)
      expect(JSON.parse(payload).permissions[0].licensee.preferredMethodOfConfirmation).toEqual(HOW_CONTACTED.email)
      expect(JSON.parse(payload).permissions[0].licensee.preferredMethodOfReminder).toEqual(HOW_CONTACTED.email)
    })

    it('post response text sets how-contacted - text in the cache', async () => {
      await postRedirectGet(CONTACT.uri, { 'how-contacted': 'text', text: '+22 0445638902' })
      const { payload } = await injectWithCookies('GET', TEST_TRANSACTION.uri)
      expect(JSON.parse(payload).permissions[0].licensee.preferredMethodOfConfirmation).toEqual(HOW_CONTACTED.text)
      expect(JSON.parse(payload).permissions[0].licensee.preferredMethodOfReminder).toEqual(HOW_CONTACTED.text)
    })

    it('controller redirects to the newsletter page if an email is given', async () => {
      const response = await postRedirectGet(CONTACT.uri, { 'how-contacted': 'email', email: 'example@email.com' })
      expect(response.statusCode).toBe(302)
      expect(response.headers.location).toBe(NEWSLETTER.uri)
    })

    it('controller redirects to the newsletter page if a text number is given', async () => {
      const response = await postRedirectGet(CONTACT.uri, { 'how-contacted': 'text', text: '+22 0445638902' })
      expect(response.statusCode).toBe(302)
      expect(response.headers.location).toBe(NEWSLETTER.uri)
    })
  })

  describe('for a junior licence', async () => {
    beforeAll(async d => {
      await injectWithCookies('GET', NEW_TRANSACTION.uri)
      await postRedirectGet(DATE_OF_BIRTH.uri, dobHelper(JUNIOR_TODAY))
      await postRedirectGet(LICENCE_TO_START.uri, { 'licence-to-start': licenceToStart.AFTER_PAYMENT })
      d()
    })

    it('post response none sets how-contacted - none in the cache', async () => {
      await postRedirectGet(CONTACT.uri, { 'how-contacted': 'none' })
      const { payload } = await injectWithCookies('GET', TEST_TRANSACTION.uri)
      expect(JSON.parse(payload).permissions[0].licensee.preferredMethodOfConfirmation).toEqual(HOW_CONTACTED.none)
      expect(JSON.parse(payload).permissions[0].licensee.preferredMethodOfReminder).toEqual(HOW_CONTACTED.none)
    })
  })

  describe('for 1 day licence', async () => {
    beforeAll(async d => {
      await injectWithCookies('GET', NEW_TRANSACTION.uri)
      await postRedirectGet(DATE_OF_BIRTH.uri, dobHelper(ADULT_TODAY))
      await postRedirectGet(LICENCE_TO_START.uri, { 'licence-to-start': licenceToStart.AFTER_PAYMENT })
      await postRedirectGet(LICENCE_LENGTH.uri, { 'licence-length': '1D' })
      d()
    })

    it('post response none sets how-contacted - none in the cache', async () => {
      await postRedirectGet(CONTACT.uri, { 'how-contacted': 'none' })
      const { payload } = await injectWithCookies('GET', TEST_TRANSACTION.uri)
      expect(JSON.parse(payload).permissions[0].licensee.preferredMethodOfConfirmation).toEqual(HOW_CONTACTED.none)
      expect(JSON.parse(payload).permissions[0].licensee.preferredMethodOfReminder).toEqual(HOW_CONTACTED.none)
    })
  })

  describe('if the contact summary has been seen', async () => {
    beforeAll(async d => {
      await injectWithCookies('GET', NEW_TRANSACTION.uri)
      await injectWithCookies('GET', CONTROLLER.uri)

      // Set up the licence details
      await postRedirectGet(DATE_OF_BIRTH.uri, dobHelper(ADULT_TODAY))
      await postRedirectGet(LICENCE_TO_START.uri, { 'licence-to-start': licenceToStart.AFTER_PAYMENT })
      await postRedirectGet(LICENCE_TYPE.uri, { 'licence-type': licenseTypes.troutAndCoarse2Rod })
      await postRedirectGet(LICENCE_LENGTH.uri, { 'licence-length': '12M' })
      await postRedirectGet(LICENCE_SUMMARY.uri)

      // Set up the contact details
      await postRedirectGet(NAME.uri, { 'last-name': 'Graham', 'first-name': 'Willis' })
      await postRedirectGet(ADDRESS_ENTRY.uri, goodAddress)
      await postRedirectGet(CONTACT.uri, { 'how-contacted': 'email', email: 'new3@example.com' })
      await postRedirectGet(NEWSLETTER.uri, { newsletter: 'yes', 'email-entry': 'no' })
      await injectWithCookies('GET', CONTACT_SUMMARY.uri)
      d()
    })

    it('controller redirects to the summary page', async () => {
      const response = await postRedirectGet(CONTACT.uri, { 'how-contacted': 'none' })
      expect(response.statusCode).toBe(302)
      expect(response.headers.location).toBe(CONTACT_SUMMARY.uri)
    })
  })
})
