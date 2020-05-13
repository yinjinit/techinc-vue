import axios from 'axios'

export default {
  async allByUserDateTimeRange (user, initialDate, start, end, assetId) {
    return await axios
      .get('/CycleTable/GetByUserDateTimeRange/' +
        user + '/' + initialDate + '/' + start + '/' + end +
        (assetId != null ? '/' + assetId : ''))
      .then(resp => resp.data)
      .catch(err => err)
  },
}
