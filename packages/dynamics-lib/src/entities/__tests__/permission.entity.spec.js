import { Permission, Contact, Permit } from '../../index'

describe('permission entity', () => {
  it('maps from dynamics', async () => {
    const permission = Permission.fromResponse({
      '@odata.etag': 'W/"186695153"',
      defra_permissionid: '347a9083-361e-ea11-a810-000d3a25c5d6',
      defra_name: '00000000-2WC3FDR-CD379B',
      defra_issuedate: '2019-12-13T09:00:00Z',
      defra_startdate: '2019-12-14T00:00:00Z',
      defra_enddate: '2020-12-13T23:59:59Z',
      defra_stagingid: '71ad9a25-2a03-406b-a0e3-f4ff37799374',
      defra_datasource: 910400003
    })
    const expectedFields = {
      id: '347a9083-361e-ea11-a810-000d3a25c5d6',
      referenceNumber: '00000000-2WC3FDR-CD379B',
      issueDate: '2019-12-13T09:00:00Z',
      startDate: '2019-12-14T00:00:00Z',
      endDate: '2020-12-13T23:59:59Z',
      stagingId: '71ad9a25-2a03-406b-a0e3-f4ff37799374',
      dataSource: 910400003
    }

    expect(permission).toBeInstanceOf(Permission)
    expect(permission).toMatchObject(expect.objectContaining({ etag: 'W/"186695153"', ...expectedFields }))
    expect(permission.toString()).toMatchObject(expect.objectContaining(expectedFields))
  })

  it('maps to dynamics', async () => {
    // Mimic a permit which is already persisted to test binding
    const permit = Permit.fromResponse({
      '@odata.etag': 'W/"22639016"',
      defra_availablefrom: '2017-03-31T23:00:00Z',
      defra_availableto: '2020-03-31T22:59:00Z',
      'defra_duration@OData.Community.Display.V1.FormattedValue': '1 day',
      defra_duration: 910400000,
      'defra_permittype@OData.Community.Display.V1.FormattedValue': 'Rod Fishing Licence',
      defra_permittype: 910400000,
      defra_advertisedprice: 6.0,
      defra_permitid: '9d1b34a0-0c66-e611-80dc-c4346bad0190',
      defra_name: '2017-20 Coarse 1 day 2 Rod Licence (Full)',
      'defra_permitsubtype@OData.Community.Display.V1.FormattedValue': 'Trout and coarse',
      defra_permitsubtype: 910400001,
      'defra_equipment@OData.Community.Display.V1.FormattedValue': 'Up to 2 rods',
      defra_equipment: 910400000,
      defra_isforfulfilment: false,
      defra_iscountersales: true,
      defra_advertisedprice_base: 6.0,
      defra_itemid: '42289'
    })

    // Mimic a new contact to test binding
    const contact = new Contact()

    const permission = new Permission()
    permission.referenceNumber = '00000000-2WC3FDR-CD379B'
    permission.issueDate = '2019-12-13T09:00:00Z'
    permission.startDate = '2019-12-14T00:00:00Z'
    permission.endDate = '2020-12-13T23:59:59Z'
    permission.stagingId = '71ad9a25-2a03-406b-a0e3-f4ff37799374'
    permission.dataSource = 910400003

    permission.bindToContact(contact)
    permission.bindToPermit(permit)

    const dynamicsEntity = permission.toRequestBody()
    expect(dynamicsEntity).toMatchObject(
      expect.objectContaining({
        defra_name: '00000000-2WC3FDR-CD379B',
        defra_issuedate: '2019-12-13T09:00:00Z',
        defra_startdate: '2019-12-14T00:00:00Z',
        defra_enddate: '2020-12-13T23:59:59Z',
        defra_stagingid: '71ad9a25-2a03-406b-a0e3-f4ff37799374',
        defra_datasource: 910400003,
        'defra_PermitId@odata.bind': `/${Permit.definition.collection}(${permit.id})`,
        'defra_ContactId@odata.bind': '$' + contact.uniqueContentId
      })
    )
  })
})
