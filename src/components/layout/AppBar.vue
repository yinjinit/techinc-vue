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

    <v-toolbar-title>
      <span class="hidden-sm-and-down">{{ this.$t('author') }}</span>
    </v-toolbar-title>

    <v-spacer />

    <v-menu
      v-model="openFeedback"
      bottom
      left
      offset-y
      origin="top right"
      transition="scale-transition"
      :close-on-content-click="false"
    >
      <template v-slot:activator="{ on }">
        <v-btn
          fab
          x-small
          v-on="on"
        >
          <v-icon>mdi-message-alert</v-icon>
        </v-btn>
      </template>

      <v-card>
        <v-card-title class="grey lighten-4 font-weight-bold">
          {{ $t('feedback') }}
        </v-card-title>

        <v-divider />

        <v-card-text>
          <v-form
            ref="form"
            v-model="valid"
          >
            <v-text-field
              v-model="subject"
              :rules="subjectRules"
              :label="$t('subject')"
              :placeholder="$t('write your subject')"
              required
            />

            <v-text-field
              v-model="msg"
              :rules="msgRules"
              :label="$t('message')"
              :placeholder="$t('write your message')"
              required
            />

            <v-checkbox
              v-model="snapshot"
              :label="$t('include a snapshot of the current page')"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />

          <v-btn
            text
            @click="reset"
          >
            {{ $t('cancel') }}
          </v-btn>
          <v-btn
            color="primary"
            text
            @click="submit"
          >
            {{ $t('submit') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>
    <v-menu
      bottom
      left
      offset-y
      origin="top right"
      transition="scale-transition"
    >
      <template v-slot:activator="{ attrs, on }">
        <v-btn
          fab
          x-small
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

      <v-list dense>
        <v-subheader class="v-subheader grey lighten-4 font-weight-bold">
          {{ $t('notifications') }}
        </v-subheader>

        <v-divider />

        <v-list-item-group color="primary">
          <app-bar-item
            v-for="(n, i) in notifications"
            :key="`item-${i}`"
          >
            <v-list-item-title v-text="n" />
          </app-bar-item>
        </v-list-item-group>
      </v-list>
    </v-menu>
    <v-menu
      bottom
      left
      offset-y
      origin="top right"
      transition="scale-transition"
    >
      <template v-slot:activator="{ attrs, on }">
        <v-btn
          text
          small
          v-bind="attrs"
          v-on="on"
        >
          <v-icon>mdi-account</v-icon>
          <span>John Leider: No Country</span>
        </v-btn>
      </template>
      <v-list
        dense
      >
        <v-subheader class="v-subheader grey lighten-4 font-weight-bold">
          {{ $t('user settings') }}
        </v-subheader>

        <v-divider />

        <app-bar-item>
          <v-icon style="margin-right: 10px;">
            mdi-account
          </v-icon>
          <v-list-item-title v-text="$t('my profile')" />
        </app-bar-item>
        <app-bar-item>
          <v-icon style="margin-right: 10px;">
            mdi-logout
          </v-icon>
          <v-list-item-title v-text="$t('logout')" />
        </app-bar-item>
      </v-list>
    </v-menu>
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
      valid: true,
      subject: '',
      subjectRules: [
        v => !!v || 'Subject is required',
      ],
      msg: '',
      msgRules: [
        v => !!v || 'Subject is required',
      ],
      snapshot: false,
      openFeedback: false,
    }),
    computed: {
      ...mapState(['drawer', 'notifications']),
    },
    methods: {
      ...mapMutations({
        setDrawer: 'SET_DRAWER',
      }),
      reset () {
        this.openFeedback = false
        this.$refs.form.reset()
      },
      submit () {
        this.openFeedback = false
        this.$refs.form.reset()
      },
    },
  }
</script>

<style lang="scss">
  .v-menu__content {
    .v-card__title {
      line-height: 1.5;
      padding: 0 16px;
      font-size: 0.75rem;
      height: 40px;
      color: rgba(0, 0, 0, 0.6);
    }

    .v-subheader {
      padding: 0 16px;
    }
  }
</style>
