<template>
  <div class="bidder-control" v-if="selectedBidder">
    <bidder-circle :name="selectedBidder.name" class="selected bidder-circle" />
    <div>
      <div class="table-responsive">
        <table class="table table-bidder table-hover">
          <thead>
            <tr>
              <th class="w-25">Currently Selected Bundle</th>
              <th>Value <font-awesome-icon icon="coins" /></th>
              <th v-if="pricedAuction">Price <font-awesome-icon icon="coins" /></th>
              <th v-if="pricedAuction">Utility <font-awesome-icon icon="wrench" /></th>
              <th class="w-25">Bid <font-awesome-icon icon="coins" /></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><good-badge :ids="selectedBundle.entries" /></td>
              <td>{{ valueForGood(selectedBundle) | formatNumber }}</td>
              <td v-if="pricedAuction">{{ priceForGood(selectedBundle) | formatNumber }}</td>
              <td v-if="pricedAuction">{{ (valueForGood(selectedBundle) - priceForGood(selectedBundle)) | formatNumber }}</td>
              <td>
                <component v-if="auctionType" :is="'component-bid-' + auctionType" :auctionId="auctionId"> </component>
              </td>
              <td class="text-right">
                <button v-if="bidForGood(selectedBundle)" class="btn btn-outline-danger btn-sm" @click="removeBid(selectedBundle)">
                  Remove Bid <font-awesome-icon icon="trash-alt" />
                </button>
              </td>
            </tr>
          </tbody>
          <thead>
            <tr>
              <th @click="sortBy('entriesString')" class="parentHover">Bundle <sort-marker :sortable="sort" :property="'entriesString'"></sort-marker></th>
              <th @click="sortBy('value')" class="parentHover">Value <font-awesome-icon icon="coins" /> <sort-marker :sortable="sort" :property="'value'"></sort-marker></th>
              <th @click="sortBy('price')" class="parentHover" v-if="pricedAuction">Price <font-awesome-icon icon="coins" /> <sort-marker :sortable="sort" :property="'price'"></sort-marker></th>
              <th @click="sortBy('utility')" class="parentHover" v-if="pricedAuction">Utility <font-awesome-icon icon="wrench" /> <sort-marker :sortable="sort" :property="'utility'"></sort-marker></th>
              <th @click="sortBy('bid')" class="parentHover">Bid <font-awesome-icon icon="coins" /> <sort-marker :sortable="sort" :property="'bid'"></sort-marker></th>
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
              <td><good-badge :ids="bundle.entries" /></td>
              <td>{{ bundle.value | formatNumber }}</td>
              <td v-if="pricedAuction">{{ bundle.price | formatNumber }}</td>
              <td v-if="pricedAuction">{{ bundle.utility | formatNumber }}</td>
              <td>{{ bundle.bid | formatNumber }}</td>
              <td class="text-right">
                <button v-if="bundle.bid" class="btn btn-outline-danger btn-sm" @click="removeBid(bundle)">
                  Remove Bid <font-awesome-icon icon="trash-alt" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import auction, { ApiAuctionType, ApiBidder, ApiBid, ApiGood, ApiBundleEntry, ApiBundleEntryWrapper } from '../../store/modules/auction'
import BidderService from '../../services/bidder'
import GoodsService from '../../services/goods'
import BidderCircleVue from './BidderCircle.vue'
import GoodBadgeComponent from './GoodBadge.vue'
import selection from '../../store/modules/selection'
import hashBundle from '../../services/bundleHash'
import SortMarker from '../utils/sort-marker.vue'

export default Vue.extend({
  name: 'BidderControl',
  components: { 
    'bidder-circle': BidderCircleVue,
    'good-badge': GoodBadgeComponent,
    'sort-marker': SortMarker
  },
  props: ['auctionId'],
  data () {
    return {
      sort: {
        sortBy: 'value',
        sortASC: false
      }
    }
  },
  computed: {
    selectedBidder() {
      const bidderId = selection.selectedBidder()
      if (bidderId) {
        return auction.bidderById()(bidderId)
      }
    },
    selectedBundle(): ApiBundleEntryWrapper {
      return selection.selectedBundle()
    },
    pricedAuction() {
      const currentAuction = auction.auctionById()(this.$props.auctionId)

      if (Object.keys(currentAuction.auction.currentPrices).length > 0) {
        return true
      }

      return false
    },
    goodCombinations(): ApiBundleEntryWrapper[] {
      const bidderId = selection.selectedBidder()
      if (bidderId) {
        const apiBundleEntryWrapper = GoodsService.bundleForBidder(bidderId)
        
        const sortedArray = Array.from(apiBundleEntryWrapper).map(obj => {
          const value = GoodsService.valueForGood(obj, selection.selectedBidder()!)
          const price = GoodsService.priceForGood(this.$props.auctionId, obj, selection.selectedBidder()!)
          return {
            hash: obj.hash,
            entries: obj.entries,
            entriesString: obj.entries.map(entry => entry.good).join(),
            value: value,
            price: price,
            bid: value! - price!
          }
        }).sort((a, b) => {
          if (!this.sort.sortASC) {
            return (a as any)[this.sort.sortBy] >= (b as any)[this.sort.sortBy] ? -1 : 1
          }
          return (a as any)[this.sort.sortBy] < (b as any)[this.sort.sortBy] ? -1 : 1
        })

        return sortedArray
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
    sortBy(property: string) {
      this.sort.sortASC = !this.sort.sortASC
      this.sort.sortBy = property
    },
    isAllowed(goods: ApiBundleEntryWrapper): boolean {
      return GoodsService.isAllowed(goods, selection.selectedBidder(), this.$props.auctionId)
    },
    isActive(goods: ApiBundleEntryWrapper): boolean {
      if (!this.$props.selectedGoods) {
        return false
      }
      return goods.hash === hashBundle(this.$props.selectedGoods)
    },
    selectGoods(bundle: ApiBundleEntryWrapper) {
      selection.commitUnselectGoods()
      bundle.entries.forEach(entry => selection.commitSelectGood({ goodId: entry.good }))
    },
    valueForGood(bundle: ApiBundleEntryWrapper) {
      return GoodsService.valueForGood(bundle, selection.selectedBidder()!)
    },
    priceForGood(bundle: ApiBundleEntryWrapper) {
      return GoodsService.priceForGood(this.$props.auctionId, bundle, selection.selectedBidder()!)
    },
    bidForGood(bundle: ApiBundleEntryWrapper) {
      return GoodsService.bidForGood(bundle, selection.selectedBidder()!)
    },
    removeBid(bundle: ApiBundleEntryWrapper) {
      BidderService.removeBid(selection.selectedBidder()!, bundle)
    }
  }
})
</script>

<style scoped lang="scss">
@import '../../custom';

.bidder-control {
  position: relative;
}

.bidder-circle {
  position: relative;
  top: -60px;
  left: 50%;
  margin-left: -35px;
}

tr.active {
  background-color: rgba(0, 0, 0, 0.075);
}

tr.hover {
  cursor: pointer;
}

tr.disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>
