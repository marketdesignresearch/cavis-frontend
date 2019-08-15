<script lang="ts">
import { mixins, Line } from 'vue-chartjs'
import Vue from 'vue'
import auction, { ApiRound } from '../../../store/modules/auction'
const { reactiveData } = mixins

const OverDemandChart = Vue.extend({
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
                  labelString: 'Overdemand'
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
      ;(this as any).renderChart(this.prepareData(this.$props.rounds.filter((round: ApiRound)  => round.overDemand)), this.$data.options)
    },
    prepareData(rounds: ApiRound[]) {
      // label round numbers
      const labels: any[] = rounds.map(value => {
          return value.roundNumber
      })

      let goodIds = Object.keys(rounds[0].overDemand!) 

      if (this.$props.goodIds && this.$props.goodIds.length > 0) {
        goodIds = this.$props.goodIds
      }

      const overDemandPerGood = goodIds.map(goodId => {
          return rounds.map(value => {
              return value.overDemand![goodId]
          })
      })

      // get prices per round
      const data: any[] = goodIds.map((value, index) => {
          const good = auction.goodById()(value)
          return {
            label: good.name,
            data: overDemandPerGood[index]
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

export default OverDemandChart
export { OverDemandChart }
</script>

<style scoped lang="scss">
@import '../../../custom.scss';


</style>
