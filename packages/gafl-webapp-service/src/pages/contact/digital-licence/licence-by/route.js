import pageRoute from '../../../../routes/page-route.js'
import { DIGITAL_LICENCE_BY} from '../../../../uri.js'
import { nextPage } from '../../../../routes/next-page.js'
import { HOW_DIGITAL_LICENCE } from '../../../../processors/mapping-constants.js'

const validator = () => {}
const getData = async (request) => {
    const permission = await request.cache().helpers.transaction.getCurrentPermission()

    return {
        licenceBy: HOW_DIGITAL_LICENCE
    }
}
export default pageRoute(DIGITAL_LICENCE_BY.page, DIGITAL_LICENCE_BY.uri, validator, nextPage, getData)