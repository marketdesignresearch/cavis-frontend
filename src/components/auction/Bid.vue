<template>
  <div class="input-group mb-3">
    <input v-model="bid" type="number" class="form-control" placeholder="Enter your bid" :disabled="bidPlaced">
    <div class="input-group-append">
      <button class="btn btn-outline-secondary" @click="placeBid" type="button">Send Bid</button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Input, Button } from 'element-ui'
import auction, { ApiAuctionType, ApiAuction, ApiBid } from '../../store/modules/auction'

export default Vue.extend({
    props: ['auctionId', 'bidderId'],
    components: {
        'el-input': Input,
        'el-button': Button
    },
    computed: {
      bidPlaced (): boolean {
        return auction.hasBidBeenPlaced()(this.$props.auctionId, this.$props.bidderId)
      }
    },
    data () {
      return {
        bid: null
      }
    },
    methods: {
      placeBid() {
        const bid: ApiBid = { 
          amount: this.$data.bid,
          bundle: {
            item: 1
          }
        }

        auction.commitUpdateBidder({ auctionId: this.$props.auctionId, bidderId: this.$props.bidderId, bid: bid })
      }
    },
    name: 'AuctionBid'
})
</script>

<style scoped lang="scss">
</style>
