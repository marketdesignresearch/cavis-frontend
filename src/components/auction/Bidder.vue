<template>
  <div class="bidder-container" :class="{ 'selected': isSelected }">
  <div class="row">
    <div class="col">
      <bidder-circle :name="bidder.name" :class="{ 'selected': isSelected }" />
    </div>
    <div class="col bidder-info">
      <span class="small" v-if="bidsPlaces">Bids placed</span>
      <el-select disabled v-model="strategy">
        <el-option value="truthful" label="Truthful"></el-option>
      </el-select>
    </div>
  </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import auction, { ApiAuctionType, ApiBidder } from '../../store/modules/auction'
import { Select, Option } from 'element-ui'
import BidderCircleVue from './BidderCircle.vue';

export default Vue.extend({
  name: 'AuctionBidder',
  components: { 'bidder-circle': BidderCircleVue, 'el-select': Select, 'el-option': Option }, 
  props: ['bidder', 'auctionId', 'selectedGoods', 'isSelected'],
  data () {
    return {
      strategy: 'truthful'
    }
  },
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

.bidder-container {
  padding: 15px;
  border-radius: 10px;

  &.selected {
    background-color: white;
  }
}

.truthful {
  font-weight: bold;
}
</style>
