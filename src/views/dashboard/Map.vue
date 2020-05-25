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

      <v-divider />

      <div
        ref="gMap"
        v-resize="resize"
        class="mt-4"
      />
    </fragment>
  </v-container>
</template>

<script>
  import { mapState } from 'vuex'
  import MapApi from '@/services/api/Map'
  // import colors from 'vuetify/lib/util/colors'
  // import styles from '@/services/map/style'
  import { Loader } from '@googlemaps/js-api-loader'
  import MarkerClusterer from '@google/markerclustererplus'

  export default {
    name: 'Map',
    data: () => ({
      loading: true,
      locations: [],
      roads: [],
    }),
    computed: {
      ...mapState(['user']),
      filters: {
        get () {
          return Object.assign({}, this.$store.state[this.$route.name].filters)
        },
        set (val) {
          const name = this.$route.name
          this.$store.commit('SET_FILTERS', { filters: val, name })
        },
      },
    },
    async mounted () {
      this.locations = await MapApi.allLocationsByUser(this.user)
        .then(json => json)
        .catch(err => err)
      // this.roads = await MapApi.allRoadsByUser(this.user)
      //   .then(json => json)
      //   .catch(err => err)
      const filters = Object.assign({}, this.filters)
      this.locations.forEach(e => {
        for (const f in filters) {
          if ((f in e) && !(e[f] in filters[f])) {
            filters[f][e[f]] = false
          }
        }
      })

      this.filters = filters
      this.loading = false
    },
    async updated () {
      console.log('updated')

      if (!window.google) {
        const loader = new Loader({
          apiKey: 'AIzaSyCSVxstLlVUrrzSNSbZbp-646V3w8TH6PM',
          libraries: ['places'],
        })
        await loader.load()
      }

      const google = window.google
      const bounds = new google.maps.LatLngBounds()

      const markers = this.locations.map((e, i) => {
        const pos = {
          lat: e.Position[1],
          lng: e.Position[0],
        }

        bounds.extend(pos)

        return new google.maps.Marker({
          position: pos,
        })
      })

      const map = new google.maps.Map(this.$refs.gMap, {
        center: bounds.getCenter(),
        zoom: 3,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        gestureHandling: 'cooperative',
        maxZoom: 20,
      })

      const cluster = new MarkerClusterer(
        map, markers, {
          imagePath: 'https://developers.google.com/maps' +
            '/documentation/javascript/examples/markerclusterer/m',
        })

      console.log(cluster.options)

      map.fitBounds(bounds)

      const imgBounds = {
        12: [[3734, 3735], [2440, 2440]],
        13: [[7468, 7470], [4880, 4881]],
        // 14: [[20969, 20970], [50657, 50658]],
        // 15: [[20969, 20970], [50657, 50658]],
        // 16: [[20969, 20970], [50657, 50658]],
        // 17: [[20969, 20970], [50657, 50658]],
        // 18: [[41939, 41940], [101315, 101317]],
        // 19: [[83878, 83881], [202631, 202634]],
        // 20: [[167757, 167763], [405263, 405269]],
      }
      var imageMapType = new this.google.maps.ImageMapType({
        getTileUrl: (coord, zoom) => {
          if (zoom < 17 || zoom > 20 ||
            imgBounds[zoom][0][0] > coord.x ||
            coord.x > imgBounds[zoom][0][1] ||
            imgBounds[zoom][1][0] > coord.y ||
            coord.y > imgBounds[zoom][1][1]) {
            return null
          }

          return ['//www.gstatic.com/io2010maps/tiles/5/L2_',
                  zoom, '_', coord.x, '_', coord.y, '.png'].join('')
        },
        tileSize: new this.google.maps.Size(256, 256),
      })

      this.map.overlayMapTypes.push(imageMapType)
    },
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
      resize () {
        const map = this.$refs.gMap
        const cont = map.parentNode.parentNode.parentNode
        const tbar = map.previousElementSibling.previousElementSibling
        const hei = cont.getBoundingClientRect().height -
          tbar.getBoundingClientRect().height - 42
        map.style.height = hei + 'px'
      },
      draw () {
        console.log('bounds changed')
      },
    },
  }
</script>
