<template>
  <div class="row" v-if="selectedBidder">
      <bidder-circle :name="selectedBidder.name" class="selected bidder-circle" />
      <div class="col">
          <div class="table-responsive">
            <table class="table table-bidder table-hover">
                <thead>
                    <tr>
                        <th>Good</th>
                        <th>Value</th>
                        <th v-if="pricedAuction">Price</th>
                        <th v-if="pricedAuction">Utility</th>
                        <th>Bid</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(goodSet, index) in goodCombinations" :key="'set' + index" :class="{ 'active' : isActive(goodSet), 'disabled': !isAllowed(goodSet) }" @click="selectGoods(goodSet)">
                        <td><good-badge :goods="goodSet" /></td>
                        <td>{{ valueForGood(goodSet) }}</td>
                        <td v-if="pricedAuction">{{ priceForGood(goodSet) }}</td>
                        <td v-if="pricedAuction">{{ valueForGood(goodSet) - priceForGood(goodSet) }}</td>
                        <td>{{ bidForGood(goodSet) }}</td>
                        <td>
                            <button v-if="bidForGood(goodSet)" class="btn btn-delete btn-outline-secondary btn-sm" @click="removeBid(goodSet)">X</button>
                        </td>
                    </tr>
                </tbody>
            </table>
          </div>
      </div>
      <div class="col">
          <!-- <button class="btn btn-primary mx-2" @click="autoBid">Autobid</button> -->
          <component 
            v-if="auctionType"  
            :is="'component-bid-' + auctionType"
            :auctionId="auctionId" 
            :bidder="selectedBidder" 
            :selectedGoods="selectedGoods"
            >
        </component>
      </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import auction, { ApiAuctionType, ApiBidder, ApiBid, ApiGood } from '../../store/modules/auction'
import BidderService from '../../services/bidder'
import GoodsService from '../../services/goods'
import BidderCircleVue from './BidderCircle.vue';
import GoodBadgeComponent from './GoodBadge.vue';

export default Vue.extend({
  name: 'BidderControl',
  components: { 'bidder-circle': BidderCircleVue, 'good-badge': GoodBadgeComponent }, 
  props: ['selectedBidder', 'selectedGoods', 'auctionId'],
  computed: {
    pricedAuction () {
        const currentAuction = auction.auctionById()(this.$props.auctionId)

        if (currentAuction.auctionType.indexOf('CCA') !== -1) {
            return true
        }

        return false
    },
    goodCombinations (): ApiGood[][] {
        return GoodsService.goodCombinations(this.$props.auctionId)
    },
    auctionType () {
        if (!this.$props.auctionId) return null
        const auctionInstance = auction.auctionById()(this.$props.auctionId)
        return auctionInstance.auctionType
    }
  },
  methods: {
      isAllowed(goods: ApiGood[]): boolean {
        return GoodsService.isAllowed(this.$props.selectedBidder, this.$props.auctionId, goods)
      },
      isActive(goods: ApiGood[]): boolean {
          if (!this.$props.selectedGoods) {
              return false
          }
          return goods.map((obj: ApiGood) => obj.id).sort().join() === Array.from(this.$props.selectedGoods).sort().join()
      },
      selectGoods(goods: ApiGood[]) {
          this.$emit('selectGoods', goods.map(goods => goods.id))
      },
      valueForGood(goods: ApiGood[]) {
          return GoodsService.valueForGood(this.$props.selectedBidder, goods)
      },
      priceForGood(goods: ApiGood[]) {
          return GoodsService.priceForGood(this.$props.selectedBidder, this.$props.auctionId, goods)
      },
      bidForGood(goods: ApiGood[]) {
          return GoodsService.bidForGood(this.$props.selectedBidder, goods)
      },
      autoBid() {
          BidderService.autoBid(this.$props.auctionId, this.$props.selectedBidder)
      },
      removeBid(goodSet: ApiGood[]) {
          BidderService.removeBid(this.$props.auctionId, this.$props.selectedBidder, goodSet)
      }
  }
});
</script>

<style scoped lang="scss">
@import '../../custom';

.bidder-circle {
    position: relative;
    top: -60px;
    left: 50%;
    padding-left: -50px;
}

tr.active {
    background-color: rgba(0, 0, 0, 0.075);
}

tr.disabled {
    opacity: 0.5;
    pointer-events: none;
}

</style>
