<template>
  <div
    :id="el"
    :ref="el"
    v-resize="handleResize"
    v-bind="$attrs"
    @resize="handleResize"
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
        const container = d3.select('#' + this.el)
        const statsHeight = 40

        const config = {
          margin: { bottom: 30 },
          label: 'Average Payload',
          ticksBetweenZones: true,
          min: 0.0,
          max: 0.0,
          targetValue: 0.0,
        }

        config.colorZones = [
          { from: 0.0, to: 0.0, color: colors.red.base },
          { from: 0.0, to: 0.0, color: colors.green.base },
          { from: 0.0, to: 0.0, color: colors.orange.base },
          { from: 0.0, to: 0.0, color: colors.blue.base },
        ]

        container.select('.gauge').remove()
        container.select('.stats').remove()

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

        config.min = targetPayload * 0.8
        config.max = targetPayload * 1.3
        config.targetValue = targetPayload

        config.colorZones[0].from = config.min
        config.colorZones[0].to = targetPayload * 0.9

        config.colorZones[1].from = targetPayload * 0.9
        config.colorZones[1].to = targetPayload * 1.1

        config.colorZones[2].from = targetPayload * 1.1
        config.colorZones[2].to = targetPayload * 1.2

        config.colorZones[3].from = targetPayload * 1.2
        config.colorZones[3].to = config.max

        const width = document.querySelector('#' + this.el).parentNode
          .getBoundingClientRect().width
        const height = document.querySelector('#' + this.el).parentNode
          .getBoundingClientRect().height - 24

        config.height = height - statsHeight
        config.width = width

        config.size = d3.min(
          [config.height - config.margin.bottom,
           config.width]) * 0.9
        config.margin = {
          bottom: config.margin.bottom || 0,
        }

        config.raduis = config.size * 0.97 / 2
        config.cx = config.width / 2
        config.cy = (config.height - config.margin.bottom) / 2

        config.min = undefined !== config.min
          ? config.min : 0
        config.max = undefined !== config.max
          ? config.max : 100
        config.range = config.max - config.min

        config.majorTicks = config.majorTicks || 5
        config.minorTicks = config.minorTicks || 2

        config.transitionDuration =
          config.transitionDuration || 500

        const svg = container
          .append('svg:svg')
          .attr('id', 'payloadsummary-gauge')
          .attr('class', 'gauge visuals')
          .attr('width', config.width)
          .attr('height', config.height)
          .style('display', 'block')

        svg.append('svg:circle')
          .attr('cx', config.cx)
          .attr('cy', config.cy)
          .attr('r', config.raduis)
          .style('fill', '#ccc')
          .style('stroke', '#000')
          .style('stroke-width', '0.5px')

        svg.append('svg:circle')
          .attr('cx', config.cx)
          .attr('cy', config.cy)
          .attr('r', 0.9 * config.raduis)
          .style('fill', '#fff')
          .style('stroke', '#e0e0e0')
          .style('stroke-width', '2px')

        config.colorZones.forEach(drawBand)

        // draw gauge label
        if (undefined !== config.label) {
          const fontSize = Math.round(config.size / 15)
          svg.append('svg:text')
            .attr('x', config.cx)
            .attr('y', config.cy * 0.6 + fontSize / 2)
            .attr('dy', fontSize / 2)
            .attr('text-anchor', 'middle')
            .text(config.label)
            .style('font-size', fontSize + 'px')
            .style('fill', '#333')
            .style('stroke-width', '0px')
        }

        if (config.ticksBetweenZones) {
          // draw ticks between color zones
          config.colorZones.forEach(function (zone, i) {
            if (i === 0) {
              drawMajorTick(zone.from)
            }
            drawMajorTick(zone.to)
          })
          if (config.targetValue) {
            drawMinorTick(config.targetValue, true)
          }
        } else {
          // draw major and minor ticks
          const majorDelta = config.range / (config.majorTicks - 1)
          for (let major = config.min;
               major <= config.max;
               major += majorDelta) {
                 const minorDelta = majorDelta / config.minorTicks
                 for (let minor = major + minorDelta;
                      minor < Math.min(major + majorDelta, config.max);
                      minor += minorDelta) {
                        drawMinorTick(minor)
                      }
                 drawMajorTick(major)
               }
        }

        const pointerContainer = svg.append('svg:g')
          .attr('class', 'pointerContainer')

        const midValue = (config.min + config.max) / 2

        const pointerLine = d3.line()
          .x(d => d.x)
          .y(d => d.y)
          .curve(d3.curveBasis)

        pointerContainer.selectAll('path')
          .data([buildPointerPath(midValue)])
          .enter()
          .append('svg:path')
          .attr('d', pointerLine)
          .style('fill', '#dc3912')
          .style('stroke', '#c63310')
          .style('fill-opacity', 0.7)
          .attr('transform', d => {
            let pointerValue = midValue

            if (midValue > config.max) {
              pointerValue = config.max + 0.02 * config.range
            } else if (midValue < config.min) {
              pointerValue = config.min - 0.02 * config.range
            }

            const rotation = (valueToDegrees(pointerValue) - 90)

            return 'translate(' + config.cx + ', ' + config.cy + ') ' +
              'rotate(' + rotation + ')'
          })

        pointerContainer.append('svg:circle')
          .attr('cx', config.cx)
          .attr('cy', config.cy)
          .attr('r', 0.12 * config.raduis)

        const fontSize = Math.round(config.size / 10)

        pointerContainer.selectAll('text')
          .data([midValue])
          .enter()
          .append('svg:text')
          .attr('x', config.cx)
          .attr('y', config.size - config.cy / 4 - fontSize)
          .attr('dy', fontSize / 2)
          .attr('text-anchor', 'middle')
          .text(d => d)
          .style('font-size', fontSize + 'px')

        // move from header
        container.select('svg.gauge')

        // draw Legend
        const legend = container
          .select('svg.gauge')
          .append('g')
          .attr('class', 'dc-legend')
          .attr('transform', 'translate(' + [10, config.size - 40] + ')')
          .selectAll('g.legend-item')
          .data([
            { title: 'Underloads -10%', color: config.colorZones[0].color },
            { title: 'Loads in Range', color: config.colorZones[1].color },
            { title: 'Overloads +10%', color: config.colorZones[2].color },
            { title: 'Unsafe Loads +20%', color: config.colorZones[3].color },
          ])
          .enter()
          .append('g')
          .attr('class', 'legend-item')
          .attr('transform', function (d, i) {
            return 'translate(0, ' + 17 * i + ')'
          })
          .style('font-size', '12px')

        legend.append('rect')
          .attr('width', 12)
          .attr('height', 12)
          .style('fill', function (d) { return d.color })

        legend.append('text')
          .attr('x', 14)
          .attr('y', 10)
          .text(function (d) { return d.title })

        const stats = container
          .append('svg')
          .attr('id', 'payloadsummary-stats')
          .attr('class', 'stats visuals')
          .attr('width', width)
          .attr('height', statsHeight)
          .style('display', 'block')

        stats.append('text')
          .attr('class', 'summary-title')
          .attr('x', width / 2)
          .attr('y', 10)
          .attr('text-anchor', 'middle')
          .style('font-size', '12px')
          .text('Percent of Payloads by Category')

        stats.append('g')
          .attr('transform', 'translate(0,15)')

        // let payload = d3.sum(cycleData, function (d) {
        //   return d.Tonnes ? d.Tonnes : 0
        // })

        const payloadCnt = d3.sum(cycleData, function (d) {
          return d.Tonnes ? 1 : 0
        })

        let loadsNeg10 = d3.sum(cycleData, function (d) {
          return d.Tonnes < 0.9 * d['Target Payload'] && d.Tonnes > 0
            ? 1
            : 0
        })

        let loadsInRange = d3.sum(cycleData, function (d) {
          return (d.Tonnes >= 0.9 * d['Target Payload']) &&
            (d.Tonnes < 1.1 * d['Target Payload']) ? 1 : 0
        })

        let loadsPos10 = d3.sum(cycleData, function (d) {
          return (d.Tonnes >= 1.1 * d['Target Payload']) &&
            (d.Tonnes < 1.2 * d['Target Payload']) ? 1 : 0
        })

        let loadsPos20 = d3.sum(cycleData, function (d) {
          return d.Tonnes >= 1.2 * d['Target Payload'] ? 1 : 0
        })

        // payload = payloadCnt > 0.0 ? payload / payloadCnt : 0
        loadsNeg10 = payloadCnt > 0.0 ? loadsNeg10 / payloadCnt : 0
        loadsInRange = payloadCnt > 0.0 ? loadsInRange / payloadCnt : 0
        loadsPos10 = payloadCnt > 0.0 ? loadsPos10 / payloadCnt : 0
        loadsPos20 = payloadCnt > 0.0 ? loadsPos20 / payloadCnt : 0

        const statData = [
          { name: '-10%', value: loadsNeg10, withinNorm: loadsNeg10 < 0.03 },
          {
            name: 'In Range',
            value: loadsInRange,
            withinNorm: loadsInRange > 0.86,
          },
          { name: '+10%', value: loadsPos10, withinNorm: loadsPos10 < 0.11 },
          { name: '+20%', value: loadsPos20, withinNorm: loadsPos20 === 0 },
        ]

        const boxHei = 25
        let dx = 0
        const formatPercent = d3.format('.0%')

        const loads = stats.select('g')
          .selectAll('g.load')
          .data(statData, function (d) { return d.name })
          .enter()
          .append('g').attr('class', 'load')
          .attr('transform', d => {
            const val = 'translate(' + [dx, 0] + ')'
            dx += width * d.value
            return val
          })

        loads.append('rect')
          .attr('width', d => width * d.value)
          .attr('height', boxHei)
          .style('stroke-dasharray', d =>
            width * d.value + ' ' + width * d.value + boxHei * 2)
          .style('fill', (d, i) => config.colorZones[i].color)

        loads.append('text')
          .attr('class', 'value')
          .attr('dy', 18)
          .attr('dx', d => width * d.value / 2)
          .attr('text-anchor', 'middle')
          .text(d => formatPercent(d.value))
          .style('display', d => Math.round(d.value * 100) ? 'block' : 'none')
          .style('fill', 'white')
          .style('font-size', '12px')

        container.select('.no-loads').remove()

        container
          .select('svg.gauge')
          .append('g')
          .attr('class', 'no-loads')
          .attr('transform', 'translate(' + [10, 10] + ')')
          .append('text')
          .attr('x', 5)
          .attr('y', 5)
          .text(d => 'No. Loads: ' + payloadCnt)
          .style('font-size', '12px')

        function buildPointerPath (value) {
          const delta = config.range / 13

          const head = toPoint(value, 0.85)
          const head1 = toPoint(value - delta, 0.12)
          const head2 = toPoint(value + delta, 0.12)

          const tailValue = value - (config.range * (1 / (270 / 360)) / 2)
          const tail = toPoint(tailValue, 0.28)
          const tail1 = toPoint(tailValue - delta, 0.12)
          const tail2 = toPoint(tailValue + delta, 0.12)

          return [head, head1, tail2, tail, tail1, head2, head]
        }

        function toPoint (value, factor) {
          const point = valueToPoint(value, factor)
          point.x -= config.cx
          point.y -= config.cy
          return point
        }

        function drawMajorTick (value) {
          const point1 = valueToPoint(value, 0.7)
          const point2 = valueToPoint(value, 0.85)
          drawTick(point1, point2, 'major')
          drawTickValue(value, 'major')
        }

        function drawMinorTick (value, drawValue) {
          const point1 = valueToPoint(value, 0.75)
          const point2 = valueToPoint(value, 0.85)
          drawTick(point1, point2, 'minor')
          if (drawValue) {
            drawTickValue(value, 'minor')
          }
        }

        function drawTick (point1, point2, type) {
          svg.append('svg:line')
            .attr('class', 'tick ' + type)
            .attr('x1', point1.x)
            .attr('y1', point1.y)
            .attr('x2', point2.x)
            .attr('y2', point2.y)
            .attr('stroke', '#333')
            .attr('stroke-width', '2px')
        }

        function drawTickValue (value, type) {
          const point = valueToPoint(
            value,
            { major: 0.63, minor: 0.7 }[type])
          const fontSize = Math.round(config.size /
            { major: 20, minor: 23 }[type])
          svg.append('svg:text')
            .attr('class', 'tick-label ' + type)
            .attr('x', point.x)
            .attr('y', point.y)
            .attr('dy', fontSize / 3)
            .attr('text-anchor', value <
              (config.min + config.max) / 2 ? 'start' : 'end')
            .text(Math.round(value))
            .style('font-size', fontSize + 'px')
        }

        function drawBand (zone) {
          if (zone.to - zone.from <= 0) return

          svg.append('svg:path')
            .style('fill', zone.color)
            .attr('d', d3.arc()
              .startAngle(valueToRadians(zone.from))
              .endAngle(valueToRadians(zone.to))
              .innerRadius(0.75 * config.raduis)
              .outerRadius(0.85 * config.raduis))
            .attr('transform', function () {
              return 'translate(' + config.cx + ', ' +
                config.cy + ') rotate(270)'
            })
        }

        function valueToRadians (value) {
          return valueToDegrees(value) * Math.PI / 180
        }

        function valueToPoint (value, factor) {
          return {
            x: config.cx -
              config.raduis * factor *
              Math.cos(valueToRadians(value)),
            y: config.cy -
              config.raduis * factor *
              Math.sin(valueToRadians(value)),
          }
        }

        function valueToDegrees (value) {
          return value / config.range * 270 -
            (config.min / config.range * 270 + 45)
        }
      },
      handleResize () {
        console.log('resized')
        const width = document.querySelector('#' + this.el).parentNode
          .getBoundingClientRect().width
        const height = document.querySelector('#' + this.el).parentNode
          .getBoundingClientRect().height - 24
        d3.select('svg.gauge')
          .attr('width', width)
          .attr('height', width)

        d3.select('svg.stats')
      },
    },
  }
</script>
