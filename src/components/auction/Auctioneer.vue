<template>
  <div>
    Hi  
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import auction, { ApiAuctionType } from '../../store/modules/auction'

export default Vue.extend({
  name: 'AuctionAuctioneer',
  props: ['auctionId'],
  computed: {
    bidComponent: function () {
      const mechanismType = auction.auctionById()(this.$props.auctionId).auction.mechanismType
      return 'component-bid-' + mechanismType
    }
  }
});
</script>

<style scoped lang="scss">
.bidder {
  padding: 10px;
}
</style>
