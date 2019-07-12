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
              v-for="(bundle, index) in goodCombinations"
              :key="'set' + index"
              :class="{ active: isActive(bundle), disabled: !isAllowed(bundle) }"
              @click="selectGoods(bundle)"
            >
              <td><good-badge :ids="bundle" /></td>
              <td>$ {{ valueForGood(bundle) | formatNumber }}</td>
              <td v-if="pricedAuction">$ {{ priceForGood(bundle) | formatNumber }}</td>
              <td v-if="pricedAuction">$ {{ (valueForGood(bundle) - priceForGood(bundle)) | formatNumber }}</td>
              <td>{{ bidForGood(bundle) | formatNumber }}</td>
              <td>
                <button v-if="bidForGood(bundle)" class="btn btn-delete btn-outline-secondary btn-sm" @click="removeBid(bundle)">
                  X
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="col">
      <component v-if="auctionType" :is="'component-bid-' + auctionType" :auctionId="auctionId"> </component>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import auction, { ApiAuctionType, ApiBidder, ApiBid, ApiGood, ApiBundleEntry } from '../../store/modules/auction'
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

      if (Object.keys(currentAuction.auction.currentPrices).length > 0) {
        return true
      }

      return false
    },
    goodCombinations(): ApiBundleEntry[][] {
      const bidderId = selection.selectedBidder()
      if (bidderId) {
        return GoodsService.bundleForBidder(bidderId)
      }
      return []
    },
    auctionType() {
      if (!this.$props.auctionId) return null
      const auctionInstance = auction.auctionById()(this.$props.auctionId)
      return auctionInstance.auctionType
    }
  },
  methods: {
    isAllowed(goods: ApiBundleEntry[]): boolean {
      return GoodsService.isAllowed(goods, selection.selectedBidder(), this.$props.auctionId)
    },
    isActive(goods: ApiBundleEntry[]): boolean {
      if (!this.$props.selectedGoods) {
        return false
      }
      return (
        goods
          .map((obj: ApiBundleEntry) => obj.good) // TODO: Also consider multi-availability goods
          .sort()
          .join() ===
        Array.from(this.$props.selectedGoods)
          .sort()
          .join()
      )
    },
    selectGoods(bundle: ApiBundleEntry[]) {
      selection.commitUnselectGoods()
      bundle.forEach(entry => selection.commitSelectGood({ goodId: entry.good }))
    },
    valueForGood(bundle: ApiBundleEntry[]) {
      return GoodsService.valueForGood(bundle, selection.selectedBidder()!)
    },
    priceForGood(bundle: ApiBundleEntry[]) {
      return GoodsService.priceForGood(this.$props.auctionId, bundle, selection.selectedBidder()!)
    },
    bidForGood(bundle: ApiBundleEntry[]) {
      return GoodsService.bidForGood(bundle, selection.selectedBidder()!)
    },
    removeBid(bundle: ApiBundleEntry[]) {
      BidderService.removeBid(selection.selectedBidder()!, bundle)
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
