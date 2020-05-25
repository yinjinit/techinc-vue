import Vue from 'vue'
import vuetify from './plugins/vuetify'
import router from './router'
import store from './store'
import App from './App.vue'
import i18n from './i18n'
import './plugins/base'
import './services/mock'

Vue.config.productionTip = false

new Vue({
  vuetify,
  router,
  store,
  i18n,
  render: h => h(App),
}).$mount('#app')
