<template>
  <v-app-bar
    id="app-bar"
    app
    :clipped-left="$vuetify.breakpoint.lgAndUp"
    dark
    height="60"
  >
    <v-app-bar-nav-icon
      v-if="$vuetify.breakpoint.mdAndDown"
      @click="setDrawer(!drawer)"
    />

    <v-breadcrumbs :items="crumbs">
      <template v-slot:divider>
        <v-icon>mdi-chevron-right</v-icon>
      </template>
      <template v-slot:item="{ item }">
        <v-breadcrumbs-item
          :href="item.href"
          :disabled="item.disabled"
        >
          {{ item.text.toUpperCase() }}
        </v-breadcrumbs-item>
      </template>
    </v-breadcrumbs>

    <v-spacer />

    <v-btn
      class="ml-2"
      min-width="0"
      text
    >
      <v-icon>mdi-message-alert</v-icon>
    </v-btn>

    <v-menu
      bottom
      left
      offset-y
      origin="top right"
      transition="scale-transition"
    >
      <template v-slot:activator="{ attrs, on }">
        <v-btn
          class="ml-2"
          min-width="0"
          text
          v-bind="attrs"
          v-on="on"
        >
          <v-badge
            color="red"
            overlap
            bordered
          >
            <template v-slot:badge>
              <span>5</span>
            </template>

            <v-icon>mdi-bell</v-icon>
          </v-badge>
        </v-btn>
      </template>

      <v-list
        :tile="false"
        nav
      >
        <div>
          <app-bar-item
            v-for="(n, i) in notifications"
            :key="`item-${i}`"
          >
            <v-list-item-title v-text="n" />
          </app-bar-item>
        </div>
      </v-list>
    </v-menu>

    <v-btn
      class="ml-2"
      min-width="0"
      text
      to="/pages/user"
    >
      <v-icon>mdi-account</v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script>
  // Components
  import { VHover, VListItem } from 'vuetify/lib'

  // Utilities
  import { mapState, mapMutations } from 'vuex'

  export default {
    name: 'DashboardCoreAppBar',

    components: {
      AppBarItem: {
        render (h) {
          return h(VHover, {
            scopedSlots: {
              default: ({ hover }) => {
                return h(VListItem, {
                  attrs: this.$attrs,
                  class: {
                    'black--text': !hover,
                    'white--text secondary elevation-12': hover,
                  },
                  props: {
                    activeClass: '',
                    dark: hover,
                    link: true,
                    ...this.$attrs,
                  },
                }, this.$slots.default)
              },
            },
          })
        },
      },
    },
    props: {
      value: {
        type: Boolean,
        default: false,
      },
    },
    data: () => ({
      notifications: [
        'Mike John Responded to your email',
        'You have 5 new tasks',
        'You\'re now friends with Andrew',
        'Another Notification',
        'Another one',
      ],
    }),
    computed: {
      ...mapState(['drawer']),
      crumbs () {
        const breadcrumbs = this.$route.path.split('/')
          .filter(p => p !== '')
          .reduce((breadcrumbArray, path, idx) => {
            breadcrumbArray.push({
              href: breadcrumbArray[idx - 1]
                ? '/' + breadcrumbArray[idx - 1].href + '/' + path
                : '/' + path,
              text: this.$route.matched[idx].meta.breadCrumb || path,
            })
            return breadcrumbArray
          }, [{
            href: '/',
            text: this.$t('author'),
          }])
        breadcrumbs[breadcrumbs.length - 1].disabled = true
        return breadcrumbs
      },
    },
    methods: {
      ...mapMutations({
        setDrawer: 'SET_DRAWER',
      }),
    },
  }
</script>
