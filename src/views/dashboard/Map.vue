<template>
  <fragment>
    <div
      ref="gMap"
      style="height: 100%;"
    />
    <v-dialog
      v-if="info"
      v-model="dialog"
      max-width="290"
    >
      <v-card>
        <v-card-title class="headline">
          {{ info.Location.split('_').join(' ') }}
        </v-card-title>

        <v-card-text>
          <v-simple-table dense>
            <template v-slot:default>
              <tbody>
                <tr>
                  <td>Id</td>
                  <td>{{ info.Id }}</td>
                </tr>
                <tr>
                  <td>Location</td>
                  <td>{{ info.Location }}</td>
                </tr>
                <tr>
                  <td>Location Type</td>
                  <td>{{ info.LocationType }}</td>
                </tr>
                <tr>
                  <td>Point Number</td>
                  <td>{{ info.PointNum }}</td>
                </tr>
                <tr>
                  <td>Elevation</td>
                  <td>{{ info.Elevation }}</td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            color="green darken-1"
            text
            @click="dialog = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </fragment>
</template>

<script>
  import { mapState } from 'vuex'
  import MapApi from '@/services/api/Map'
  import { Loader } from '@googlemaps/js-api-loader'
  import MarkerClusterer from '@google/markerclustererplus'

  export default {
    name: 'Map',
    data: () => ({
      dialog: false,
      info: undefined,
    }),
    computed: {
      ...mapState(['user']),
    },
    async mounted () {
      if (!window.google) {
        const loader = new Loader({
          apiKey: 'AIzaSyCSVxstLlVUrrzSNSbZbp-646V3w8TH6PM',
          libraries: ['places'],
        })
        await loader.load()
      }

      const google = window.google

      const map = new google.maps.Map(this.$refs.gMap, {
        center: { lat: -32.5887, lng: 148.2219 },
        zoom: 14,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        gestureHandling: 'cooperative',
        maxZoom: 20,
      })

      const locations = await MapApi.allLocationsByUser(this.user)

      const bounds = new google.maps.LatLngBounds()

      const markers = locations.map((e, i) => {
        const pos = {
          lat: e.Position[1],
          lng: e.Position[0],
        }

        bounds.extend(pos)

        const m = new google.maps.Marker({
          position: pos,
          icon: `//${location.host}/img/markers/${e.LocationType}.png`,
        })

        google.maps.event.addListener(m, 'click', () => {
          this.dialog = true
          this.info = e
        })

        return m
      })

      let imgBounds = new MarkerClusterer(
        map, markers, {
          imagePath: `//${location.host}/img/markers/m`,
          maxZoom: 19,
        })

      imgBounds = {
        12: [[3734], [2440, 2440]],
        13: [[7468, 7469], [4880, 4881]],
        14: [[14936, 14938], [9761, 9762]],
        15: [[29873, 29877], [19522, 19525]],
        16: [[59747, 59754], [39045, 39051]],
        17: [[119495, 119509], [78091, 78103]],
        18: [[238990, 239019], [156173, 156215]],
        19: [[477980, 478038], [312346, 312431]],
        20: [[955961, 956077], [624692, 624862]],
      }
      const imgMapType = new google.maps.ImageMapType({
        getTileUrl: (coord, zoom) => {
          if (zoom < 12 || zoom > 20 ||
            imgBounds[zoom][0][0] > coord.x ||
            coord.x > imgBounds[zoom][0][1] ||
            imgBounds[zoom][1][0] > coord.y ||
            coord.y > imgBounds[zoom][1][1]) {
            return null
          }

          return 'https://raw.githubusercontent.com/yinjinit/tomingley-tiles/' +
            `master/${zoom}/${coord.x}/${coord.y}.png`
        },
        tileSize: new google.maps.Size(256, 256),
      })
      map.overlayMapTypes.push(imgMapType)

      const roads = await MapApi.allRoadsByUser(this.user)

      const dirRend = new google.maps.DirectionsRenderer()
      const dirSrv = new google.maps.DirectionsService()
      dirRend.setMap(map)

      this.calcRoute(dirSrv, dirRend, roads[0])
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

      calcRoute (dirSrv, dirRend, road) {
        dirSrv.route({
          origin: { lat: road.PointA[1], lng: road.PointA[0] },
          destination: { lat: road.PointB[1], lng: road.PointB[0] },
          travelMode: window.google.maps.TravelMode.DRIVING,
          // waypoints: [
          //   {
          //     location: { lat: road.ControlA[1], lng: road.ControlA[0] },
          //     stopover: true,
          //   },
          //   {
          //     location: { lat: road.ControlB[1], lng: road.ControlB[0] },
          //     stopover: true,
          //   },
          // ],
        }, (response, status) => {
          if (status === 'OK') {
            dirRend.setDirections(response)
          } else {
            alert('Directions request failed due to ' + status)
          }
        })
      },
    },
  }
</script>
