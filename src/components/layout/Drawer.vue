<template>
  <v-navigation-drawer
    id="nav-drawer"
    v-model="drawer"
    :mini-variant="$vuetify.breakpoint.lgAndUp && miniVariant"
    :dark="$vuetify.breakpoint.lgAndUp"
    :src="$vuetify.breakpoint.lgAndUp ? require('@/assets/nav-drawer.jpg') : ''"
    :clipped="$vuetify.breakpoint.lgAndUp"
    app
    v-bind="$attrs"
  >
    <template
      v-if="$vuetify.breakpoint.lgAndUp"
      v-slot:img="props"
    >
      <v-img
        :gradient="`to bottom, rgba(0, 0, 0, .8), rgba(0, 0, 0, .8)`"
        v-bind="props"
      />
    </template>
    <v-list
      nav
      dense
      expand
    >
      <v-list-item v-if="$vuetify.breakpoint.lgAndUp">
        <v-list-item-action>
          <v-icon @click.stop="miniVariant = !miniVariant">
            mdi-menu
          </v-icon>
        </v-list-item-action>
      </v-list-item>

      <template v-for="(item, i) in computedItems">
        <base-item-group
          v-if="item.children"
          :key="`group-${i}`"
          :item="item"
        />

        <base-item
          v-else
          :key="`item-${i}`"
          :item="item"
        />
      </template>
    </v-list>

    <template v-slot:append>
      <base-item
        :item="{
          title: $t('author'),
          icon: 'mdi-package-up',
          to: '/',
        }"
      />
    </template>
  </v-navigation-drawer>
</template>

<script>
  export default {
    name: 'DashboardCoreNavDrawer',
    props: {
      source: String,
    },

    data: () => ({
      items: [
        {
          title: 'dashboard',
          icon: 'mdi-view-dashboard-outline',
          group: '',
          children: [
            { title: 'my dashboard', icon: 'mdi-chart-bar', to: 'dashboard' },
            {
              title: 'live dashboard',
              icon: 'mdi-antenna',
              to: 'dashboard/live',
            },
            {
              title: 'Map',
              icon: 'mdi-map',
              to: 'dashboard/map',
            },
          ],
        },
        {
          title: 'time',
          icon: 'mdi-clock-outline',
          group: '',
          children: [
            {
              title: 'reconciliation',
              icon: 'mdi-scale-balance',
              to: 'time/reconciliation',
            },
            {
              title: 'downtime stopwatch',
              icon: 'mdi-alarm',
              to: 'time/downtime',
            },
          ],
        },
        {
          title: 'maintenance',
          icon: 'mdi-wrench-outline',
          group: '',
          children: [
            {
              title: 'work request',
              icon: 'mdi-water',
              to: 'maintenance/work-request',
            },
          ],
        },
        {
          title: 'settings',
          icon: 'mdi-cog-outline',
          group: '',
          children: [
            {
              title: 'users',
              icon: 'mdi-account-multiple',
              to: 'settings/users',
            },
            { title: 'asset', icon: 'mdi-factory', to: 'settings/asset' },
            {
              title: 'structure',
              icon: 'mdi-file-tree',
              to: 'settings/structure',
            },
          ],
        },
      ],
      miniVariant: false,
    }),
    computed: {
      computedItems () {
        return this.items.map(this.mapItem)
      },
      drawer: {
        get () {
          return this.$store.state.drawer
        },
        set (val) {
          this.$store.commit('SET_DRAWER', val)
        },
      },
    },
    methods: {
      mapItem (item) {
        return {
          ...item,
          children: item.children ? item.children.map(this.mapItem) : undefined,
          title: this.$t(item.title),
        }
      },
    },
  }
</script>

<style lang="scss">
#nav-drawer {
  .v-list-item__action {
    .v-icon:hover:after {
      opacity: 0.24;
    }
  }

  .v-list-group__header.v-list-item--active:before {
    opacity: 0.24;
  }

  .v-list-group__items {
    background-color: rgba(150, 150, 150, 0.2);
    border-radius: $border-radius-root;
    margin-bottom: 4px;
  }
}
</style>
