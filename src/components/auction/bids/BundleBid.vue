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
              <tr v-if="selectedGoods.length > 0">
                  <td>
                    <good-badge :goods="selectedGoods" />
                  </td>
                  <td>
                    <input v-model="bid" type="number" class="form-control" placeholder="Your Bid">
                  </td>
                  <td class="text-right">
                    <button @click="placeBid" class="btn btn-primary btn-sm float-right">Bid</button>
                  </td>
              </tr>
              <tr v-if="selectedGoods.length === 0">
                <td class="text-center" colspan="3">
                  Select a good to bid on it
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
import auction, { ApiAuctionType, ApiAuction, ApiBid } from '../../../store/modules/auction'
import GoodBadgeComponent from '../GoodBadge.vue'
import BidderService from '@/services/bidder'

export default Vue.extend({
    props: ['auctionId', 'bidder', 'selectedGoods'],
    components: {
        'el-input': Input,
        'el-button': Button,
        'good-badge': GoodBadgeComponent
    },
    watch: {
      'selectedGoods': function () {
        this.determineBid()
      },
      'bidder': function () {
        this.determineBid()
      }
    },
    data () {
      return {
        bid: null
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
    name: 'SingleItemAuctionBid'
})
</script>

<style scoped lang="scss">
</style>
