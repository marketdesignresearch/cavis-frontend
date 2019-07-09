<template>
  <div v-if="auction">
    <div class="row">
      <div class="col"></div>
      <div class="col text-center">
        <img src="../../assets/auctioneer.png" class="logo mt-3" v-b-toggle.collapse-auctioneer />
        <p>
          <b-button v-b-toggle.collapse-auctioneer size="sm" class="mt-3">Toggle Auctioneer</b-button>
        </p>
      </div>
      <div class="col text-right">
        <p class="my-4">
          <component :is="roundType" :auction="auction" />
        </p>
      </div>
    </div>

    <b-collapse id="collapse-auctioneer" class="mt-2 text-left">
      <div class="float-right">
        <button @click="advanceRound" class="btn btn-warning btn-sm">Advance Round</button>
        <button @click="advancePhase" class="btn ml-2 btn-warning btn-sm">Advance Phase</button>
      </div>
      <b-tabs content-class="mt-3">
        <b-tab v-for="round in rounds" :title="'Round ' + round.roundNumber" :key="round.roundNumber">
          <table class="table table-bidder">
            <thead>
              <tr>
                <th scope="col">Bidder</th>
                <th scope="col">
                  <div>Values</div>
                  <div class="d-flex d-flex-column">
                    <div class="flex-grow-1 flex-basis-0" v-for="(goodSet, index) in goodCombinations" :key="'set' + index">
                      <good-badge :ids="goodSet" />
                    </div>
                  </div>
                </th>
                <th scope="col">Bids</th>
                <th scope="col">Allocation</th>
                <th scope="col">Payment</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="bidder of bidders" :key="bidder.id">
                <td>{{ bidder.name }}</td>
                <td>
                  <div class="d-flex d-flex-column">
                    <div class="flex-grow-1 flex-basis-0" v-for="(goodSet, index) in goodCombinations" :key="'set' + index">
                      {{ valueForGood(bidder, goodSet) | formatNumber }}
                    </div>
                  </div>
                </td>
                <td>
                  <span v-for="bid in bidsByBidder(bidder, round)" :key="bid.id">
                    <good-badge :ids="bid.bundle.map(obj => obj.good)" />
                  </span>
                </td>
                <td>
                  <good-badge :ids="allocationForBidder(bidder, round)" />
                </td>
                <td>
                  {{ paymentForGoods(bidder, round) | formatNumber }}
                </td>
              </tr>
            </tbody>
          </table>
        </b-tab>
      </b-tabs>
    </b-collapse>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import auction, { ApiAuctionType, ApiRound, ApiAuction, ApiBidder, ApiGood } from '../../store/modules/auction'
import BidderService from '../../services/bidder'
import GoodsService from '../../services/goods'
import GoodBadgeComponent from './GoodBadge.vue'

export default Vue.extend({
  name: 'AuctionAuctioneer',
  props: ['auction'],
  components: {
    'good-badge': GoodBadgeComponent
  },
  computed: {
    roundType(): string {
      return 'component-round-' + this.$props.auction.auctionType
    },
    currentRound(): ApiRound | null {
      const rounds = this.$props.auction.auction.rounds
      return rounds[rounds.length - 1]
    },
    rounds(): ApiRound[] {
      return [...this.$props.auction.auction.rounds]
    },
    goods(): ApiGood[] {
      return this.$props.auction.auction.domain.goods.map((goodId: string) => {
        console.log(goodId)
        return auction.goodById()(goodId)
      })
    },
    bidders(): ApiBidder[] {
      return this.$props.auction.auction.domain.bidders.map((bidderId: string) => {
        return auction.bidderById()(bidderId)
      })
    },
    goodCombinations(): string[][] {
      return GoodsService.goodCombinations(this.$props.auction.id)
    }
  },
  methods: {
    allocate() {
      auction.dispatchPlaceBids({ auctionId: this.$props.auction.id })
    },
    results() {
      this.allocate()
      this.$router.push({ name: 'auction-result', params: { id: this.$props.auction.id } })
    },
    valueForGood(bidder: ApiBidder, goods: string[]) {
      return GoodsService.valueForGood(goods, bidder.id!)
    },
    priceForGood(bidder: ApiBidder, goods: string[]) {
      return GoodsService.priceForGood(this.$props.auctionId, goods, bidder.id!)
    },
    bidForGood(bidder: ApiBidder, goods: string[]) {
      return GoodsService.bidForGood(goods, bidder.id!)
    },
    bidsByBidder(bidder: ApiBidder, round: ApiRound) {
      if (round.bids) {
        return round.bids.filter(bid => bid.bidderId === bidder.id)
      }
      return []
    },
    allocationForBidder(bidder: ApiBidder, round: ApiRound): string[] {
      if (!round.mechanismResult || !round.mechanismResult.allocation[bidder.id!]) {
        return []
      }

      return round.mechanismResult.allocation[bidder.id!].bundle.map(good => good.good)
    },
    paymentForGoods(bidder: ApiBidder, round: ApiRound): number | null {
      if (!round.mechanismResult || !round.mechanismResult.payments[bidder.id!]) {
        return null
      }

      return round.mechanismResult.payments[bidder.id!]
    },
    advanceRound() {
      auction.dispatchAdvanceRound({ auctionId: this.$props.auctionId })
    },
    advancePhase() {
      auction.dispatchAdvancePhase({ auctionId: this.$props.auctionId })
    }
  }
})
</script>

<style scoped lang="scss">
.bidder {
  padding: 10px;
}

.logo {
  width: 50px;
}

.flex-basis-0 {
  flex-basis: 0;
}
</style>
