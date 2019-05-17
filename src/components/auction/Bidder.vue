<template>
  <div>
    {{ bidder.id }}
    <AuctionBid :bidderId="bidder.id" :auctionId="auctionId" :selectedGoods="selectedGoods" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import AuctionBid from './Bid.vue'

export default Vue.extend({
  components: {
    AuctionBid: AuctionBid
  },
  name: 'AuctionBidder',
  props: ['bidder', 'auctionId', 'selectedGoods']
});
</script>

<style scoped lang="scss">
.bidder {
  margin: 5px;
  display: inline-flex;
}
</style>
