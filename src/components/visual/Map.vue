<template>
  <v-sheet
    :id="el"
    v-resize="resize"
    class="pa-3 my-n9"
    elevation="6"
    color="blue"
    style="z-index: 1;position: relative;"
    v-bind="$attrs"
  >
    <v-progress-linear
      color="white accent-4"
      height="6"
      rounded
      indeterminate
      absolute
      :active="loading"
    />

    <gmap-map
      :center="center"
      :zoom="12"
      style="width:100%;  height: 100%;"
    >
      <gmap-marker
        v-for="(m, index) in markers"
        :key="index"
        :position="m.position"
        @click="center=m.position"
      />
    </gmap-map>
  </v-sheet>
</template>

<script>
  // import * as d3 from 'd3'
  import { mapState } from 'vuex'
  import MapApi from '@/services/api/Map'
  import CycleApi from '@/services/api/CycleTable'
  // import colors from 'vuetify/lib/util/colors'
  import crossfilter from 'crossfilter2'

  export default {
    name: 'Map',
    props: {
      widget: {
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
      error: false,
      cycle: [],
      locations: [],
      roads: [],
      center: { lat: 45.508, lng: -73.587 },
      markers: [],
      places: [],
      currentPlace: null,
    }),
    computed: {
      ...mapState(['user']),
      el () {
        return this.widget.Selector.split('#')[1] +
          '-widget-' + this.widget.WidgetId
      },
    },
    async mounted () {
      this.cycle = await CycleApi.allByUserDateTimeRange(this.user)
        .then(json => json)
        .catch(err => err)
      this.locations = await MapApi.allLocationsByUser(this.user)
        .then(json => json)
        .catch(err => err)
      this.roads = await MapApi.allRoadsByUser(this.user)
        .then(json => json)
        .catch(err => err)

      const name = this.$route.name
      const timeRange = Object.assign({}, this.timeRange)
      const filters = Object.assign({}, this.filters)
      const dateTimes = []
      const rangeUndefined = !timeRange.start
      let timeline

      this.cycle.forEach(e => {
        for (const f in filters) {
          if ((f in e) && !(e[f] in filters[f])) {
            filters[f][e[f]] = false
          }
        }

        const d = new Date(e.DateTime)
        dateTimes.push({ dateTime: d })

        if (rangeUndefined) {
          if (d < timeRange.start || !timeRange.start) {
            timeRange.start = d
          }
          if (d > timeRange.end || !timeRange.end) {
            timeRange.end = d
          }
        }
      })

      if (this.$store.state[name].timeline === undefined) {
        timeline = crossfilter(dateTimes)
      } else {
        timeline = this.$store.state[name].timeline
        timeline.add(dateTimes)
      }

      this.$store.commit('SET_FILTERS', {
        filters, timeline, timeRange, name,
      })

      this.loading = false
      this.draw()
    },
    updated () {
      if (!this.cycle.length || !this.locations.length || !this.roads.length) {

      }
    },
    methods: {
      draw () {
        const marker = {
          lat: this.currentPlace.geometry.location.lat(),
          lng: this.currentPlace.geometry.location.lng(),
        }
        this.markers.push({ position: marker })
        this.places.push(this.currentPlace)
        this.center = marker
        this.currentPlace = null
      },
      resize () {
        const visual = document.querySelector('#' + this.el)
        const parent = visual.parentNode.parentNode
        const hei = parent.getBoundingClientRect().height - 36 -
          parent.querySelector('.subtitle-1').getBoundingClientRect().height -
          parent.querySelector('.body-2').getBoundingClientRect().height
        visual.style.height = hei + 'px'
      },
      update () {
      },
    },
  }
</script>
