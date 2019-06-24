<template>
  <div>
    <div class="row" v-if="selectedGoods.length > 0">
      <div class="col-4">
        Selected Bundle:
      </div>
      <div class="col-4">
        Bid
      </div>
      <div class="col-4">
      </div>
      <div class="col-4">
        <span class="badge badge-secondary" v-for="good in selectedGoods" :key="good.id">{{ good }}</span>
      </div>
      <div class="col-4">
        <input v-model="bid" type="number" class="form-control" placeholder="Enter your bid">
      </div>
      <div class="col-4">
        <button @click="placeBid" class="btn btn-primary btn-sm float-right">Bid</button>
      </div>
    </div>
    <div class="alert alert-info" v-if="selectedGoods.length === 0">
      Select a good to bid on it
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
    data () {
      return {
        bid: null
      }
    },
    methods: {
      placeBid() {
        const bid: any = { 
          amount: this.$data.bid,
          bidderId: this.$props.bidderId,
          bundle: {}
        }

        this.$props.selectedGoods.forEach((good: string) => {
          bid.bundle[good] = 1
        })

        auction.commitUpdateBidder({
          auctionId: this.$props.auctionId,
          bidderId: this.$props.bidderId,
          bid: bid
        })
      }
    },
    name: 'SingleItemAuctionBid'
})
</script>

<style scoped lang="scss">
</style>
