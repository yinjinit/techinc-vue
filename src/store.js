import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: 1,
    drawer: null,
    'My Dashboard': {
      showTimeExt: false,
      timeRange: {
        start: undefined,
        end: undefined,
      },
      timeline: undefined,
      layout: [],
      filters: {
        Region: {},
        Site: {},
        'Structure Type': {},
      },
    },
    Map: {
      filters: {
        Region: {},
        Site: {},
      },
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
    SET_DRAWER (state, p) {
      state.drawer = p
    },
    SET_NOTIFICATIONS (state, p) {
      state.notifications = p
    },
    SET_TIMERANGE (state, p) {
      state[p.name].timeRange = p.val
    },
    TOGGLE_TIMEEXT (state, p) {
      state[p.name].showTimeExt = p.val
    },
    SET_LAYOUT (state, p) {
      state[p.name].layout = p.val
    },
    SET_FILTERS (state, p) {
      if ('name' in p) {
        for (const key in p) {
          if (key !== 'name') {
            state[p.name][key] = p[key]
          }
        }
      }
    },
  },
  actions: {},
})
