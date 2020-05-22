import Vue from 'vue'
import vuetify from './plugins/vuetify'
import router from './router'
import store from './store'
import App from './App.vue'
import i18n from './i18n'
import axios from 'axios'
import './plugins/base'
import './services/mock'
import * as VueGoogleMaps from 'vue2-google-maps'

Vue.config.productionTip = false

Vue.use(VueGoogleMaps, {
  load: {
    key: 'AIzaSyCSVxstLlVUrrzSNSbZbp-646V3w8TH6PM',
    libraries: 'places,drawing,visualization',
    installComponents: true,
  },
})

new Vue({
  vuetify,
  router,
  store,
  i18n,
  axios,
  render: h => h(App),
}).$mount('#app')
