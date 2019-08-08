<script lang="ts">
import { Line } from 'vue-chartjs'
import Vue from 'vue'
import auction, { ApiRound } from '../../../store/modules/auction'
import ColorScheme from 'color-scheme'

const PriceDevelopmentChart = Vue.extend({
  extends: Line,
  name: 'PriceDevelopmentChart',
  props: ['rounds'],
  watch: {
    rounds(rounds) {
      this.$data.chartData = this.prepareData(this.$props.rounds)
    }
  },
  mounted() {
    this.$data.chartData = this.prepareData(this.$props.rounds)
    const vueThis: any = this as any
    vueThis.renderChart(this.chartData, this.options)
  },
  data () {
      return {
          chartData: {
            labels: [],
            datasets: [],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            legend: { position: 'bottom' }
          }
      }
  },
  methods: {
    prepareData(rounds: ApiRound[]) {
      // label round numbers
      const labels: any[] = rounds.slice(0, rounds.length - 1).map(value => {
          return value.roundNumber
      })

      const goodIds = Object.keys(rounds[0].prices!)
      const pricesPerGood = goodIds.map(goodId => {
          return rounds.slice(0, rounds.length - 1).map(value => {
              if (value.prices) {
                  return value.prices[goodId]
              }
              return null
          }).filter(price => price !== null)
      })


      // get prices per round
      const data: any[] = goodIds.map((value, index) => {
          const good = auction.goodById()(value)
          return {
            label: good.name,
            data: pricesPerGood[index],
            fill: true,
            pointRadius: 0,
            steppedLine: true
          }
        }
      )

      return {
        labels: labels,
        datasets: data
      }
    }
  }
})

export default PriceDevelopmentChart
export { PriceDevelopmentChart }
</script>

<style scoped lang="scss">
@import '../../../custom.scss';


</style>
