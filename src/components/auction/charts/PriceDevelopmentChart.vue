<script lang="ts">
import { mixins, Line } from 'vue-chartjs'
import Vue from 'vue'
import auction, { ApiRound } from '../../../store/modules/auction'
const { reactiveData } = mixins

const PriceDevelopmentChart = Vue.extend({
  extends: Line,
  props: ['rounds', 'goodIds'],
  mounted () {
    this.updateChart()
  },
  data () {
      return {
          options: {
            responsive: true,
            legend: { position: 'bottom' },
            scales: {
              xAxes: [{
                scaleLabel: {
                  display: true,
                  labelString: 'Rounds'
                }
              }],
              yAxes: [{
                scaleLabel: {
                  display: true,
                  labelString: 'Price'
                },
                ticks: {
                    beginAtZero: true
                  }
              }]
            }
          }
      }
  },
  methods: {
    updateChart() {
      ;(this as any).renderChart(this.prepareData(this.$props.rounds.filter((round: ApiRound)  => round.prices)), this.$data.options)
    },
    prepareData(rounds: ApiRound[]) {
      // label round numbers
      const labels: any[] = rounds.map(value => {
          return value.roundNumber
      })

      let goodIds = Object.keys(rounds[0].prices!) 

      if (this.$props.goodIds && this.$props.goodIds.length > 0) {
        goodIds = this.$props.goodIds
      }

      const pricesPerGood = goodIds.map(goodId => {
          return rounds.map(value => {
              return value.prices![goodId]
          })
      })

      // get prices per round
      const data: any[] = goodIds.map((value, index) => {
          const good = auction.goodById()(value)
          return {
            label: good.name,
            data: pricesPerGood[index]
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
