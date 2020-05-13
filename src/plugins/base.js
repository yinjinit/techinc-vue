import Vue from 'vue'
import upperFirst from 'lodash/upperFirst'
import camelCase from 'lodash/camelCase'
import Fragment from 'vue-fragment'

const requireComponent = require.context(
  '@/components/base', true, /\.vue$/,
)

requireComponent.keys().forEach(fileName => {
  const componentConfig = requireComponent(fileName)

  const componentName = upperFirst(
    camelCase(fileName.replace(/^\.\//, '').replace(/\.\w+$/, '')),
  )

  Vue.component(`Base${componentName}`,
    componentConfig.default || componentConfig)
})

const requireVisuals = require.context(
  '@/components/visual', true, /\.vue$/,
)

requireVisuals.keys().forEach(fileName => {
  const componentConfig = requireVisuals(fileName)

  const componentName = upperFirst(
    camelCase(fileName.replace(/^\.\//, '').replace(/\.\w+$/, '')),
  )

  Vue.component(`Visual${componentName}`,
    componentConfig.default || componentConfig)
})

Vue.use(Fragment.Plugin)
