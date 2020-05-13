<template>
  <v-btn
    small
    v-bind="$attrs"
    @click="showTimeExt = !showTimeExt"
  >
    <v-icon left>
      mdi-calendar-month
    </v-icon>
    <span>{{ timeRangeTxt() }}</span>
    <v-icon right>
      mdi-menu-right
    </v-icon>
  </v-btn>
</template>

<script>
  export default {
    name: 'TimeLineBtn',
    props: {
      timeRange: {
        type: Object,
        default: () => ({
          start: undefined,
          end: undefined,
        }),
      },
    },
    computed: {
      showTimeExt: {
        get () {
          return this.$store.state.myDashboard.showTimeExt
        },
        set (val) {
          this.$store.commit('TOGGLE_TIMEEXT', val)
        },
      },
    },
    methods: {
      timeRangeTxt () {
        return this.timeRange.start.getFullYear() +
          '-' + ('0' + (this.timeRange.start.getMonth() + 1)).slice(-2) +
          '-' + ('0' + this.timeRange.start.getDate()).slice(-2) +
          ' ~ ' + this.timeRange.end.getFullYear() +
          '-' + ('0' + (this.timeRange.end.getMonth() + 1)).slice(-2) +
          '-' + ('0' + this.timeRange.end.getDate()).slice(-2)
      },
    },
  }
</script>
