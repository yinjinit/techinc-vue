<template>
  <grid-layout
    :layout.sync="layout"
    :is-draggable="true"
    :is-resizable="true"
    :is-mirrored="false"
    :vertical-compact="true"
    :margin="[10, 10]"
    :row-height="30"
    :use-css-transforms="true"
    @layout-updated="layoutUpdated"
  >
    <grid-item
      v-for="item in layout"
      :key="item.i"
      :x="item.x"
      :y="item.y"
      :w="item.w"
      :h="item.h"
      :i="item.i"
      :min-h="6"
      class="pt-9"
      drag-allow-from=".drag-handler"
    >
      <v-card
        class="pa-3"
        height="100%"
      >
        <component
          :is="`Visual${item.vis}`"
          :ref="widgets[item.category].Widgets[item.ind]
            .Selector.split('#')[1] +
            '-widget-' + widgets[item.category].Widgets[item.ind].WidgetId"
          :widget="widgets[item.category].Widgets[item.ind]"
          :filters="filters"
          :time-range="timeRange"
        />
        <div class="text-center py-0 mt-n9 col col-12">
          <v-tooltip bottom>
            <template v-slot:activator="{ attrs, on }">
              <v-icon
                v-bind="attrs"
                class="drag-handler"
                v-on="on"
              >
                mdi-drag
              </v-icon>
            </template>
            <span>Drag</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ attrs, on }">
              <v-btn
                v-bind="attrs"
                light
                icon
                v-on="on"
                @click="removeWidget(item.i)"
              >
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </template>
            <span>Remove</span>
          </v-tooltip>
        </div>
        <h4 class="subtitle-1 font-weight-light pt-2 pl-2">
          {{ widgets[item.category].Widgets[item.ind].Description }}
        </h4>
        <p class="body-2 font-weight-light pl-2 py-1 mb-0">
          {{ widgets[item.category].Widgets[item.ind].DescriptionLong }}
        </p>
      </v-card>
    </grid-item>
  </grid-layout>
</template>

<script>
  import VueGridLayout from 'vue-grid-layout'

  export default {
    name: 'GridManager',
    components: {
      GridLayout: VueGridLayout.GridLayout,
      GridItem: VueGridLayout.GridItem,
    },
    props: {
      manager: {
        type: Array,
        default: undefined,
      },
      widgets: {
        type: Object,
        default: undefined,
      },
      filters: {
        type: Object,
        default: undefined,
      },
      timeRange: {
        type: Object,
        default: undefined,
      },
    },
    data: () => ({
      loading: true,
    }),
    computed: {
      layout: {
        get () {
          return this.$store.state[this.$route.name].layout
        },
        set (val) {
          this.$store.commit('SET_LAYOUT', { name: this.$route.name, val })
        },
      },
    },

    mounted () {},
    updated () {},
    methods: {
      addWidget (wg) {
        this.layout.push(wg)

        this.$store.commit('SET_LAYOUT', {
          name: this.$route.name, val: this.layout,
        })
      },
      getLayout () {
        const ret = { len: this.layout.length }

        if (this.layout.length) {
          ret.last = this.layout[this.layout.length - 1]
        }
        return ret
      },
      removeWidget (i) {
        this.layout = this.layout.filter(l => {
          if (l.i === i) {
            this.widgets[l.category].Widgets[l.ind].Hidden = false
            return false
          } else {
            return true
          }
        })
      },
      layoutUpdated (ly) {
        const widget = this.widgets[ly[0].category].Widgets[ly[0].ind]
        const ref = widget.Selector.split('#')[1] +
          '-widget-' + widget.WidgetId
        setTimeout(() => {
          this.$refs[ref][0].resize()
        }, 400)
      },
    },
  }
</script>

<style lang="scss">
  .vue-grid-item {
    border: 0 !important;

    & > .v-card:hover {
      & > .v-sheet {
        transform: translateY(-40px);
        transition: .3s ease;
      }
    }

    .v-sheet.visual-wrapper {
      z-index: 1;
      position: relative;
    }

    p {
      color: #999;
      font-size: 0.875rem;
    }

    .v-progress-linear {
      width: 90%;
      max-width: 180px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
</style>
