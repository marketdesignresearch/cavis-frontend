<template>
  <div class="container">
    <h1>Setup an Auction</h1>
    <AuctionSetup @createAuction="createAuction" />

    <AuctionProgress stage="setup" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import AuctionSetup from '@/components/auction/Setup.vue'
import AuctionProgress from '@/components/auction/Progress.vue'
import auction, { ApiAuctionType, ApiAuction, ApiBid, ApiAuctionCreateDTO } from '../store/modules/auction'

export default Vue.extend({
  name: 'AuctionSetupView',
  components: {
    'AuctionSetup': AuctionSetup,
    'AuctionProgress': AuctionProgress
  },
  methods: {
    auctionCreated() {

    },
    async createAuction(model: any) {
      // mock creation using store
      const auctionObj: ApiAuctionCreateDTO = {
        setting: {
          type: 'simple',
          bidders: [], 
          goods: [],
        },
        type: model.mechanismType
      }

      for (let i = 0; i < model.numberOfBidders; i++) {
        auctionObj.setting.bidders.push({ id: `Bidder#${i+1}`, bids: [] })
      }

      for (let i = 0; i < model.numberOfGoods; i++) {
        auctionObj.setting.goods.push({ id: `Good#${i+1}`, availability: 1, dummyGood: false, isSelected: false })
      }

      const { uuid } = await await auction.dispatchCreateAuction({ auctionCreateDTO: auctionObj })

      this.$router.push({ name: 'auction', params: { id: uuid } })
    }
  },
})
</script>

<style scoped lang="scss">
</style>
