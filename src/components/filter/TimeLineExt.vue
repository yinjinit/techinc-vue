<template>
  <v-sheet
    v-resize="resize"
    color="rgba(0,0,0,0)"
  >
    <div
      :id="id"
      class="ma-4 mb-0"
    />

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
    data: () => ({
      id: 'timeline-filter',
      x: d3.scaleUtc(),
      y: d3.scaleLinear(),
      data: undefined,
    }),
    computed: {
      timeRange: {
        get () {
          return this.$store.state[this.$route.name].timeRange
        },
        set (val) {
          const name = this.$route.name
          this.$store.commit('SET_TIMERANGE', { name, val })
        },
      },
    },
    mounted () {
      this.draw()
    },
    updated () {
      this.update()
    },
    methods: {
      updateTimeRange (el, val) {
        this.$set(this.timeRange, el, val)
      },
      resize () {
        if (this.data === undefined) return

        const width = document.querySelector('#' + this.id)
          .getBoundingClientRect().width
        const barWid = Math.round(width / this.data.length)

        this.x.rangeRound([0, width])

        const svg = d3.select('svg.' + this.id)
          .attr('width', width)

        svg.select(`#${this.id} .axis`).call(d3.axisBottom(this.x))
        svg.selectAll(`#${this.id} .bar`)
          .attr('d', d => d.map(e => 'M' + this.x(e.key) + ',114' +
            'V' + this.y(e.value) + 'h' + barWid + 'V114').join(''))
      },
      update () {
        const id = '#' + this.id
        const mBottom = 20
        const width = document.querySelector(id)
          .getBoundingClientRect().width
        const height = 134
        const interval = 20
        const sel = [this.timeRange.start, this.timeRange.end]

        const svg = d3.select('#' + this.id)

        const brushEmpty = () => {
          const dx = this.x(1) - this.x(0)
          const [cx] = d3.mouse(document.querySelector(id + ' .brush'))
          const [x0, x1] = [cx - dx / 2, cx + dx / 2]
          const [X0, X1] = this.x.range()
          d3.select(id + ' .brush')
            .call(brush.move, x1 > X1 ? [X1 - dx, X1]
              : x0 < X0 ? [X0, X0 + dx] : [x0, x1])
        }

        const brush = d3.brushX()
          .extent([[0, 0], [width, height - mBottom]])
          .on('brush end', () => {
            if (!d3.event.sourceEvent) return
            if (!d3.event.selection) {
              if (d3.event.sourceEvent.detail === 1) {
                brushEmpty()
              }
              return
            }

            const d0 = d3.event.selection
            svg.select('#clip-' + this.id + ' rect')
              .attr('x', d0[0])
              .attr('width', d0[1] - d0[0])

            if (d3.event.type === 'end') {
              this.timeRange = {
                start: this.x.invert(d0[0]),
                end: this.x.invert(d0[1]),
              }
            }
          })

        if (sel[0] >= this.data[0].key &&
          sel[1] < d3.timeMinute.every(interval).offset(
            this.data[this.data.length - 1].key)) {
          svg.select(id + ' .brush').transition()
            .call(brush.move, sel.map(this.x))
          svg.select('#clip-' + this.id + ' rect')
            .attr('x', sel.map(this.x)[0])
            .attr('width', sel.map(this.x)[1] - sel.map(this.x)[0])
        } else {
          svg.select(id + ' .brush').transition().call(brush.move, null)
          svg.select('#clip-' + this.id + ' rect')
            .attr('x', 0)
            .attr('width', 0)
        }
      },
      draw () {
        const id = '#' + this.id
        const name = this.$route.name
        const interval = 20
        const mBottom = 20
        const width = document.querySelector(id)
          .getBoundingClientRect().width
        const height = 134
        const dimension = this.$store.state[name].timeline
          .dimension(d => d.dateTime)
        const group = dimension.group(d3.timeMinute.every(interval))
        this.data = group.all()
        const barWid = Math.round(width / this.data.length)
        this.x.domain([this.data[0].key, this.data[this.data.length - 1].key])
          .rangeRound([0, width])
        this.y.domain([0, group.top(1)[0].value])
          .range([height - mBottom, 0])
        const axis = d3.axisBottom(this.x)

        d3.select(id).selectAll('*').remove()

        const svg = d3.select(id)
          .append('svg')
          .attr('class', 'timeline-filter')
          .attr('width', width)
          .attr('height', height)

        const bars = svg.append('g').attr('class', 'bars')

        bars.append('clipPath')
          .attr('id', 'clip-' + this.id)
          .append('rect')
          .attr('height', height - mBottom)

        bars.selectAll(`#${this.id} .bar`)
          .data(['background', 'foreground'])
          .enter()
          .append('path')
          .attr('class', d => d + ' bar')
          .style('fill', d => d === 'background' ? '#ccc' : 'steelblue')
          .datum(this.data)

        bars.selectAll(`#${this.id} .foreground.bar`)
          .attr('clip-path', 'url(#clip-' + this.id + ')')

        bars.selectAll(`#${this.id} .bar`)
          .attr('d', d => d.map(e => 'M' + this.x(e.key) + ',' +
            (height - mBottom) + 'V' + this.y(e.value) +
            'h' + barWid + 'V' + (height - mBottom)).join(''))

        svg.append('g')
          .call(axis)
          .attr('class', 'axis')
          .attr('transform', `translate(0, ${height - mBottom})`)

        const brushEmpty = () => {
          const dx = this.x(1) - this.x(0)
          const [cx] = d3.mouse(document.querySelector(id + ' .brush'))
          const [x0, x1] = [cx - dx / 2, cx + dx / 2]
          const [X0, X1] = this.x.range()
          d3.select(id + ' .brush')
            .call(brush.move, x1 > X1 ? [X1 - dx, X1]
              : x0 < X0 ? [X0, X0 + dx] : [x0, x1])
        }

        const brush = d3.brushX()
          .extent([[0, 0], [width, height - mBottom]])
          .on('brush end', () => {
            if (!d3.event.sourceEvent) return
            if (!d3.event.selection) {
              if (d3.event.sourceEvent.detail === 1) {
                brushEmpty()
              }
              return
            }

            const d0 = d3.event.selection
            svg.select('#clip-' + this.id + ' rect')
              .attr('x', d0[0])
              .attr('width', d0[1] - d0[0])

            if (d3.event.type === 'end') {
              this.$set(this.timeRange, 'start', this.x.invert(d0[0]))
              this.$set(this.timeRange, 'end', this.x.invert(d0[1]))
            }
          })

        svg.append('g')
          .call(brush)
          .attr('class', 'brush')
          .on('dblclick', () => {
            if (d3.brushSelection(document.querySelector(id + ' .brush'))) {
              brushEmpty()
            } else {
              d3.select(id + ' .brush').call(brush.move, this.x.range())
            }
          })

        this.update()
      },
    },
  }
</script>
