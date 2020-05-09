import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    drawer: null,
    showTimeExt: false,
    timeRange: {
      startDate: '2020-05-01',
      startTime: '00:00',
      endDate: '2020-05-08',
      endTime: '00:00',
    },
    notifications: [
      'Mike John Responded to your email',
      'You have 5 new tasks',
      "You're now friends with Andrew",
      'Another Notification',
      'Another one',
    ],
  },
  mutations: {
    SET_DRAWER (state, payload) {
      state.drawer = payload
    },
    SET_NOTIFICATIONS (state, payload) {
      state.notifications = payload
    },
    SET_TIMEEXT (state, payload) {
      state.showTimeExt = payload
    },
    SET_TIMERANGE (state, payload) {
      state.timeRange = payload
    },
  },
  actions: {},
})
