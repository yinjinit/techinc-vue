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
      <v-toolbar
        flat
        tag="div"
      >
        <time-line-btn class="mr-1" />
        <base-dropdown
          v-for="(filter, key, i) in filters"
          :key="i"
          :items="filter"
          :disabled="!Object.keys(filter).length"
          :title="key"
          class-name="mr-1"
          @update:dropdown="updateDropdown(key, $event)"
        />
      </v-toolbar>
      <time-line-ext v-if="showTimeExt" />

      <v-toolbar
        flat
        tag="div"
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
        <v-btn
          small
          color="primary"
          @click.stop="drawer = !drawer"
        >
          <v-icon left>
            mdi-plus-thick
          </v-icon>
          <span>{{ $t('add widget') }}</span>
        </v-btn>
      </v-toolbar>

      <v-divider />

      <v-navigation-drawer
        v-model="drawer"
        fixed
        right
        temporary
        tag="nav"
      >
        <v-list
          dense
          nav
        >
          <v-list-group
            v-for="cate in widgets"
            :key="cate.Id"
          >
            <template v-slot:activator>
              <v-list-item-content>
                <v-list-item-title v-text="cate.Description.toUpperCase()" />
              </v-list-item-content>
            </template>
            <template v-for="(wg, i) in cate.Widgets">
              <v-list-item
                v-if="!wg.Hidden"
                :key="i"
                three-line
                :disabled="wg.Description !== 'Payload Summary'"
                @click="addWidget(cate.Id, i)"
              >
                <v-list-item-content>
                  <v-list-item-title>
                    {{ wg.Description }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ wg.DescriptionLong }}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </template>
          </v-list-group>
        </v-list>
      </v-navigation-drawer>

      <grid-manager
        ref="gridManager"
        :widgets="widgets"
        :time-range="timeRange"
        :filters="filters"
      />
    </fragment>
  </v-container>
</template>

<script>
  import { mapState } from 'vuex'
  import DatasetDashboardApi from '@/services/api/DatasetDashboard'

  export default {
    name: 'MyDashboard',
    components: {
      TimeLineBtn: () => import('@/components/filter/TimeLineBtn'),
      TimeLineExt: () => import('@/components/filter/TimeLineExt'),
      GridManager: () => import('@/components/layout/GridManager'),
    },
    data: () => ({
      loading: true,
      drawer: false,
      widgets: undefined,
    }),
    computed: {
      ...mapState(['user']),
      showTimeExt: {
        get () {
          return this.$store.state[this.$route.name].showTimeExt
        },
      },
      filters: {
        get () {
          return Object.assign(
            {}, this.$store.state[this.$route.name].filters)
        },
      },
      timeRange: {
        get () {
          return Object.assign(
            {}, this.$store.state[this.$route.name].timeRange)
        },
      },
    },
    created () {
      DatasetDashboardApi.getDashboardPage(this.user, 'my_dashboard')
        .then((json) => {
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
    updated () {},
    methods: {
      updateDropdown (key, sel) {
        for (const f in this.filters[key]) {
          if (sel.indexOf(f) >= 0) {
            this.$set(this.filters[key], f, true)
          } else {
            this.$set(this.filters[key], f, false)
          }
        }

        this.$store.commit('SET_FILTERS', {
          name: this.$route.name,
          filters: Object.assign({}, this.filters),
        })
      },
      addWidget (category, ind) {
        let x = 0
        let y = 0
        const { last, len } = this.$refs.gridManager.getLayout()

        if (len > 0) {
          x = last.x
          y = last.y + last.w

          if (y > 9) {
            x += last.h
            y = 0
          }
        }

        const i = len.toString()
        this.widgets[category].Widgets[ind].Hidden = true
        let vis = this.widgets[category].Widgets[ind].JSFile
        vis = vis.substr(0, vis.length - 3)

        this.$refs.gridManager.addWidget({
          x, y, w: 6, h: 8, category, ind, vis, i,
        })
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

    .v-progress-linear {
      width: 90%;
      max-width: 180px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
</style>
