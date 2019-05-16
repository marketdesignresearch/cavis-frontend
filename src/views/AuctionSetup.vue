<template>
  <div class="container">
    <h1>Setup an Auction</h1>
    <AuctionSetup @createAuction="createAuction" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import AuctionSetup from '@/components/auction/Setup.vue'
import auction, { ApiAuctionType, ApiAuction, ApiBid } from '../store/modules/auction'

export default Vue.extend({
  name: 'AuctionSetupView',
  components: {
    'AuctionSetup': AuctionSetup
  },
  methods: {
    auctionCreated() {

    },
    createAuction(model: any) {
      /*
      auction.dispatchCreateAuction({ bidders: [
        {"id":"B1","value":{"bundleValues":[]}},
        {"id":"B2","value":{"bundleValues":[]}},
        {"id":"B3","value":{"bundleValues":[]}}
      ], goods: [
      {"id":"item","availability":1,"dummyGood":false}
      ]})
      */

      // mock creation using store
      const auctionObj: ApiAuction = {
        bidders: [], 
        goods: [],
        id: '1',
        type: ApiAuctionType.SINGLE_ITEM_SECOND_PRICE
      }

      console.log(model)

      for (let i = 0; i < model.numberOfBidders; i++) {
        auctionObj.bidders.push({ id: `Bidder ${i}`, bids: [] })
      }

      for (let i = 0; i < model.numberOfGoods; i++) {
        auctionObj.goods.push({ id: `Good ${i}`, availability: 1, dummyGood: false })
      }

      auction.commitAppendAuction({ auction: auctionObj })

      this.$router.push({ name: 'auction', params: { id: '1' } })
    }
  },
})
</script>

<style scoped lang="scss">
</style>
