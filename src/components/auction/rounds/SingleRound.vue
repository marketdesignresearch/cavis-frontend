<template>
  <div>
    <button class="btn btn-success btn-sm" @click="getAuctionResults()">Get Auction Results</button>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import auction, { ApiAuctionType, ApiAuction, ApiBid } from '../../../store/modules/auction'
import selection from '../../../store/modules/selection'
import RoundMixinVue from './RoundMixin.vue'

export default Vue.extend({
  props: ['auction'],
  mixins: [RoundMixinVue],
  computed: {
    auctionType() {
      switch (this.$props.auction.auctionType) {
        case ApiAuctionType.SINGLE_ITEM_FIRST_PRICE:
          return 'First Price Auction'
        case ApiAuctionType.SINGLE_ITEM_SECOND_PRICE:
          return 'Second Price Auction'
        case ApiAuctionType.SIMULTANEOUS_FIRST_PRICE:
          return 'Simultaneous Multi-Item First Price Auction'
        case ApiAuctionType.SIMULTANEOUS_FIRST_PRICE:
          return 'Simultaneous Multi-Item Second Price Auction'
        case ApiAuctionType.VCG:
          return 'VCG Auction'
        default:
          return ''
      }
    }
  },
  methods: {
    async getAuctionResults() {
      const currentAuction = auction.auctionById()(this.$route.params.id)
      if (!currentAuction.auction.finished) {
        const result = await auction.dispatchPlaceBids({ auctionId: this.$props.auction.id })
      }
      selection.commitUnselectAll()
      this.$router.push({ name: 'auction-result', query: { auctions: [this.$props.auction.id] } })
    }
  }
})
</script>

<style scoped lang="scss"></style>
