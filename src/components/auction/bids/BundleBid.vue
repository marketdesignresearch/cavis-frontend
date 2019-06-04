<template>
  <div>
    <div class="input-group mb-3">
      <input :disabled="selectedGoods.length === 0" v-model="bid" type="number" class="form-control" placeholder="Enter your bid">
    </div>

    <a href="#" @click="placeBid" class="btn btn-primary btn-sm card-link float-right">Bid</a>

    <div v-for="bid in bids" :key="bid.id">
      Bids {{ bid.amount }} for 
      <ul>
        <li v-for="(item, key) in bid.bundle" :key="key">{{ key }}</li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Input, Button } from 'element-ui'
import auction, { ApiAuctionType, ApiAuction, ApiBid } from '../../../store/modules/auction'

export default Vue.extend({
    props: ['auctionId', 'bidderId', 'selectedGoods'],
    components: {
        'el-input': Input,
        'el-button': Button
    },
    computed: {
      bids (): any[] {
        const bids = auction.biddersById()(this.$props.auctionId).filter(obj => obj.id === this.$props.bidderId && obj.bids)
        return bids && bids.length > 0 ? bids[0].bids : []
      },
      bidPlaced (): boolean {
        return auction.biddersById()(this.$props.auctionId).filter(obj => obj.id === this.$props.bidderId && obj.bids && obj.bids.length > 0).length > 0
      }
    },
    data () {
      return {
        bid: null
      }
    },
    methods: {
      placeBid() {
        if (this.$props.selectedGoods.length === 0) {
          return
        }
        
        // todo: fixme
        const bid: any = { 
          amount: this.$data.bid,
          bundle: {}
        }

        this.$props.selectedGoods.forEach((good: string) => {
          bid.bundle[good] = 1
        })

        console.log('Placing Bid:', bid)

        auction.commitUpdateBidder({ auctionId: this.$props.auctionId, bidderId: this.$props.bidderId, bid: bid })
      }
    },
    name: 'SingleItemAuctionBid'
})
</script>

<style scoped lang="scss">
</style>
