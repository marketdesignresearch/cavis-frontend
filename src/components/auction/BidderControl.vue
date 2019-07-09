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
            <tr
              v-for="(goodSet, index) in goodCombinations"
              :key="'set' + index"
              :class="{ active: isActive(goodSet), disabled: !isAllowed(goodSet) }"
              @click="selectGoods(goodSet)"
            >
              <td><good-badge :ids="goodSet" /></td>
              <td>{{ valueForGood(goodSet) | formatNumber }}</td>
              <td v-if="pricedAuction">{{ priceForGood(goodSet) | formatNumber }}</td>
              <td v-if="pricedAuction">{{ (valueForGood(goodSet) - priceForGood(goodSet)) | formatNumber }}</td>
              <td>{{ bidForGood(goodSet) | formatNumber }}</td>
              <td>
                <button v-if="bidForGood(goodSet)" class="btn btn-delete btn-outline-secondary btn-sm" @click="removeBid(goodSet)">
                  X
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="col">
      <!-- <button class="btn btn-primary mx-2" @click="autoBid">Autobid</button> -->
      <component v-if="auctionType" :is="'component-bid-' + auctionType" :auctionId="auctionId"> </component>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import auction, { ApiAuctionType, ApiBidder, ApiBid, ApiGood } from '../../store/modules/auction'
import BidderService from '../../services/bidder'
import GoodsService from '../../services/goods'
import BidderCircleVue from './BidderCircle.vue'
import GoodBadgeComponent from './GoodBadge.vue'
import selection from '../../store/modules/selection'

export default Vue.extend({
  name: 'BidderControl',
  components: { 'bidder-circle': BidderCircleVue, 'good-badge': GoodBadgeComponent },
  props: ['auctionId'],
  computed: {
    selectedBidder() {
      const bidderId = selection.selectedBidder()
      if (bidderId) {
        return auction.bidderById()(bidderId)
      }
    },
    pricedAuction() {
      const currentAuction = auction.auctionById()(this.$props.auctionId)

      if (currentAuction.auctionType.indexOf('CCA') !== -1) {
        return true
      }

      return false
    },
    goodCombinations(): string[][] {
      return GoodsService.goodCombinations(this.$props.auctionId)
    },
    auctionType() {
      if (!this.$props.auctionId) return null
      const auctionInstance = auction.auctionById()(this.$props.auctionId)
      return auctionInstance.auctionType
    }
  },
  methods: {
    isAllowed(goods: string[]): boolean {
      return GoodsService.isAllowed(selection.selectedBidder(), this.$props.auctionId)
    },
    isActive(goods: ApiGood[]): boolean {
      if (!this.$props.selectedGoods) {
        return false
      }
      return (
        goods
          .map((obj: ApiGood) => obj.id)
          .sort()
          .join() ===
        Array.from(this.$props.selectedGoods)
          .sort()
          .join()
      )
    },
    selectGoods(goodIds: string[]) {
      selection.commitUnselectGoods()
      goodIds.forEach(id => selection.commitSelectGood({ goodId: id }))
    },
    valueForGood(goodIds: string[]) {
      return GoodsService.valueForGood(goodIds, selection.selectedBidder()!)
    },
    priceForGood(goodIds: string[]) {
      return GoodsService.priceForGood(this.$props.auctionId, goodIds, selection.selectedBidder()!)
    },
    bidForGood(goodIds: string[]) {
      return GoodsService.bidForGood(goodIds, selection.selectedBidder()!)
    },
    autoBid() {
      BidderService.autoBid(this.$props.auctionId, selection.selectedBidder()!)
    },
    removeBid(goodSet: string[]) {
      BidderService.removeBid(selection.selectedBidder()!, goodSet)
    }
  }
})
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
