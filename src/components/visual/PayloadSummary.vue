<template>
  <v-sheet
    :id="el"
    v-resize="resize"
    color="#E91E63"
    class="pa-3 my-n9"
    elevation="6"
    dark
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
    <v-snackbar
      v-model="error"
      right
      top
      :timeout="0"
      color="error"
      multi-line
    >
      {{ 'Something went wrong. Please check your console' }}
      <v-btn
        dark
        text
        @click="error = false"
      >
        Close
      </v-btn>
    </v-snackbar>
  </v-sheet>
</template>

<script>
  import * as d3 from 'd3'
  import { mapState } from 'vuex'
  import CycleTableApi from '@/services/api/CycleTable'
  import colors from 'vuetify/lib/util/colors'
  import crossfilter from 'crossfilter2'

  export default {
    name: 'PayloadSummary',
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
      config: {
        min: 0.0,
        max: 0.0,
        targetValue: 0.0,
      },
      data: [],
    }),
    computed: {
      ...mapState(['user']),
      el () {
        return this.widget.Selector.split('#')[1] +
          '-widget-' + this.widget.WidgetId
      },
    },
    async mounted () {
      if (!this.data.length) {
        const json = await CycleTableApi.allByUserDateTimeRange(this.user)
        const name = this.$route.name
        const timeRange = Object.assign({}, this.timeRange)
        const filters = Object.assign({}, this.filters)
        const dateTimes = []
        const rangeUndefined = !timeRange.start
        let timeline

        json.forEach(e => {
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

        this.data = json

        this.$store.commit('SET_FILTERS', {
          filters, timeline, timeRange, name,
        })

        this.loading = false
      }
    },
    updated () {
      if (document.querySelector(`#${this.el} svg`)) {
        this.update()
      } else {
        this.draw()
      }
    },
    methods: {
      configure () {
        const filters = {}
        for (const f in this.filters) {
          for (const k in this.filters[f]) {
            if (this.filters[f][k]) {
              if (!(f in filters)) {
                filters[f] = []
              }
              filters[f].push(k)
            }
          }
        }

        const cycleData = this.data.filter(e => {
          for (const f in filters) {
            if (!(f in e) || filters[f].indexOf(e[f]) === -1) {
              return false
            }
          }

          const d = new Date(e.DateTime)
          if (d < this.timeRange.start || d > this.timeRange.end) {
            return false
          }

          return true
        })

        const plCnt = cycleData.length

        if (!plCnt) return

        const totalTargetPayload = d3.sum(cycleData, d =>
          d['Target Payload'] ? d['Target Payload'] : 0,
        )
        const targetPayloadCount = d3.sum(cycleData, d =>
          d['Target Payload'] ? 1 : 0,
        )
        const targetPayload = totalTargetPayload / targetPayloadCount
        this.config.min = Math.round(targetPayload * 0.8)
        this.config.max = Math.round(targetPayload * 1.3)
        this.config.range = this.config.max - this.config.min
        this.config.targetValue = Math.round(targetPayload)

        const zones = [
          {
            from: this.config.min,
            to: Math.round(targetPayload * 0.9),
            color: colors.red.base,
            title: 'Underloads -10%',
          },
          {
            from: Math.round(targetPayload * 0.9),
            to: Math.round(targetPayload * 1.1),
            color: colors.green.base,
            title: 'Loads in Range',
          },
          {
            from: Math.round(targetPayload * 1.1),
            to: Math.round(targetPayload * 1.2),
            color: colors.orange.base,
            title: 'Overloads +10%',
          },
          {
            from: Math.round(targetPayload * 1.2),
            to: this.config.max,
            color: colors.blue.base,
            title: 'Unsafe Loads +20%',
          },
        ]

        const statData = [
          d3.sum(cycleData, d =>
            d.Tonnes < 0.9 * d['Target Payload'] && d.Tonnes > 0
              ? 1 : 0) / plCnt,
          d3.sum(cycleData, d =>
            (d.Tonnes >= 0.9 * d['Target Payload']) &&
            (d.Tonnes < 1.1 * d['Target Payload']) ? 1 : 0) / plCnt,
          d3.sum(cycleData, d =>
            (d.Tonnes >= 1.1 * d['Target Payload']) &&
            (d.Tonnes < 1.2 * d['Target Payload']) ? 1 : 0) / plCnt,
          d3.sum(cycleData, d =>
            d.Tonnes >= 1.2 * d['Target Payload'] ? 1 : 0) / plCnt,
        ]

        return { zones, statData, plCnt }
      },
      draw () {
        if (!this.data.length) return

        const container = d3.selectAll('#' + this.el)

        const { statData, plCnt, zones } = this.configure()

        if (!plCnt) {
          container.select('.gauge').remove()
          container.select('.stats').remove()
          return
        }

        const svg = container.append('svg:svg')
          .attr('class', 'gauge')
          .style('display', 'block')

        svg.append('svg:circle')
          .style('fill', '#ccc')
          .style('stroke', '#000')
          .style('stroke-width', '0.5px')

        svg.append('svg:circle')
          .style('fill', '#fff')
          .style('stroke', '#e0e0e0')
          .style('stroke-width', '2px')

        svg.append('g')
          .attr('class', 'arc')
          .selectAll('path')
          .data(zones)
          .enter()
          .append('path')
          .style('fill', d => d.color)

        const gTick = svg.append('g')
          .attr('class', 'ticks')

        gTick.selectAll('text')
          .data([zones[0].from].concat(zones.map(e => e.to)))
          .enter().append('text')
          .attr('class', 'tick')
          .attr('text-anchor', 'middle')
          .text(d => Math.round(d))

        gTick.append('svg:line')
          .attr('class', 'mid-line')
          .attr('stroke', '#333')
          .attr('stroke-width', '1px')

        gTick.append('svg:text')
          .attr('text-anchor', 'middle')
          .attr('class', 'mid-val')

        // draw gauge label
        svg.append('svg:text')
          .attr('text-anchor', 'middle')
          .attr('class', 'label')
          .text('Average Payload')
          .style('fill', '#333')
          .style('stroke-width', '0px')

        svg.append('svg:g')
          .attr('class', 'pointer')

        // draw Legend
        const gLegend = svg.append('g')
          .attr('class', 'legend')
          .selectAll('g')
          .data(zones)
          .enter()
          .append('g')
          .attr('transform', (d, i) => `translate(0, ${17 * i})`)

        gLegend.append('rect')
          .attr('width', 14)
          .attr('height', 14)
          .attr('fill', d => d.color)

        gLegend.append('text')
          .attr('x', 17)
          .attr('y', 12)
          .style('font-size', '12px')
          .text(d => d.title)

        const stats = container
          .append('svg')
          .attr('class', 'stats')
          .attr('height', 40)
          .style('display', 'block')

        stats.append('text')
          .attr('class', 'stats-title')
          .attr('y', 10)
          .attr('text-anchor', 'middle')
          .style('font-size', '13px')
          .text('Percent of Payloads by Category')

        svg.append('g')
          .append('text')
          .attr('class', 'loads-cnt')
          .attr('transform', 'translate(' + [10, 16] + ')')
          .text('No. Loads: ' + plCnt)
          .style('font-size', '12px')

        const loads = stats.append('g')
          .attr('transform', 'translate(0,15)')
          .attr('class', 'loads')
          .selectAll('g')
          .data(statData)
          .enter()
          .append('g').attr('class', 'load')

        loads.append('rect')
          .attr('height', 25)
          .style('fill', (d, i) => zones[i].color)

        loads.append('text')
          .attr('class', 'value')
          .attr('dy', 18)
          .attr('text-anchor', 'middle')
          .text(d => d3.format('.0%')(d))
          .style('fill', 'white')
          .style('font-size', '12px')

        this.resize()
      },
      toDegree (value) {
        return (value - this.config.min) / this.config.range * 270
      },
      toRadian (value) {
        return this.toDegree(value) * Math.PI / 180
      },
      toPoint (value, factor) {
        return {
          x: this.config.raduis * factor * Math.sin(this.toRadian(value)),
          y: -this.config.raduis * factor * Math.cos(this.toRadian(value)),
        }
      },
      resize () {
        const container = d3.select('#' + this.el)
        const visual = document.querySelector('#' + this.el)
        const parent = visual.parentNode.parentNode
        const wid = parent.getBoundingClientRect().width - 24
        const hei = parent.getBoundingClientRect().height - 36 -
          parent.querySelector('.subtitle-1').getBoundingClientRect().height -
          parent.querySelector('.body-2').getBoundingClientRect().height
        visual.style.height = hei + 'px'

        const width = wid - 24
        const height = hei - 24
        const statsHeight = 40
        this.config.height = height - statsHeight
        this.config.width = width
        this.config.size = Math.round(
          Math.min(this.config.height, this.config.width) * 0.9)
        this.config.raduis = Math.round(this.config.size * 0.97 / 2)
        this.config.cx = this.config.width / 2
        this.config.cy = this.config.height / 2

        const svg = container.select('svg.gauge')
          .attr('width', this.config.width)
          .attr('height', this.config.height)

        svg.selectAll('circle').filter((d, i) => i === 0)
          .attr('cx', this.config.cx)
          .attr('cy', this.config.cy)
          .attr('r', this.config.raduis)

        svg.selectAll('circle').filter((d, i) => i === 1)
          .attr('cx', this.config.cx)
          .attr('cy', this.config.cy)
          .attr('r', 0.9 * this.config.raduis)

        svg.select('g.arc')
          .attr('transform', 'translate(' + this.config.cx + ', ' +
            this.config.cy + ') rotate(-135)')
          .selectAll('path')
          .attr('d', d3.arc()
            .startAngle(d => this.toRadian(d.from))
            .endAngle(d => this.toRadian(d.to))
            .innerRadius(0.75 * this.config.raduis)
            .outerRadius(0.85 * this.config.raduis),
          )

        const gTick = svg.select('g.ticks')
          .attr('transform', 'translate(' + this.config.cx + ', ' +
            this.config.cy + ') rotate(-135)')

        gTick.selectAll('.tick')
          .attr('transform', d => {
            return 'rotate(' + this.toDegree(d) + ') ' +
              'translate(0,' + -this.config.raduis * 0.65 + ')'
          })
          .style('font-size', Math.round(this.config.size / 20) + 'px')

        const tVal = this.config.targetValue

        gTick.select('.mid-line')
          .attr('x1', this.toPoint(tVal, 0.75).x)
          .attr('y1', this.toPoint(tVal, 0.75).y)
          .attr('x2', this.toPoint(tVal, 0.85).x)
          .attr('y2', this.toPoint(tVal, 0.85).y)

        gTick.select('.mid-val')
          .attr('transform', 'rotate(' + this.toDegree(tVal) + ') ' +
            'translate(0,' + -this.config.raduis * 0.65 + ')')
          .text(tVal)
          .style('font-size', Math.round(this.config.size / 23) + 'px')

        const fontSize = Math.round(this.config.size / 15)

        svg.select('.label')
          .attr('x', this.config.cx)
          .attr('y', this.config.cy * 0.6 + fontSize / 2)
          .attr('dy', fontSize / 2)
          .style('font-size', fontSize + 'px')

        const pointer = svg.select('.pointer')
          .attr('transform', 'translate(' + this.config.cx + ', ' +
            this.config.cy + ')')

        pointer.selectAll('*').remove()

        const midValue = Math.round((this.config.min + this.config.max) / 2)
        const delta = this.config.range / 15
        const head = this.toPoint(midValue, 0.76)
        const head1 = this.toPoint(midValue - delta, 0.12)
        const head2 = this.toPoint(midValue + delta, 0.12)

        const tailValue = midValue - this.config.range / 3 * 2
        const tail = this.toPoint(tailValue, 0.2)
        const tail1 = this.toPoint(tailValue - delta, 0.12)
        const tail2 = this.toPoint(tailValue + delta, 0.12)

        const pointerLine = d3.line()
          .x(d => d.x)
          .y(d => d.y)
          .curve(d3.curveBasis)

        pointer.selectAll('path')
          .data([[head, head1, tail2, tail, tail1, head2, head]])
          .enter()
          .append('svg:path')
          .attr('transform', 'rotate(-135)')
          .attr('d', pointerLine)
          .style('fill', '#dc3912')
          .style('stroke', '#c63310')
          .style('fill-opacity', 0.7)

        pointer.append('svg:circle')
          .attr('r', 0.1 * this.config.raduis)

        pointer.append('svg:text')
          .attr('dy', 0.3 * this.config.raduis)
          .attr('text-anchor', 'middle')
          .text(midValue)
          .style('font-size', fontSize + 'px')

        svg.select('.legend')
          .attr('transform', 'translate(' + [10, this.config.size - 66] + ')')

        const stats = d3.select(`#${this.el} svg.stats`)
          .attr('width', width)

        stats.select('.stats-title')
          .attr('x', width / 2)

        let dx = 0

        const loads = stats.selectAll('.load')
          .attr('transform', d => {
            const oldDx = dx
            dx += Math.round(d * width * 100) / 100
            return `translate(${oldDx}, 0)`
          })

        loads.select('rect')
          .attr('width', d => (width * d).toFixed(2))

        loads.select('.value')
          .attr('dx', d => (width * d / 2).toFixed(2))
          .style('display', d => width * d > 25 ? 'block' : 'none')
      },
      update () {
        const container = d3.selectAll('#' + this.el)

        const { zones, statData, plCnt } = this.configure()

        if (!plCnt) {
          container.select('.gauge').remove()
          container.select('.stats').remove()
          return
        }

        const svg = container.select('.gauge')

        svg.select('.ticks').selectAll('.tick')
          .data([zones[0].from].concat(zones.map(e => e.to)))
          .enter()
          .text(d => Math.round(d))

        svg.select('.loads-cnt').text('No. Loads: ' + plCnt)

        const stats = container.select('.stats')

        const width = document.querySelector('#' + this.el)
          .parentNode.getBoundingClientRect().width - 24
        let dx = 0

        const loads = stats.selectAll('.load')
          .data(statData)
          .transition()
          .attr('transform', d => {
            const oldDx = dx
            dx += Math.round(d * width * 100) / 100
            return `translate(${oldDx}, 0)`
          })

        loads.select('rect')
          .attr('width', d => (width * d).toFixed(2))
        loads.select('.value')
          .attr('dx', d => (width * d / 2).toFixed(2))
          .text(d => d3.format('.0%')(d))
          .style('display', d => width * d > 25 ? 'block' : 'none')
      },
    },
  }
</script>

<style scope>
  svg text {
    fill: white;
  }

  svg .ticks text, svg .pointer text {
    fill: black;
  }
</style>
