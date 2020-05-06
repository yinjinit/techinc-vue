import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import i18n from '@/i18n'

Vue.use(Vuetify)

const theme = {
  primary: '#fbaf3f',
  secondary: '#898D90',
  accent: '#898D90',
  info: '#00CAE3',
}

export default new Vuetify({
  lang: {
    t: (key, ...params) => i18n.t(key, params),
  },
  theme: {
    themes: {
      light: theme,
      dark: theme,
    },
  },
})
