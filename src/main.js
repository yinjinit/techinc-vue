import Vue from 'vue'
import vuetify from './plugins/vuetify'
import router from './router'
import store from './store'
import App from './App.vue'
import i18n from './i18n'
import axios from 'axios'
import './plugins/base'
import './services/mock'
import resize from 'vue-element-resize-detector'

Vue.config.productionTip = false

new Vue({
  vuetify,
  router,
  store,
  i18n,
  axios,
  resize,
  render: h => h(App),
}).$mount('#app')
