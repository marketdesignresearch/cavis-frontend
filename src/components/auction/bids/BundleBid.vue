<template>
  <div class="d-flex flex-column">
    <div v-if="selectedGoods.length > 0 && (bidsLeft || (!bidsLeft && alreadyBid)) && bidsAllowed">
      <div class="text-left">
        <small>Bid:</small>
      </div>
      <form class="input-group btn-group" @submit.enter.prevent>
        <input v-model="bid" type="text" class="form-control w-75" placeholder="Your Bid" :disabled="bidEditable" />
        <button
          @click="placeBid"
          class="btn btn-secondary btn-sm float-right text-white"
          :class="{ 'btn-success': bidChanged, 'btn-warning': invalidInput(bid) }"
          :disabled="!bidChanged || invalidInput(bid)"
        >
          <font-awesome-icon icon="check" />
        </button>
        <button type="button" @click="removeBid(selectedBundle)" class="btn btn-danger btn-sm float-right" :disabled="!alreadyBid">
          <font-awesome-icon icon="times" />
        </button>
      </form>
    </div>

    <div v-if="!isFinished" class="py-4">
      <strategy-selector v-if="selectedGoods.length > 0 && bidsAllowed" class="pt-2 mb-2" :auctionId="auctionId" />

      <!-- PVM Specific Errors -->
      <div v-if="isPVM && !bidsAllowed" class="alert alert-warning text-center">
        <div v-if="pvmQueriedBundle">
          <div>
            You can discover values for all bundles, but the auctioneer queries bundle
            <good-badge :goods="pvmQueriedBundle" />. Thus, you can only bid on this bundle.
          </div>
          <button class="btn mt-2 btn-sm btn-success" @click="selectQueriedBundle">Select queried bundle</button>
        </div>
        <div v-else>The auctioneer queries no bundles for this bidder.</div>
      </div>

      <!-- Explain why bidding is not possible -->
      <div v-if="!isPVM && selectedGoods.length > 0 && !bidsAllowed" class="alert alert-warning text-center">
        Bids on this bundle are not allowed in this round.
      </div>
      <div v-if="!isPVM && !bidsLeft && !alreadyBid" class="alert alert-warning text-center">
        You have reached the maximum number of bids. If you want to add a bid, you need to remove one first.
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import auction, { ApiAuctionType, ApiAuction, ApiBid, ApiBidder, ApiBundleEntry, ApiBundleEntryWrapper } from '@/store/modules/auction'
import BidderService from '@/services/bidder'
import GoodsService from '@/services/goods'
import selection from '@/store/modules/selection'
import { mapGetters } from 'vuex'
import hashBundle from '@/services/bundleHash'
import BigNumber from 'bignumber.js'
import pvmService from '@/services/pvm'

export default Vue.extend({
  props: ['auctionId'],
  components: {
    'good-badge': () => import('../GoodBadge.vue'),
    'strategy-selector': () => import('./StrategySelector.vue')
  },
  data() {
    return {
      bid: null
    }
  },
  computed: {
    ...mapGetters('selection', ['selectedGoods', 'selectedBidder', 'selectedBundle']),
    pvmQueriedBundle(): ApiBundleEntryWrapper | null {
      if (pvmService.queriedBundle(auction.auctionById()(this.$props.auctionId), selection.selectedBidder()!).length > 0) {
        return pvmService.queriedBundle(auction.auctionById()(this.$props.auctionId), selection.selectedBidder()!)[0] // right now we always query 1 bundle
      }

      return null
    },
    isPVM(): boolean {
      const currentAuction = auction.auctionById()(this.$props.auctionId)
      return currentAuction ? currentAuction.auctionType.startsWith('PVM') : false
    },
    bidEditable: function() {
      const auctionInstance = auction.auctionById()(this.$props.auctionId)
      return auctionInstance.auction.currentRoundType && auctionInstance.auction.currentRoundType === 'Clock Round'
    },
    bidChanged(): boolean {
      const currentBid = GoodsService.bidForGood(selection.selectedBundle()!, selection.selectedBidder()!)

      if (BigNumber.isBigNumber(currentBid) && this.bid) {
        return !currentBid.isEqualTo(this.$data.bid)
      }

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
    },
    isFinished(): boolean {
      const currentAuction = auction.auctionById()(this.$route.params.id)
      return currentAuction ? currentAuction.auction.finished : false
    },
    selectedBidderStrategy(): string | undefined {
      const bidderId = selection.selectedBidder()
      if (bidderId) {
        return auction.bidderById()(bidderId).strategy
      }
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
    selectQueriedBundle() {
      pvmService.selectQueriedBundle(auction.auctionById()(this.$props.auctionId))
    },
    invalidInput(bid: string) {
      return new BigNumber(bid).isNaN()
    },
    async determineBid() {
      const bidderId = selection.selectedBidder()
      const selectedBundle = selection.selectedBundle()

      if (bidderId) {
        const bundle = selection.selectedGoods().map(goodId => {
          return { good: goodId, amount: 1 } // FIXME
        })

        const currentBid = GoodsService.bidForGood({ hash: hashBundle(bundle), entries: bundle }, selection.selectedBidder()!)

        if (currentBid) {
          this.$data.bid = currentBid.toString()
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
        amount: new BigNumber(this.$data.bid),
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

      this.$bvToast.toast(`Your bid has been saved.`, {
        title: 'Bid saved!',
        autoHideDelay: 3000,
        appendToast: false,
        variant: 'success'
      })
    },
    removeBid(bundle: ApiBundleEntryWrapper) {
      BidderService.removeBid(selection.selectedBidder()!, bundle)
      ;(this as any).determineBid()
    }
  },
  name: 'BundleBid'
})
</script>

<style scoped lang="scss"></style>
