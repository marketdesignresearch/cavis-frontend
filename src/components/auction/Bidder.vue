<template>
  <div class="card shadow-sm mb-3">
    <div class="card-body">
      <h6 class="card-subtitle mb-2 text-muted">{{ bidder.name }}</h6>
      
      <component :bidderId="bidder.id" :auctionId="auctionId" :selectedGoods="selectedGoods" :is="bidComponent"></component>

      <!--
      <div v-if="bids.length > 0">
        <button class="btn btn-sm btn-secondary" :id="'history-popover' + bidder.id">Bid History</button>
        <b-popover :target="'history-popover' + bidder.id" triggers="hover focus">
          <template slot="title">Past Bids</template>
          <div v-for="bid of bids" :key="bid.id">
            Bid: {{ bid.amount }} for 
            <ul>
              <li v-for="(good, index) in bid.bundle" :key="index">{{ good.amount }}x {{ good.good }}</li>   
            </ul>
          </div>
        </b-popover>
      </div>
      -->

    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import auction, { ApiAuctionType } from '../../store/modules/auction'

export default Vue.extend({
  name: 'AuctionBidder',
  props: ['bidder', 'auctionId', 'selectedGoods'],
  computed: {
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
.bidder {
  padding: 10px;
}
</style>
