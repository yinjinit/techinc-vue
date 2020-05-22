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

      <gmap-map
        ref="mapRef"
        v-resize="resize"
        :center="{lat: 0, lng: 0}"
        :zoom="7"
        map-type-id="terrain"
      >
        <gmap-marker
          v-for="(m, i) in locations.filter((e,i)=>i<10)"
          :key="i"
          :position="{lat: m.Position[1], lng: m.Position[0]}"
          :clickable="true"
          :draggable="true"
          @click="center={lat: m.Position[1], lng: m.Position[0]}"
        />
      </gmap-map>
    </fragment>
  </v-container>
</template>

<script>
  import { mapState } from 'vuex'
  import MapApi from '@/services/api/Map'
  import { gmapApi } from 'vue2-google-maps'
  // import colors from 'vuetify/lib/util/colors'

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
      google: gmapApi,
    },
    async mounted () {
      this.locations = await MapApi.allLocationsByUser(this.user)
        .then(json => json)
        .catch(err => err)
      this.roads = await MapApi.allRoadsByUser(this.user)
        .then(json => json)
        .catch(err => err)
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
    updated () {
      console.log('updated')

      const bounds = new this.google.maps.LatLngBounds()
      console.log(bounds)
      this.locations.forEach(e => {
        bounds.extend({ lat: e.Position[1], lng: e.Position[0] })
      })

      this.$refs.mapRef.fitBounds(bounds)
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
        console.log('resize')
        const map = document.querySelector('.vue-map-container')
        const cont = document.querySelector('main.v-content > .v-content__wrap')
        const tbar = cont.querySelector('.v-toolbar')
        const hei = cont.getBoundingClientRect().height -
          tbar.getBoundingClientRect().height - 26
        map.style.height = hei + 'px'
      },
    },
  }
</script>
