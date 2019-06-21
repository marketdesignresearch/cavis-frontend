<template>
  <div class="row">
    <div class="col">
      <div class="shadow-sm bidder text-center" :class="{ 'selected': isSelected }">
          {{ bidder.name }}
      </div>
    </div>
    <div class="col bidder-info">
      <span class="small" v-if="bidsPlaces">Bids placed</span><br>
      <span class="small truthful">Truthful</span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import auction, { ApiAuctionType, ApiBidder } from '../../store/modules/auction'

export default Vue.extend({
  name: 'AuctionBidder',
  props: ['bidder', 'auctionId', 'selectedGoods', 'isSelected'],
  computed: {
    bidsPlaces: function () {
      if (this.$props.bidder) {
        return (this.$props.bidder as ApiBidder).bids && (this.$props.bidder as ApiBidder).bids.length > 0
      }
      return false
    },
    bids: function () {
      return Array().concat(...Array.from({ length: auction.auctionById()(this.$route.params.id).auction.rounds.length }, (v, k) => k).map(value => {
        return auction.bidsByBidderId()(this.$props.auctionId, this.$props.bidder.id, value)
      }))
    },
    bidComponent: function () {
      const mechanismType = auction.auctionById()(this.$props.auctionId).auction.mechanismType
      return 'component-bid-' + mechanismType
    }
  }
});
</script>

<style scoped lang="scss">
@import '../../custom';

.bidder-info {
  font-size: 0.9em;
}

.truthful {
  font-weight: bold;
}

.bidder {
  background: white;
  margin-bottom: 50px;
  padding: 10px;
  padding-top: 25px;
  height: 70px;
  width: 70px;
  border-radius: 35px; 
}

.selected {
  border: 3px solid theme-color('success');
  padding-top: 21px;
}
</style>
