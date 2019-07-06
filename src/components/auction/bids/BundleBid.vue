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
              <good-badge :goods="selectedGoods" />
            </td>
            <td>
              <input v-model="bid" type="text" class="form-control" placeholder="Your Bid" />
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

export default Vue.extend({
  props: ['auctionId', 'bidder', 'selectedGoods'],
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
    allowedGoods: function() {
      console.log(GoodsService.isAllowed(this.$props.bidder, this.$props.auctionId, this.$props.selectedGoods))
      return GoodsService.isAllowed(this.$props.bidder, this.$props.auctionId, this.$props.selectedGoods)
    },
    allowedToBid: function() {
      if (!this.$props.bidder || !(this.$props.bidder as ApiBidder).bids) {
        return true
      }
      const allowedNumberOfBids = auction.auctionById()(this.$props.auctionId).auction.allowedNumberOfBids

      if (allowedNumberOfBids === 0) {
        return false
      }

      return allowedNumberOfBids > (this.$props.bidder as ApiBidder).bids.length
    }
  },
  methods: {
    determineBid() {
      if (this.$props.bidder && this.$props.selectedGoods) {
        this.$data.bid = BidderService.bidForBundle(this.$props.bidder, this.$props.selectedGoods)
      }
    },
    placeBid() {
      const bid: any = {
        amount: this.$data.bid,
        bidderId: this.$props.bidder.id,
        bundle: {}
      }

      this.$props.selectedGoods.forEach((good: string) => {
        bid.bundle[good] = 1
      })

      auction.commitUpdateBidder({
        auctionId: this.$props.auctionId,
        bidderId: this.$props.bidder.id,
        bid: bid
      })
    }
  },
  watch: {
    selectedGoods: function() {
      ;(this as any).determineBid() // fix for prod-build, typings somehow do not get recognized
    },
    bidder: function() {
      ;(this as any).determineBid() // fix for prod-build, typings somehow do not get recognized
    }
  },
  name: 'SingleItemAuctionBid'
})
</script>

<style scoped lang="scss"></style>
