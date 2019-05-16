<template>
  <div class="container">
    <div class="row">
      <div class="col">
        <h1>Auction View</h1>
      </div>
    </div>

    <div class="row">
      <div class="col">
        <div class="d-flex pt-4">
          <div class="flex-column">
            <AuctionBidder 
              class="align-self-start"
              v-for="(bidder, index) in leftSideBidders" 
              :key="'b' + index" 
              :auctionId="auctionId"
              :bidder="bidder" />
          </div>

          <div class="flex-row flex-grow-1">
            <AuctionGood
              class="align-self-center"
              v-for="(good, index) in goods" 
              :key="'i' + index"
              :good="good" />
          </div>

          <div class="flex-column">
            <AuctionBidder 
              class="align-self-start"
              v-for="(bidder, index) in rightSideBidders" 
              :key="'b' + index" 
              :auctionId="auctionId"
              :bidder="bidder" />
          </div>
        </div>
      </div>
    </div>

    <div class="auction-control">
      <button class="btn btn-primary" @click="allocate">Allocate</button>
    </div>

    <div class="auction-steps">
      <el-steps :active="0" align-center simple>
        <el-step title="Auction" description="Some description"></el-step>
        <el-step title="Result" description="Some description"></el-step>
      </el-steps>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { AuctionGoodComponent, IAuctionGood } from '@/components/auction/Good.vue'
import AuctionBidder from '@/components/auction/Bidder.vue'
import AuctionBid from '@/components/auction/Bid.vue'
import AuctionSetup from '@/components/auction/Setup.vue'
import auction, { ApiAuctionType } from '../store/modules/auction'
import { Steps, Step } from 'element-ui'

export default Vue.extend({
  name: 'AuctionTable',
  components: {
    'AuctionGood': AuctionGoodComponent,
    'AuctionBidder': AuctionBidder,
    'AuctionBid': AuctionBid,
    'AuctionSetup': AuctionSetup,
    'el-steps': Steps,
    'el-step': Step
  },
  methods: {
    allocate() {

      this.$router.push({ name: 'auction-result', params: { id: '1' } })
    }
  },
  computed: {
    leftSideBidders () {
      const storedAuction = auction.auctionById()(this.$route.params.id)
      return (storedAuction ? storedAuction.bidders : []).slice(0, storedAuction.bidders.length / 2 + 1)
    },
    rightSideBidders () {
      const storedAuction = auction.auctionById()(this.$route.params.id)
      return (storedAuction ? storedAuction.bidders : []).slice(storedAuction.bidders.length / 2 + 1, storedAuction.bidders.length)
    },
    goods () {
      const storedAuction = auction.auctionById()(this.$route.params.id)
      return storedAuction ? storedAuction.goods : []
    },
    bidders () {
      const storedAuction = auction.auctionById()(this.$route.params.id)
      return storedAuction ? storedAuction.bidders : []
    },
    auctionId (): string {
      return this.$route.params.id
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
