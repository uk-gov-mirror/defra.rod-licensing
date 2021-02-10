import pageRoute from '../../../../routes/page-route.js'
import { DIGITAL_LICENCE_OPTION } from '../../../../uri.js'
import { nextPage } from '../../../../routes/next-page.js'

const validator = () => {}
const getData = () => {}
export default pageRoute(DIGITAL_LICENCE_OPTION.page, DIGITAL_LICENCE_OPTION.uri, validator, nextPage, getData)