<template>
  <div class="bidder-container" :class="{ selected: isSelected }">
    <div class="row">
      <div class="col">
        <bidder-circle
          v-b-tooltip.hover
          :title="bidder.description"
          :bidder="bidder"
          showStrategy="true"
          :class="{ selected: isSelected, bidsPlaced: bidsPlaced(bidder) }"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import auction, { ApiAuctionType, ApiBidder } from '../../store/modules/auction'
import BidderCircleVue from './BidderCircle.vue'
import selection from '../../store/modules/selection'

export default Vue.extend({
  name: 'AuctionBidder',
  components: { 'bidder-circle': BidderCircleVue },
  props: ['bidderId', 'auctionId'],
  methods: {
    bidsPlaced(bidder: ApiBidder) {
      if (bidder) {
        return bidder.bids && bidder.bids.length > 0
      }
      return false
    }
  },
  computed: {
    bidder: function(): ApiBidder {
      return auction.bidderById()(this.$props.bidderId)
    },
    isSelected: function() {
      return selection.selectedBidder() === this.$props.bidderId
    },
    bidComponent: function() {
      const mechanismType = auction.auctionById()(this.$props.auctionId).auction.mechanismType
      return 'component-bid-' + mechanismType
    }
  }
})
</script>

<style scoped lang="scss">
@import '../../custom';

.bidder-info {
  font-size: 0.9em;
}

.bidder-container {
  padding-bottom: 70px;
  border-radius: 10px;

  &.selected, &:hover {
    //background-color: white;
  }
}

.truthful {
  font-weight: bold;
}
</style>
