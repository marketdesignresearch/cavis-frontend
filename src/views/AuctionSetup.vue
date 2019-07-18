<template>
  <div>
    <div class="container">
      <h1>Setup an Auction</h1>
      <AuctionSetup class="content" @createAuction="createAuction" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import AuctionSetup from '@/components/auction/Setup.vue'
import auction, {
  ApiAuctionType,
  ApiAuction,
  ApiBid,
  ApiAuctionCreateDTO,
  ApiDomainType,
  ApiBidderStrategy
} from '../store/modules/auction'

export default Vue.extend({
  name: 'AuctionSetupView',
  components: {
    AuctionSetup: AuctionSetup
  },
  methods: {
    auctionCreated() {},
    async createAuction(model: any) {
      // mock creation using store
      const auctionObj: ApiAuctionCreateDTO = {
        domain: {
          type: model.domainType,
          bidders: [],
          goods: []
        },
        auctionType: model.auctionType
      }

      for (let i = 0; i < model.numberOfBidders; i++) {
        auctionObj.domain.bidders.push({ name: `B${i + 1}`, defaultStrategy: model.defaultStrategy, min: model.bidder.min, max: model.bidder.max })
      }

      const alphabet = [
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
        'L',
        'M',
        'N',
        'O',
        'P',
        'Q',
        'R',
        'S',
        'T',
        'U',
        'V',
        'W',
        'X',
        'Y',
        'Z'
      ]

      for (let i = 0; i < model.numberOfGoods; i++) {
        auctionObj.domain.goods.push({ name: alphabet[i], availability: 1, dummyGood: false, isSelected: false })
      }

      const { id } = await auction.dispatchCreateAuction({ auctionCreateDTO: auctionObj })
      this.$router.push({ name: 'auction', params: { id: id } })
    }
  }
})
</script>

<style scoped lang="scss">
.content {
  display: flex;
  min-height: 80vh;
  flex-direction: column;
}
</style>
