<template>
  <div
    :id="el"
    v-resize="handleResize"
    v-bind="$attrs"
  />
</template>

<script>
  import * as d3 from 'd3'
  import { mapState } from 'vuex'
  import CycleTableApi from '@/services/api/CycleTable'
  import colors from 'vuetify/lib/util/colors'

  export default {
    name: 'PayloadSummary',
    props: {
      widget: {
        type: Object,
        default: undefined,
      },
      initalDate: {
        type: Date,
        default: undefined,
      },
      start: {
        type: Date,
        default: undefined,
      },
      end: {
        type: Date,
        default: undefined,
      },
      asset: {
        type: String,
        default: undefined,
      },
    },
    data: () => ({
      loading: true,
      jsonData: undefined,
      config: {
        label: 'Average Payload',
        ticksBetweenZones: true,
        min: 0.0,
        max: 0.0,
        targetValue: 0.0,
        colorZones: [
          { from: 0.0, to: 0.0, color: colors.red.base },
          { from: 0.0, to: 0.0, color: colors.green.base },
          { from: 0.0, to: 0.0, color: colors.orange.base },
          { from: 0.0, to: 0.0, color: colors.blue.base },
        ],
      },
    }),
    computed: {
      ...mapState(['user']),
      el () {
        return this.widget.Selector.split('#')[1] +
          '-widget-' + this.widget.WidgetId
      },
    },
    mounted () {
      CycleTableApi.allByUserDateTimeRange(
        this.user, this.initalDate, this.start, this.end, this.asset)
        .then((json) => {
          this.jsonData = json
          this.loading = false
          this.drawVisual()
        })
        .catch((err) => console.log(err))
    },
    methods: {
      drawVisual () {
        const cycleData = this.jsonData.filter(function (d) {
          return d.Jmineops
        })

        const totalTargetPayload = d3.sum(cycleData, function (d) {
          return d['Target Payload'] ? d['Target Payload'] : 0
        })

        const targetPayloadCount = d3.sum(cycleData, function (d) {
          return d['Target Payload'] ? 1 : 0
        })

        const targetPayload = totalTargetPayload / targetPayloadCount
        const statsHeight = 40
        const width = document.querySelector('#' + this.el).parentNode
          .getBoundingClientRect().width - 2

        this.config.min = Math.round(targetPayload * 0.8)
        this.config.max = Math.round(targetPayload * 1.3)
        this.config.targetValue = Math.round(targetPayload)
        this.config.colorZones[0].from = this.config.min
        this.config.colorZones[0].to = Math.round(targetPayload * 0.9)
        this.config.colorZones[1].from = Math.round(targetPayload * 0.9)
        this.config.colorZones[1].to = Math.round(targetPayload * 1.1)
        this.config.colorZones[2].from = Math.round(targetPayload * 1.1)
        this.config.colorZones[2].to = Math.round(targetPayload * 1.2)
        this.config.colorZones[3].from = Math.round(targetPayload * 1.2)
        this.config.colorZones[3].to = this.config.max
        this.config.range = this.config.max - this.config.min

        const container = d3.selectAll('#' + this.el)
          .datum(this.config.colorZones)

        container.select('.gauge').remove()
        container.select('.stats').remove()

        const svg = container.append('svg:svg')
          .attr('id', 'payloadsummary-gauge')
          .attr('class', 'gauge visuals')
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
          .data(d => d)
          .enter()
          .append('path')
          .style('fill', d => d.color)

        const gTick = svg.append('g')
          .attr('class', 'tick')

        gTick.selectAll('text')
          .data(d => {
            return [d[0].from].concat(d.map(e => e.to))
          })
          .enter().append('text')
          .attr('text-anchor', 'middle')
          .attr('class', 'tick')
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
          .text(this.config.label)
          .style('fill', '#333')
          .style('stroke-width', '0px')

        svg.append('svg:g')
          .attr('class', 'pointer')

        // draw Legend
        const legend = svg.append('g')
          .attr('class', 'legend')
          .selectAll('g')
          .data([
            {
              title: 'Underloads -10%',
              color: this.config.colorZones[0].color,
            },
            {
              title: 'Loads in Range',
              color: this.config.colorZones[1].color,
            },
            {
              title: 'Overloads +10%',
              color: this.config.colorZones[2].color,
            },
            {
              title: 'Unsafe Loads +20%',
              color: this.config.colorZones[3].color,
            },
          ])
          .enter()
          .append('g')
          .attr('transform', (d, i) => `translate(0, ${17 * i})`)

        legend.append('rect')
          .attr('width', 14)
          .attr('height', 14)
          .attr('fill', d => d.color)

        legend.append('text')
          .attr('x', 17)
          .attr('y', 12)
          .style('font-size', '12px')
          .text(d => d.title)

        const stats = container
          .append('svg')
          .attr('id', 'payloadsummary-stats')
          .attr('class', 'stats')
          .attr('height', statsHeight)
          .style('display', 'block')

        stats.append('text')
          .attr('class', 'stats-title')
          .attr('y', 10)
          .attr('text-anchor', 'middle')
          .style('font-size', '13px')
          .text('Percent of Payloads by Category')

        const payloadCnt = d3.sum(cycleData, d => d.Tonnes ? 1 : 0)

        svg.append('g')
          .append('text')
          .attr('class', 'loads-cnt')
          .attr('transform', 'translate(' + [10, 16] + ')')
          .text(d => 'No. Loads: ' + payloadCnt)
          .style('font-size', '12px')

        if (!payloadCnt) {
          return
        }

        const statData = [
          d3.sum(cycleData, d =>
            d.Tonnes < 0.9 * d['Target Payload'] && d.Tonnes > 0
              ? 1 : 0) / payloadCnt,
          d3.sum(cycleData, d =>
            (d.Tonnes >= 0.9 * d['Target Payload']) &&
            (d.Tonnes < 1.1 * d['Target Payload']) ? 1 : 0) / payloadCnt,
          d3.sum(cycleData, d =>
            (d.Tonnes >= 1.1 * d['Target Payload']) &&
            (d.Tonnes < 1.2 * d['Target Payload']) ? 1 : 0) / payloadCnt,
          d3.sum(cycleData, d =>
            d.Tonnes >= 1.2 * d['Target Payload'] ? 1 : 0) / payloadCnt,
        ]

        const boxHei = statsHeight - 15
        const formatPercent = d3.format('.0%')

        const loads = stats.append('g')
          .attr('transform', 'translate(0,15)')
          .selectAll('g')
          .data(statData)
          .enter()
          .append('g').attr('class', 'load')

        loads.append('rect')
          .attr('height', boxHei)
          .style('fill', (d, i) => this.config.colorZones[i].color)

        loads.filter(d => d * width > 25)
          .append('text')
          .attr('class', 'value')
          .attr('dy', 18)
          .attr('text-anchor', 'middle')
          .text(d => formatPercent(d))
          .style('fill', 'white')
          .style('font-size', '12px')

        this.handleResize()
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
      handleResize () {
        const statsHeight = 40
        const width = document.querySelector('#' + this.el).parentNode
          .getBoundingClientRect().width - 2
        const height = document.querySelector('#' + this.el).parentNode
          .getBoundingClientRect().height - 26

        this.config.height = height - statsHeight
        this.config.width = width
        this.config.size = Math.round(
          Math.min(this.config.height, this.config.width) * 0.9)
        this.config.raduis = Math.round(this.config.size * 0.97 / 2)
        this.config.cx = this.config.width / 2
        this.config.cy = this.config.height / 2

        const container = d3.select('#' + this.el)

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

        const gTick = svg.select('g.tick')
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
        const delta = this.config.range / 13
        const head = this.toPoint(midValue, 0.85)
        const head1 = this.toPoint(midValue - delta, 0.12)
        const head2 = this.toPoint(midValue + delta, 0.12)

        const tailValue = midValue - this.config.range / 3 * 2
        const tail = this.toPoint(tailValue, 0.28)
        const tail1 = this.toPoint(tailValue - delta, 0.12)
        const tail2 = this.toPoint(tailValue + delta, 0.12)

        const buildPointerPath = [head, head1, tail2, tail, tail1, head2, head]

        const pointerLine = d3.line()
          .x(d => d.x)
          .y(d => d.y)
          .curve(d3.curveBasis)

        pointer.selectAll('path')
          .data([buildPointerPath])
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

        const stats = d3.select('#payloadsummary-stats')
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

        loads.filter(d => d * width > 25)
          .selectAll('.value')
          .attr('dx', d => (width * d / 2).toFixed(2))
      },
    },
  }
</script>
