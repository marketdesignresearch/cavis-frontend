<template>
  <div class="row" v-if="bidder">
      <div class="col">
          <table class="table-sm">
              <thead>
                  <tr>
                    <th>Good</th>
                    <th>Value</th>
                    <th>Bid</th>
                  </tr>
              </thead>
              <tbody>
                  <tr v-for="good in allGoods" :key="good.id">
                      <td>{{ good.id }}</td>
                      <td>{{ valueForGood(good) }}</td>
                      <td>{{ bidForGood(good) }}</td>
                    </tr>
               </tbody>
          </table>
      </div>
      <div class="col">
          <button class="btn btn-primary mx-2" @click="autoBid">Autobid</button>
          {{ bidder.value.bundleValues }}
      </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import auction, { ApiAuctionType, ApiBidder, ApiBid, ApiGood } from '../../store/modules/auction'
import BidderService from '../../services/bidder'

export default Vue.extend({
  name: 'BidderControl',
  props: ['bidder', 'goods', 'auctionId'],
  computed: {
    allGoods () {
      const goods = auction.goodsById()(this.$props.auctionId)
      return goods
    }
  },
  methods: {
      valueForGood(good: ApiGood) {
          if (this.$props.bidder.value.bundleValues) {
              const correctValue = this.$props.bidder.value.bundleValues.find((bid: ApiBid) => (bid.bundle as any).find((obj: any) => obj.good === good.id))
              return correctValue ? correctValue.amount : null
          }
          return null
      },
      bidForGood(good: ApiGood) {
          if (this.$props.bidder.bids) {
            const correctBid = this.$props.bidder.bids.find((bid: ApiBid) => (bid.bundle as any)[good.id] !== undefined)
            return correctBid ? correctBid.amount : null
          }
          return null
      },
      autoBid() {
          BidderService.autoBid(this.$props.auctionId, this.$props.bidder)
      }
  }
});
</script>

<style scoped lang="scss">
@import '../../custom';


</style>
