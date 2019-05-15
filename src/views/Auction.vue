<template>
  <div>
    <h1>Auction View</h1>

    <button class="btn btn-primary" @click="createAuction">Create Auction</button>

    <span v-for="(good, index) in goods" :key="'i' + index">
      <AuctionGood :good="good" />
    </span>
    
    <span v-for="(bidder, index) in bidders" :key="'b' + index">
      <AuctionBidder :bidder="bidder" />
    </span>

    <div class="auction-steps">
      <el-steps :active="2" align-center simple>
        <el-step title="Phase 1" description="Some description"></el-step>
        <el-step title="Phase 2" description="Some description"></el-step>
        <el-step title="Phase 3" description="Some description"></el-step>
        <el-step title="Phase 4" description="Some description"></el-step>
      </el-steps>
    </div>
  
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { AuctionGoodComponent, IAuctionGood } from '@/components/auction/Good.vue'
import AuctionBidder from '@/components/auction/Bidder.vue'
import AuctionBid from '@/components/auction/Bid.vue'
import auction, { ApiAuctionType } from '../store/modules/auction'
import { Steps, Step } from 'element-ui'

export default Vue.extend({
  name: 'AuctionTable',
  components: {
    'AuctionGood': AuctionGoodComponent,
    'AuctionBidder': AuctionBidder,
    'AuctionBid': AuctionBid,
    'el-steps': Steps,
    'el-step': Step
  },
  computed: {
    goods () {
      const storedAuction = auction.auctionById()(this.$route.params.id)
      return storedAuction ? storedAuction.goods : []
    },
    bidders () {
      const storedAuction = auction.auctionById()(this.$route.params.id)
      return storedAuction ? storedAuction.bidders : []
    }
  },
  methods: {
    createAuction() {
      auction.dispatchCreateAuction({ bidders: [
        {"id":"B1","value":{"bundleValues":[]}},
        {"id":"B2","value":{"bundleValues":[]}},
        {"id":"B3","value":{"bundleValues":[]}}
    ], goods: [
      {"id":"item","availability":1,"dummyGood":false}
      ]})
    }
  }
})
</script>

<style scoped lang="scss">
.auction-steps {
  bottom: 0;
  right: 0;
  left: 0;
  position: absolute;
}
</style>
