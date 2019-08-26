<template>
  <div class="d-flex flex-column">
    <form 
      class="input-group btn-group"
      v-if="selectedGoods.length > 0 && (bidsLeft || (!bidsLeft && alreadyBid)) && bidsAllowed"
      @submit.enter.prevent="placeBid"
    >
      <input v-model="bid" type="text" class="form-control w-75" placeholder="Your Bid" :disabled="bidEditable" />
      <button @click="placeBid" class="btn btn-secondary btn-sm float-right" :class="{ 'btn-success': bidChanged }" :disabled="!bidChanged">
        <font-awesome-icon icon="check" />
      </button>
      <button type="button" @click="removeBid(selectedBundle)" class="btn btn-danger btn-sm float-right" :disabled="!alreadyBid">
        <font-awesome-icon icon="times" />
      </button>
    </form>
    <div v-if="selectedGoods.length > 0 && !bidsAllowed" class="alert alert-warning text-center">
      Bids on this good are not allowed in this round.
    </div>
    <div v-if="!bidsLeft && !alreadyBid" class="alert alert-warning text-center">
      You have reached the maximum number of bids.
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import auction, { ApiAuctionType, ApiAuction, ApiBid, ApiBidder, ApiBundleEntry, ApiBundleEntryWrapper } from '../../../store/modules/auction'
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
    ...mapGetters('selection', ['selectedGoods', 'selectedBidder', 'selectedBundle']),
    bidEditable: function() {
      const auctionInstance = auction.auctionById()(this.$props.auctionId)
      return auctionInstance.auction.currentRoundType && auctionInstance.auction.currentRoundType === 'Clock Round'
    },
    bidChanged(): boolean {
      const currentBid = GoodsService.bidForGood(selection.selectedBundle()!, selection.selectedBidder()!)
      return this.bid !== currentBid
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
      return !restrictedBids[bidderId] || restrictedBids[bidderId].some(value => value.hash === selectedBundle.hash)
    }
  },
  mounted() {
    ;(this as any).determineBid()
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
      const selectedBundle = selection.selectedBundle()

      if (bidderId) {
        const bundle = selection.selectedGoods().map(goodId => {
          return { good: goodId, amount: 1 } // FIXME
        })

        const currentBid = GoodsService.bidForGood({ hash: hashBundle(bundle), entries: bundle }, selection.selectedBidder()!)

        if (currentBid) {
          this.$data.bid = currentBid
        } else {
          this.$data.bid = await BidderService.bidForBundle(bidderId, { hash: hashBundle(bundle), entries: bundle }, this.$props.auctionId)
        }
      }
    },
    placeBid() {
      // remove existing bid first
      if (GoodsService.bidForGood(selection.selectedBundle(), selection.selectedBidder()!)) {
        BidderService.removeBid(selection.selectedBidder()!, selection.selectedBundle())
      }

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
    },
    removeBid(bundle: ApiBundleEntryWrapper) {
      BidderService.removeBid(selection.selectedBidder()!, bundle)
    }
  },
  name: 'BundleBid'
})
</script>

<style scoped lang="scss"></style>
