<template>
  <v-btn
    small
    v-bind="$attrs"
    :disabled="!timeRange.start"
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
    data: () => ({
    }),
    computed: {
      timeRange: {
        get () {
          return this.$store.state[this.$route.name].timeRange
        },
      },
      showTimeExt: {
        get () {
          return this.$store.state[this.$route.name].showTimeExt
        },
        set (val) {
          const name = this.$route.name
          this.$store.commit('TOGGLE_TIMEEXT', { name, val })
        },
      },
    },
    methods: {
      timeRangeTxt () {
        if (this.timeRange.start) {
          return this.timeRange.start.getFullYear() +
            '-' + ('0' + (this.timeRange.start.getMonth() + 1)).slice(-2) +
            '-' + ('0' + this.timeRange.start.getDate()).slice(-2) +
            ' ~ ' + this.timeRange.end.getFullYear() +
            '-' + ('0' + (this.timeRange.end.getMonth() + 1)).slice(-2) +
            '-' + ('0' + this.timeRange.end.getDate()).slice(-2)
        }

        return 'All'
      },
    },
  }
</script>
