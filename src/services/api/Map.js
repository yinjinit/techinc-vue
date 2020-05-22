import axios from 'axios'

export default {
  async allLocationsByUser (user) {
    return await axios
      .get(`/LocationTable/AllByUser/${user}`)
      .then(resp => resp.data)
      .catch(err => err)
  },
  async allRoadsByUser (user) {
    return await axios
      .get(`/RoadTable/AllByUser/${user}`)
      .then(resp => resp.data)
      .catch(err => err)
  },
}
