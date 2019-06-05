<template>
  <div>
    <div class="container">
      <div class="row">
        <div class="col">
          <Auctioneer :auctionId="auctionId" />
        </div>
      </div>
      <div class="row d-flex content">
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

            <div class="flex-row text-center flex-grow-1 mx-2">
              <span v-for="(good, index) in goods" :key="'i' + index" @click="selectGood(good)">
                <AuctionGood
                  class="align-self-center d-inline-flex"
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

      <div class="auction-control mb-4">
        Rounds:
        <nav v-if="rounds" class="d-inline-flex">
          <ul class="pagination pagination-sm">
            <li class="page-item" v-for="round in rounds" :key="round" :class="{ 'active': round == rounds.length - 1 }">
              <a class="page-link" href="#" @click="resetRound(round)" v-if="round < rounds.length - 1"> {{ round }}</a>
              <span class="page-link active" v-if="round >= rounds.length - 1"> {{ round }}</span>
            </li>
          </ul>
        </nav>

        <div class="float-right text-right">
          <button class="btn btn-primary mx-2" @click="placeBids">Place Bids & End Round</button>
          <button class="btn btn-success" @click="allocate">Result</button>
        </div>
      </div>

    </div>

    <AuctionProgress stage="auction" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { AuctionGoodComponent, IAuctionGood } from '@/components/auction/Good.vue'
import AuctionBidder from '@/components/auction/Bidder.vue'
import AuctionSetup from '@/components/auction/Setup.vue'
import AuctionProgress from '@/components/auction/Progress.vue'
import Auctioneer from '@/components/auction/Auctioneer.vue'
import auction, { ApiAuctionType, ApiGood, ApiAuction } from '../store/modules/auction'

export default Vue.extend({
  name: 'AuctionTable',
  components: {
    'AuctionGood': AuctionGoodComponent,
    'AuctionBidder': AuctionBidder,
    'AuctionSetup': AuctionSetup,
    'AuctionProgress': AuctionProgress,
    'Auctioneer': Auctioneer
  },
  data () {
    return {
      bidsPlaced: false,
      selectedGoods: []
    }
  },
  mounted () {
    auction.dispatchGetAuction({ auctionId: this.$route.params.id })
  },
  methods: {
    resetRound(round: number) {
      auction.dispatchResetAuctionToRound({ auctionId: this.$route.params.id, round: round })
    },
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
    rounds (): number[] {
      return Array.from({ length: auction.auctionById()(this.$route.params.id).auction.rounds.length + 1 }, (v, k) => k)
    },
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
    auctionStats (): ApiAuction {
      return auction.auctionById()(this.$route.params.id)
    },
    auctionId (): string {
      return this.$route.params.id
    }
  }
})
</script>

<style scoped lang="scss">
.content {
  display: flex;
  min-height: 70vh;
  flex-direction: column;
}
</style>
