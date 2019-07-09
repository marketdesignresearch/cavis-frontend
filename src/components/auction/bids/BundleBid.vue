<template>
  <div>
    <div class="table-responsive">
      <table class="table table-bidder table-hover">
        <thead>
          <tr>
            <th class="col-4">Selected Bundle</th>
            <th class="col-6">Bid</th>
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
              <button @click="placeBid" :disabled="!allowedGoods" class="btn btn-primary btn-sm float-right">Bid</button>
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
import { Input, Button } from 'element-ui'
import auction, { ApiAuctionType, ApiAuction, ApiBid, ApiBidder } from '../../../store/modules/auction'
import GoodBadgeComponent from '../GoodBadge.vue'
import BidderService from '@/services/bidder'
import GoodsService from '@/services/goods'
import selection from '../../../store/modules/selection'
import { mapGetters } from 'vuex'

export default Vue.extend({
  props: ['auctionId'],
  components: {
    'el-input': Input,
    'el-button': Button,
    'good-badge': GoodBadgeComponent
  },
  data() {
    return {
      bid: null
    }
  },
  computed: {
    ...mapGetters('selection', ['selectedGoods']),
    bidEditable: function() {
      const auctionInstance = auction.auctionById()(this.$props.auctionId)
      return auctionInstance.auction.currentRoundType && auctionInstance.auction.currentRoundType === 'CLOCK'
    },
    allowedGoods: function() {
      const bidderId = selection.selectedBidder()
      return GoodsService.isAllowed(bidderId, this.$props.auctionId)
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
    }
  },
  methods: {
    determineBid() {
      const bidderId = selection.selectedBidder()
      const bidder = bidderId ? auction.bidderById()(bidderId) : null

      if (bidder) {
        this.$data.bid = BidderService.bidForBundle(bidder, selection.selectedGoods(), this.$props.auctionId)
      }
    },
    placeBid() {
      const bidderId = selection.selectedBidder()

      if (!bidderId) {
        return
      }

      const bid: any = {
        amount: this.$data.bid,
        bidderId: bidderId,
        bundle: {}
      }

      selection.selectedGoods().forEach((good: string) => {
        bid.bundle[good] = 1
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
