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

mock.onGet(/\/CycleTable\/GetByUserDateTimeRange\/.*/)
  .reply(() => {
    const json = require(
      './json/analysis/CycleTableGetByUserDateTimeRange.json')
    return [200, json]
  })
