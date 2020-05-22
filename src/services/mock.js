import axios from 'axios'
const MockAdapter = require('axios-mock-adapter')

const mock = new MockAdapter(axios, { delayResponse: 2000 })

mock.onGet(
  /\/DatasetDashboardInstance\/GetByDatasetDashboardPage\/\d+\/my_dashboard/)
  .reply(() => {
    const json = require(
      './json/dataset/' +
      'DatasetDashboardInstanceGetByDatasetDashboardPageMyDashboard.json')
    return [200, json]
  })

mock.onGet('CycleTable/All')
  .reply(() => {
    const json = require(
      './json/analysis/CycleTableAll.json')
    return [200, json]
  })

mock.onGet(/\/CycleTable\/GetByAllUser\/\d+/)
  .reply(() => {
    const json = require(
      './json/analysis/CycleTableAllByUser.json')
    return [200, json]
  })

mock.onGet(/\/CycleTable\/GetByUserDateTimeRange\/\d+.*/)
  .reply(config => {
    const json = require(
      './json/analysis/CycleTableGetByUserDateTimeRange.json')
    const resp = []
    json.forEach(e => {
      resp.push({
        Region: e.Region,
        Site: e.Site,
        'Structure Type': e['Structure Type'],
        'Target Payload': e['Target Payload'],
        Tonnes: e.Tonnes,
        DateTime: e.DateTime,
      })
    })

    return [200, resp]
  })

mock.onGet(/\/LocationTable\/AllByUser\/\d+/)
  .reply(config => {
    const json = require(
      './json/analysis/LocationTableAllByUser.json')
    return [200, json]
  })

mock.onGet(/\/RoadTable\/AllByUser\/\d+/)
  .reply(config => {
    const json = require(
      './json/analysis/RoadTableAllByUser.json')
    return [200, json]
  })
