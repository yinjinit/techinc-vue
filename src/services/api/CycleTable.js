import axios from 'axios'

export default {
  async allByUserDateTimeRange (user) {
    return await axios
      .get(`/CycleTable/GetByUserDateTimeRange/${user}`)
      .then(resp => resp.data)
      .catch(err => err)
  },
}
