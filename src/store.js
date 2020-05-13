import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: 1,
    drawer: null,
    myDashboard: {
      showTimeExt: false,
      timeRange: {
        start: undefined,
        end: undefined,
      },
      region: [],
      site: [],
      structure: [],
      layout: [],
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
    SET_TIMERANGE (state, payload) {
      state.myDashboard.timeRange = payload
    },
    TOGGLE_TIMEEXT (state, payload) {
      state.myDashboard.showTimeExt = payload
    },
    SET_LAYOUT (state, payload) {
      state.myDashboard.layout = payload
    },
  },
  actions: {},
})
