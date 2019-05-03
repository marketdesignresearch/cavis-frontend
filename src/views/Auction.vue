<template>
  <div>
    <h1>Auction View</h1>

    <span v-for="(item, index) in items" :key="'i' + index">
      <AuctionItem :item="item" />
    </span>
    
    <span v-for="(bidder, index) in bidders" :key="'b' + index">
      <AuctionBidder :bidder="bidder" />
    </span>

  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { AuctionItemComponent, IAuctionItem } from '@/components/auction/Item.vue'
import AuctionBidder from '@/components/auction/Bidder.vue'
import auction from '../store/modules/auction'

export default Vue.extend({
  name: 'AuctionTable',
  components: {
    'AuctionItem': AuctionItemComponent,
    'AuctionBidder': AuctionBidder
  },
  computed: {
    items () {
      return auction.state.items
    },
    bidders () {
      return auction.state.bidders
    }
  }
})
</script>

<style scoped lang="scss">

</style>
