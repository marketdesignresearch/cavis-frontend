<template>
  <div>
    <div class="table-responsive">
      <table class="table table-bidder table-hover">
        <thead>
          <tr>
            <th>Selected Bundle</th>
            <th>Bid</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="selectedGoods.length > 0 && allowedToBid">
            <td>
              <good-badge :ids="selectedGoods" />
            </td>
            <td>
              <input v-model="bid" type="text" class="form-control" placeholder="Your Bid" :disabled="bidEditable" />
            </td>
            <td class="text-right">
              <button @click="placeBid" :disabled="!isAllowed" class="btn btn-primary btn-sm float-right">Bid</button>
            </td>
          </tr>
          <tr v-if="selectedGoods.length === 0 && allowedToBid">
            <td class="text-center" colspan="3">
              Select a good to bid on it
            </td>
          </tr>
          <tr v-if="!allowedToBid">
            <td class="text-center" colspan="3">
              You have reached the maximum amount of bids.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import auction, { ApiAuctionType, ApiAuction, ApiBid, ApiBidder, ApiBundleEntry } from '../../../store/modules/auction'
import GoodBadgeComponent from '../GoodBadge.vue'
import BidderService from '@/services/bidder'
import GoodsService from '@/services/goods'
import selection from '../../../store/modules/selection'
import { mapGetters } from 'vuex'

export default Vue.extend({
  props: ['auctionId'],
  components: {
    'good-badge': GoodBadgeComponent
  },
  data() {
    return {
      bid: null
    }
  },
  computed: {
    ...mapGetters('selection', ['selectedGoods', 'selectedBidder']),
    bidEditable: function() {
      const auctionInstance = auction.auctionById()(this.$props.auctionId)
      return auctionInstance.auction.currentRoundType && auctionInstance.auction.currentRoundType === 'Clock Round'
    },
    isAllowed(): boolean {
      const bidderId = selection.selectedBidder()
      const bundle = selection.selectedGoods().map(goodId => {
        return { good: goodId, amount: 1 } // FIXME
      })
      return GoodsService.isAllowed(bundle, bidderId, this.$props.auctionId)
    },
    allowedToBid: function() {
      const bidderId = selection.selectedBidder()

      if (!bidderId) {
        return false
      }

      const bidder = auction.bidderById()(bidderId)

      const allowedNumberOfBids = auction.auctionById()(this.$props.auctionId).auction.allowedNumberOfBids
      const numberOfPlacedBids = bidder.bids ? bidder.bids.length : 0

      if (allowedNumberOfBids === 0) {
        return false
      }

      return allowedNumberOfBids > numberOfPlacedBids
    }
  },
  watch: {
    selectedGoods() {
      ;(this as any).determineBid()
    },
    selectedBidder() {
      ;(this as any).determineBid()
    }
  },
  methods: {
    async determineBid() {
      const bidderId = selection.selectedBidder()

      if (bidderId) {
        const bundle = selection.selectedGoods().map(goodId => {
          return { good: goodId, amount: 1 } // FIXME
        })
        this.$data.bid = await BidderService.bidForBundle(bidderId, bundle, this.$props.auctionId)
      }
    },
    placeBid() {
      const bidderId = selection.selectedBidder()

      if (!bidderId) {
        return
      }

      const bid: ApiBid = {
        amount: this.$data.bid,
        bidderId: bidderId,
        bundle: []
      }

      selection.selectedGoods().forEach((good: string) => {
        bid.bundle.push({ good: good, amount: 1 })
      })

      auction.commitUpdateBidder({
        bidderId: bidderId,
        bid: bid
      })
    }
  },
  name: 'BundleBid'
})
</script>

<style scoped lang="scss"></style>
