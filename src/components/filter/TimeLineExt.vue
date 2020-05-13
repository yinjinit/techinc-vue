<template>
  <v-sheet
    v-resize="onResize"
    color="rgba(0,0,0,0)"
  >
    <div :id="id" />

    <v-toolbar
      flat
      tag="div"
      color="rgba(0,0,0,0)"
    >
      <date-time-picker
        :datetime="timeRange.start"
        :max="timeRange.end"
        class="mr-1"
        @update:datetime="updateTimeRange('start', $event)"
      />
      <date-time-picker
        :datetime="timeRange.end"
        :min="timeRange.start"
        @update:datetime="updateTimeRange('end', $event)"
      />
    </v-toolbar>
  </v-sheet>
</template>

<script>
  import * as d3 from 'd3'

  export default {
    name: 'TimeLineExt',
    components: {
      DateTimePicker: () => import('@/components/base/DateTimePicker'),
    },
    props: {
      timeRange: {
        type: Object,
        default: () => ({
          start: undefined,
          end: undefined,
        }),
      },
    },
    data: () => ({
      id: 'timeline-filter',
    }),
    mounted () {
      this.drawTimeline()
    },
    updated () {
      this.drawTimeline()
    },
    methods: {
      updateTimeRange (el, val) {
        this.$emit('update:timeRange', [el, val])
      },
      onResize () {
        const wid = document.querySelector('#' + this.id)
          .getBoundingClientRect().width
        d3.select('svg.' + this.id)
          .attr('width', wid)
          .attr('height', wid * 0.15)
      },
      drawTimeline () {
        const id = '#' + this.id

        const margin = { top: 16, left: 16, right: 16, bottom: 20 }
        const width = document.querySelector(id)
          .getBoundingClientRect().width
        const height = width * 0.15
        const dateS = this.timeRange.start
        const dateE = this.timeRange.end

        d3.select(id).selectAll('*').remove()

        const svg = d3.select(id)
          .append('svg')
          .attr('class', 'timeline-filter')
          .attr('width', width)
          .attr('height', height)
          .attr('viewBox', [0, 0, width, height])

        const scale = d3.scaleUtc()
          .domain([dateS, dateE])
          .range([margin.left, width - margin.right])
        const axis = d3.axisBottom()
          .scale(scale)
          .ticks((dateE - dateS) / 1000 / 60 / 60 / 24, '%Y-%m-%d')

        const brush = d3.brushX()
          .extent([
            [margin.left, margin.top],
            [width - margin.right, height - margin.bottom]])
          .on('start brush end', function () {
            const selection = d3.event.selection

            if (selection === null) return

            d3.select(this).call(
              (g, s) => g.selectAll('.handle--custom')
                .data([{ type: 'w' }, { type: 'e' }])
                .join(enter => enter.append('path')
                  .attr('class', 'handle--custom')
                  .attr('fill', '#eee')
                  .attr('stroke', '#666')
                  .attr('cursor', 'ew-resize')
                  .attr('d', (d) => {
                    var e = +(d.type === 'e')
                    var x = e ? 1 : -1
                    var y = 30
                    return (
                      'M' + 0.5 * x + ',' + y + 'A6,6 0 0 ' + e + ' ' +
                      6.5 * x + ',' + (y + 6) + 'V' + (2 * y - 6) +
                      'A6,6 0 0 ' + e + ' ' + 0.5 * x + ',' + 2 * y + 'ZM' +
                      2.5 * x + ',' + (y + 8) + 'V' + (2 * y - 8) + 'M' +
                      4.5 * x + ',' + (y + 8) + 'V' + (2 * y - 8)
                    )
                  }),
                )
                .attr('display', s === null ? 'none' : null)
                .attr('transform', s === null ? null : (d, i) =>
                  `translate(${s[i]}, 
                  ${height / 2 - 15 - margin.top - margin.bottom})`),
              selection)
          })

        svg.append('g')
          .call(axis)
          .attr('transform', `translate(0, ${height - margin.bottom})`)

        svg.append('g')
          .call(brush)
          .on('dblclick', function () {
            const selection = d3.brushSelection(this) ? null : scale.range()
            d3.select(this).call(brush.move, selection)
          })
      },
    },
  }
</script>
