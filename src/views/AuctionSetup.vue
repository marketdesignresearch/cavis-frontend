<template>
<div>
  <div class="container">
    <h1>Setup an Auction</h1>
    <AuctionSetup class="content" @createAuction="createAuction" />
  </div>
  <AuctionProgress stage="setup" />
</div>
</template>

<script lang="ts">
import Vue from 'vue'
import AuctionSetup from '@/components/auction/Setup.vue'
import AuctionProgress from '@/components/auction/Progress.vue'
import auction, { ApiAuctionType, ApiAuction, ApiBid, ApiAuctionCreateDTO, ApiDomainType } from '../store/modules/auction'

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
        domain: {
          type: ApiDomainType.UNIT_DEMAND_VALUE,
          bidders: [], 
          goods: [],
        },
        auctionType: model.mechanismType
      }

      for (let i = 0; i < model.numberOfBidders; i++) {
        auctionObj.domain.bidders.push({ name: `B${i+1}`, bids: [] })
      }

      const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',' Y', 'Z']

      for (let i = 0; i < model.numberOfGoods; i++) {
        auctionObj.domain.goods.push({ id: alphabet[i], availability: 1, dummyGood: false, isSelected: false })
      }

      const { uuid } = await auction.dispatchCreateAuction({ auctionCreateDTO: auctionObj })
      this.$router.push({ name: 'auction', params: { id: uuid } })
    }
  },
})
</script>

<style scoped lang="scss">
.content {
  display: flex;
  min-height: 80vh;
  flex-direction: column;
}
</style>
