<template>
  <div>
    <div class="input-group" v-if="selectedGoods.length > 0 && bidsLeft && bidsAllowed">
      <input v-model="bid" type="text" class="form-control" placeholder="Your Bid" :disabled="bidEditable || alreadyBid" />
      <button @click="placeBid" :disabled="alreadyBid" class="btn btn-primary btn-sm float-right">Bid</button>
    </div>
    <div v-if="!bidsLeft" class="text-center">
      You have reached the maximum amount of bids.
    </div>
    <div v-if="bidsLeft && !bidsAllowed" class="text-center">
      Bids on this good are not allowed in this round.
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
import hashBundle from '../../../services/bundleHash'

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
      return GoodsService.isAllowed(selection.selectedBundle(), bidderId, this.$props.auctionId)
    },
    alreadyBid(): boolean {
      const bidderId = selection.selectedBidder()
      return GoodsService.bidForGood(selection.selectedBundle(), bidderId!) !== null
    },
    bidsLeft(): boolean {
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
    },
    bidsAllowed(): boolean {
      const bidderId = selection.selectedBidder()
      const selectedBundle = selection.selectedBundle()

      if (!bidderId) {
        return false
      }

      const restrictedBids = auction.auctionById()(this.$props.auctionId).auction.restrictedBids
      return restrictedBids[bidderId].some(value => value.hash === selectedBundle.hash)
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
        this.$data.bid = await BidderService.bidForBundle(bidderId, { hash: hashBundle(bundle), entries: bundle }, this.$props.auctionId)
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
        bundle: {
          hash: hashBundle([]),
          entries: []
        }
      }

      selection.selectedGoods().forEach((good: string) => {
        bid.bundle.entries.push({ good: good, amount: 1 })
        bid.bundle.hash = hashBundle(bid.bundle.entries)
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
