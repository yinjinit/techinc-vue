<template>
  <v-container
    id="dashboard"
    fluid
  >
    <v-skeleton-loader
      v-if="loading"
      type="card, article, article"
    />

    <fragment v-else>
      <v-card
        outlined
        color="grey lighten-2"
      >
        <v-toolbar
          flat
          tag="div"
          color="rgba(0,0,0,0)"
        >
          <time-line-btn
            :time-range="timeRange"
            class="mr-1"
          />
          <base-dropdown
            :items="['item1', 'item2', 'item3']"
            title="Region"
            class-name="mr-1"
          />
          <base-dropdown
            :items="['item1', 'item2', 'item3']"
            title="Site"
            class-name="mr-1"
          />
          <base-dropdown
            :items="['item1', 'item2', 'item3']"
            title="Structure Type"
          />
        </v-toolbar>
        <time-line-ext
          v-if="showTimeExt"
          :time-range="timeRange"
          @update:timeRange="updateTimeRange($event)"
        />
      </v-card>

      <v-toolbar
        color="rgba(0,0,0,0)"
        flat
      >
        <v-toolbar-title>{{ $route.name }}</v-toolbar-title>

        <v-spacer />

        <v-btn
          small
          color="primary"
          class="mr-1"
        >
          <v-icon left>
            mdi-file-export
          </v-icon>
          <span>{{ $t('export to csv') }}</span>
        </v-btn>
        <btn-add-widget
          :widgets-grouped="widgets"
          @add:widget="addWidget($event)"
        />
      </v-toolbar>

      <v-divider />

      <grid-layout
        :layout.sync="layout"
        :col-num="12"
        :row-height="30"
        :is-draggable="true"
        :is-resizable="true"
        :is-mirrored="false"
        :vertical-compact="true"
        :margin="[10, 10]"
        :use-css-transforms="true"
      >
        <grid-item
          v-for="item in layout"
          :key="item.i"
          :x="item.x"
          :y="item.y"
          :w="item.w"
          :h="item.h"
          :i="item.i"
          drag-allow-from=".grid-item--title"
          drag-ignore-from=".grid-item--title + *"
          @resized="resizedEvent"
        >
          <div class="grid-item--title">
            {{ widgets[item.category].Widgets[item.ind].Description }}
            <v-icon
              small
              @click="removeWidget(item.i)"
            >
              mdi-close
            </v-icon>
          </div>
          <component
            :is="`Visual${item.vis}`"
            :widget="widgets[item.category].Widgets[item.ind]"
          />
        </grid-item>
      </grid-layout>
    </fragment>
  </v-container>
</template>

<script>
  import { mapState } from 'vuex'
  import DatasetDashboardApi from '@/services/api/DatasetDashboard'
  import VueGridLayout from 'vue-grid-layout'

  export default {
    name: 'MyDashboard',
    components: {
      TimeLineBtn: () => import('@/components/filter/TimeLineBtn'),
      TimeLineExt: () => import('@/components/filter/TimeLineExt'),
      BtnAddWidget: () => import('@/components/btn/BtnAddWidget'),
      GridLayout: VueGridLayout.GridLayout,
      GridItem: VueGridLayout.GridItem,
    },
    data: () => ({
      loading: true,
      widgets: undefined,
    }),
    computed: {
      ...mapState(['user']),
      timeRange: {
        get () {
          return this.$store.state.myDashboard.timeRange
        },
        set (val) {
          this.$store.commit('SET_TIMERANGE', val)
        },
      },
      showTimeExt: {
        get () {
          return this.$store.state.myDashboard.showTimeExt
        },
        set (val) {
          this.$store.commit('TOGGLE_TIMEEXT', val)
        },
      },
      layout: {
        get () {
          return this.$store.state.myDashboard.layout
        },
        set (val) {
          this.$store.commit('SET_LAYOUT', val)
        },
      },
    },
    created () {
      this.loading = true
      DatasetDashboardApi.getDashboardPage(this.user, 'my_dashboard')
        .then((json) => {
          if (this.timeRange.end === undefined) {
            this.timeRange.end = new Date()
          }

          if (this.timeRange.start === undefined) {
            this.timeRange.start = new Date(
              this.timeRange.end.getTime() -
                json.View.DefaultPeriod * 24 * 60 * 60 * 1000,
            )
          }

          this.widgets = {}

          json.View.Widgets.forEach(wg => {
            let key = 'other'

            if (wg.Category) {
              key = wg.Category.Id
            }

            if (!(key in this.widgets)) {
              this.widgets[key] = wg.Category ? wg.Category : {
                Description: 'Other',
              }
              this.widgets[key].Widgets = []
            }

            this.widgets[key].Widgets.push({ ...wg.Configuration })
          })

          this.loading = false
        })
        .catch((err) => console.log(err))
    },
    methods: {
      updateTimeRange (val) {
        this.timeRange[val[0]] = val[1]
      },
      addWidget (val) {
        let x = 0
        let y = 0

        if (this.layout.length > 0) {
          x = this.layout[this.layout.length - 1].x
          y = this.layout[this.layout.length - 1].y + 1

          if (y > 9) {
            x++
            y = 0
          }
        }

        const ind = this.layout.length
        this.widgets[val[0]].Widgets[val[1]].Hidden = true
        let vis = this.widgets[val[0]].Widgets[val[1]].JSFile
        vis = vis.substr(0, vis.length - 3)

        this.layout.push({
          x,
          y,
          w: 4,
          h: 5,
          category: val[0],
          ind: val[1],
          vis: vis,
          i: ind.toString(),
        })
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
      resizedEvent () {
        this.$forceUpdate()
      },
    },
  }
</script>

<style lang="scss">
  .vue-grid-item {
    &:not(.vue-grid-placeholder) {
      border: 1px solid lightgray
    }

    .grid-item--title {
      background: rgba(135, 135, 135, 0.11);
      line-height: normal;
      text-align: center;
      font-size: 12px;
      padding: 5px 0;

      .v-icon {
        position: absolute;
        right: 5px;
        top: 4px;
      }
    }
  }
</style>
