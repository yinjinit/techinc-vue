<template>
  <v-btn
    tile
    small
    v-bind="$attrs"
    @click="showTimeExt = !showTimeExt"
  >
    <v-icon left>
      mdi-calendar-month
    </v-icon>
    <span>{{ timeRange.startDate + ' ~ ' + timeRange.endDate }}</span>
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
          startDate: undefined,
          startTime: undefined,
          endDate: undefined,
          endTime: undefined,
        }),
      },
    },
    computed: {
      showTimeExt: {
        get () {
          return this.$store.state.showTimeExt
        },
        set (val) {
          this.$store.commit('SET_TIMEEXT', val)
        },
      },
    },
  }
</script>
