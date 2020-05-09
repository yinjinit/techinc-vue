<template>
  <v-container
    id="dashboard"
    fluid
    tag="section"
  >
    <v-card
      outlined
      color="grey lighten-4"
    >
      <v-toolbar
        flat
        tag="div"
        color="rgba(0,0,0,0)"
      >
        <time-line-btn :time-range="timeRange" />
      </v-toolbar>
      <time-line-ext
        v-if="showTimeExt"
        :time-range="timeRange"
        @update:timeRange="updateTimeRange($event)"
      />
    </v-card>
  </v-container>
</template>

<script>
  import { mapState } from 'vuex'

  export default {
    name: 'MyDashboard',
    components: {
      TimeLineBtn: () => import('@/components/filter/TimeLineBtn'),
      TimeLineExt: () => import('@/components/filter/TimeLineExt'),
    },
    data: () => ({
    }),
    computed: {
      ...mapState(['timeRange', 'showTimeExt']),
    },
    methods: {
      updateTimeRange (val) {
        this.timeRange[val[0]] = val[1]
      },
    },
  }
</script>
