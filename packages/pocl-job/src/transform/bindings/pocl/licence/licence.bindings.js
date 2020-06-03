import { Binding } from '../../binding.js'
import { salesApi } from '@defra-fish/connectors-lib'

/**
 * Licence item identifier
 * @type {Binding}
 */
export const ItemId = new Binding({
  element: 'ITEM_ID',
  transform: async context => {
    let permitId
    if (context.value) {
      const permit = await salesApi.permits.find({ itemId: context.value })
      permitId = permit && permit.id
    }
    return permitId
  }
})

/**
 * Start date of the licence
 * @type {Binding}
 */
export const StartDate = new Binding({ element: 'START_DATE', transform: Binding.TransformTextOnly })

/**
 * Start time of the licence
 * @type {Binding}
 */
export const StartTime = new Binding({ element: 'START_TIME', transform: Binding.TransformTextOnly })
