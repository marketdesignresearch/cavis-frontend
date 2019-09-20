<template>
  <div>
    <div class="pvm d-inline-block">
      <div class="pvm-title">
        <span>PVM</span>
      </div>
      <div class="row">
        <div class="col">Reported Value:</div>
        <div class="col">Predicted Value:</div>
        <div class="w-100"></div>
        <div class="col">{{ reportedValue }}</div>
        <div class="col">{{ predictedValue }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import selection from '@/store/modules/selection'
import auction from '@/store/modules/auction'
import api from '../../../services/api'

export default Vue.extend({
  props: ['auctionId'],
  watch: {
    selectedGoods() {
      //;(this as any).determinePredicted()
    },
    selectedBidder() {
      //;(this as any).determinePredicted()
    }
  },
  computed: {
    reportedValue(): number | string {
      const selectedBundle = selection.selectedBundle().hash
      const selectedBidder = selection.selectedBidder()

      let reportedValue: string | number = '-'

      if (this.$props.auctionId) {
        const auctionInstance = auction.auctionById()(this.$props.auctionId)

        auctionInstance.auction.rounds.forEach(round => {
          const found = round.bids.find(bid => bid.bidderId === selectedBidder && bid.bundle.hash === selectedBundle)
          if (found) {
            reportedValue = found.value!
          }
        })
      }

      return reportedValue
    },
    predictedValue(): number | string {
      return '-'
    }
  },
  methods: {
    async determinePredicted() {
      const selectedBidder = selection.selectedBidder()

      const bundle: { [x: string]: number } = {}

      Object.keys(selection.state().selectedGoods).forEach(key => {
        bundle[key] = 1
      })

      bundle[this.$props.goodId] = 1

      const valueQuery = {
        bidders: [selectedBidder],
        bundles: [bundle]
      }

      const { data: valueQueryResult } = await api().post(`/auctions/${this.$props.auctionId}/valuequery`, valueQuery)
      this.$data.proposedBundleValue = valueQueryResult[0].value
    }
  }
})
</script>

<style scoped lang="scss">
@import '../../../custom.scss';

.pvm-title {
  text-align: center;
  position: absolute;
  top: -15px;
  width: 100%;

  span {
    background: #563d7c;
    border-radius: 10px;
    padding: 0px 10px;
  }
}

.pvm {
  position: relative;
  font-size: 0.8rem;
  background: #563d7c;
  color: $light;
  border-radius: 10px;
  padding: 10px 0px;
  margin: 10px 0px;
}
</style>
