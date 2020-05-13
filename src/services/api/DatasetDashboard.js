import axios from 'axios'

export default {
  async getDashboardPage (id, dashboard) {
    return await axios
      .get('/DatasetDashboardInstance/GetByDatasetDashboardPage/' +
        `${id}/${dashboard}`)
      .then(resp => resp.data)
      .catch(err => err)
  },
}
