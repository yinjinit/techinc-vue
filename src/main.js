import Vue from 'vue'
import vuetify from './plugins/vuetify'
import router from './router'
import store from './store'
import App from './App.vue'
import i18n from './i18n'
import './plugins/base'
import './plugins/vee-validate'
import * as d3 from 'd3'

Vue.config.productionTip = false

new Vue({
  vuetify,
  router,
  store,
  i18n,
  d3,
  render: h => h(App),
}).$mount('#app')
