<template>
  <div class="bidder-control" v-if="selectedBidder">
    <h4>Bidder {{ selectedBidder.name }}'s Values and Bids</h4>

    <p>This table shows the values for bundles you have previously selected in this round and all bids this bidder is about to submit.</p>

    <div
      v-intro="
        'The main purpose of this table is to give, for a specific bidder, an overview over<br>\
        (a) The current bids, and<br>\
        (b) The values for the so-far selected bundles.<br><br>\
        It has an entry for each bundle that has been selected (or bid on) before, and is sortable by all the columns. Thus, it is a tabular form of the so-far explored value function. \
        The big advantage of this representation is that it is useful in all domains, no matter how large it gets, by relying on the interactive design of CAVis.'
      "
      v-intro-position="'top'"
      v-intro-step="81"
    >
      <div class="table-responsive">
        <table class="table table-bordered table-bidder table-hover">
          <thead>
            <tr>
              <th @click="sortBy('entriesString')" class="parentHover" v-intro="'You can sort by bundle size, ...'" v-intro-step="82">
                Bundle
                <sort-marker :sortable="sort" :property="'entriesString'"></sort-marker>
              </th>
              <th @click="sortBy('value')" class="parentHover" v-intro="'... the bidder\'s value, ...'" v-intro-step="83">
                Value
                <font-awesome-icon icon="coins" />
                <sort-marker :sortable="sort" :property="'value'"></sort-marker>
              </th>
              <th
                @click="sortBy('price')"
                class="parentHover"
                v-if="pricedAuction"
                v-intro="'... the bundle\'s price, ...'"
                v-intro-step="84"
              >
                Price
                <font-awesome-icon icon="dollar-sign" />
                <sort-marker :sortable="sort" :property="'price'"></sort-marker>
              </th>
              <th
                @click="sortBy('utility')"
                class="parentHover"
                v-if="pricedAuction"
                v-intro="'... the bidder\'s utility, ...'"
                v-intro-step="85"
              >
                Utility
                <font-awesome-icon icon="wrench" />
                <sort-marker :sortable="sort" :property="'utility'"></sort-marker>
              </th>
              <th
                @click="sortBy('bid')"
                class="parentHover w-25"
                v-intro="
                  '... or the current bid on this bundle. Sorting that way will show you all the currently entered bids on top. You can also remove a bid directly in the table (this will keep the entry in the table, only removing the bundle\'s bid).'
                "
                v-intro-step="86"
              >
                Bid
                <font-awesome-icon icon="dollar-sign" />
                <sort-marker :sortable="sort" :property="'bid'"></sort-marker>
              </th>
              <th class="w-12-5"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(bundle, index) in goodCombinations"
              :key="'set' + index"
              :class="{ active: bundle.hash === selectedBundle.hash, disabled: !isAllowed(bundle) }"
              @click="selectGoods(bundle)"
            >
              <td>
                <good-badge :ids="bundle.entries" />
              </td>
              <td>{{ bundle.value | formatNumber }}</td>
              <td v-if="pricedAuction">{{ bundle.price | formatNumber }}</td>
              <td v-if="pricedAuction">{{ bundle.utility | formatNumber }}</td>
              <td>{{ bundle.bid | formatNumber }}</td>
              <td class="text-right">
                <button v-if="bundle.bid !== null" class="btn btn-outline-danger btn-sm" @click="removeBid(bundle)">
                  <font-awesome-icon icon="times" />Remove Bid
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
import auction, {
  ApiAuctionType,
  ApiBidder,
  ApiBid,
  ApiGood,
  ApiBundleEntry,
  ApiBundleEntryWrapper,
  ApiBidderStrategy
} from '../../store/modules/auction'
import BidderService from '../../services/bidder'
import GoodsService from '../../services/goods'
import selection from '../../store/modules/selection'
import hashBundle from '../../services/bundleHash'
import BigNumber from 'bignumber.js'

export default Vue.extend({
  name: 'BidderControl',
  components: {
    'bidder-circle': () => import('./BidderCircle.vue'),
    'good-badge': () => import('./GoodBadge.vue'),
    'sort-marker': () => import('../utils/sort-marker.vue')
  },
  props: ['auctionId'],
  data() {
    return {
      selectedBundleHash: null,
      sort: {
        sortBy: 'value',
        sortASC: false
      }
    }
  },
  computed: {
    selectedBidder(): ApiBidder | undefined {
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

        const sortedArray = Array.from(apiBundleEntryWrapper)
          .map(obj => {
            const value = GoodsService.valueForGood(obj, selection.selectedBidder()!)
            const price = GoodsService.priceForGood(this.$props.auctionId, obj, selection.selectedBidder()!)
            const bid = GoodsService.bidForGood(obj, selection.selectedBidder()!)
            return {
              hash: obj.hash,
              entries: obj.entries,
              entriesString: obj.entries.map(entry => entry.good).join().length,
              value: value,
              price: price,
              utility: value! - price!,
              bid: bid
            }
          })
          .sort((a, b) => {
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
      return goods.hash === selection.selectedBundle().hash
    },
    unselect() {
      this.$data.selectedBundleHash = null
    },
    unselectAll() {
      this.unselect()
      selection.commitUnselectGoods()
    },
    selectGoods(bundle: ApiBundleEntryWrapper, nullSelected = true) {
      if (nullSelected) {
        this.$data.selectedBundleHash = null
      }
      selection.commitUnselectGoods()
      bundle.entries.forEach(entry => selection.commitSelectGood({ goodId: entry.good }))
    },
    valueForGood(bundle: ApiBundleEntryWrapper) {
      return GoodsService.valueForGood(bundle, selection.selectedBidder()!)
    },
    priceForGood(bundle: ApiBundleEntryWrapper) {
      return GoodsService.priceForGood(this.$props.auctionId, bundle, selection.selectedBidder()!)
    },
    bidForGood(bundle: ApiBundleEntryWrapper): BigNumber | null {
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

.border-bottom {
  border-bottom: 1px solid rgba(0, 0, 0, 0.075);
}

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
