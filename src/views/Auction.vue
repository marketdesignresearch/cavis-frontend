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
              :selectedGoods="selectedGoods"
              :auctionId="auctionId"
              :bidder="bidder" />
          </div>

          <div class="flex-row text-center flex-grow-1">
            <span v-for="(good, index) in goods" :key="'i' + index" @click="selectGood(good)">
              <AuctionGood
                class="align-self-center"
                :isSelected="selectedGoods.indexOf(good.id) !== -1"
                :good="good" />
            </span>
          </div>

          <div class="flex-column">
            <AuctionBidder 
              class="align-self-start"
              v-for="(bidder, index) in rightSideBidders" 
              :key="'b' + index" 
              :selectedGoods="selectedGoods"
              :auctionId="auctionId"
              :bidder="bidder" />
          </div>
        </div>
      </div>
    </div>

    <div class="auction-control">
      <button class="btn btn-primary" @click="placeBids" :disabled="bidsPlaced">Place Bids</button>
      <button class="btn btn-primary" @click="allocate">Result</button>
    </div>

    <AuctionProgress stage="auction" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { AuctionGoodComponent, IAuctionGood } from '@/components/auction/Good.vue'
import AuctionBidder from '@/components/auction/Bidder.vue'
import AuctionBid from '@/components/auction/Bid.vue'
import AuctionSetup from '@/components/auction/Setup.vue'
import AuctionProgress from '@/components/auction/Progress.vue'
import auction, { ApiAuctionType, ApiGood } from '../store/modules/auction'

export default Vue.extend({
  name: 'AuctionTable',
  components: {
    'AuctionGood': AuctionGoodComponent,
    'AuctionBidder': AuctionBidder,
    'AuctionBid': AuctionBid,
    'AuctionSetup': AuctionSetup,
    'AuctionProgress': AuctionProgress
  },
  data () {
    return {
      bidsPlaced: false,
      selectedGoods: []
    }
  },
  methods: {
    selectGood(good: ApiGood) {
      if (this.$data.selectedGoods.indexOf(good.id) === -1) {
        this.$data.selectedGoods.push(good.id)
      } else {
        this.$data.selectedGoods.splice(this.$data.selectedGoods.indexOf(good.id))
      }
    },
    placeBids() {
      auction.dispatchPlaceBids({ auctionId: this.$route.params.id })
      this.$data.bidsPlaced = true
    },
    allocate() {
      this.$router.push({ name: 'auction-result', params: { id: this.$route.params.id } })
    }
  },
  computed: {
    leftSideBidders () {
      const bidders = auction.biddersById()(this.$route.params.id)
      return bidders.slice(0, bidders.length / 2 + 1)
    },
    rightSideBidders () {
      const bidders = auction.biddersById()(this.$route.params.id)
      return bidders.slice(bidders.length / 2 + 1, bidders.length)
    },
    goods () {
      const goods = auction.goodsById()(this.$route.params.id)
      return goods
    },
    bidders () {
      const bidders = auction.biddersById()(this.$route.params.id)
      return bidders
    },
    auctionId (): string {
      return this.$route.params.id
    }
  }
})
</script>

<style scoped lang="scss">

</style>
