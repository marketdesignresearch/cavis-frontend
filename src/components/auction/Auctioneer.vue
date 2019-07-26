<template>
  <div v-if="auction">
    <div class="row">
      <div class="col">
        <p class="my-4">
          <auction-static-information :auction="auction" />
        </p>
      </div>
      <div class="col text-center">
        <img src="../../assets/auctioneer2.png" class="logo mt-3" v-b-toggle.collapse-auctioneer />
        <p>
          <b-button v-b-toggle.collapse-auctioneer size="sm" class="mt-3">
            {{ isAuctioneerVisible ? 'Hide Auctioneer View' : 'Show Auctioneer View' }}
          </b-button>
        </p>
      </div>
      <div class="col text-right">
        <p class="my-4">
          <component :is="roundType" :auction="auction" />
        </p>
      </div>
    </div>

    <b-collapse id="collapse-auctioneer" v-model="isAuctioneerVisible" class="mt-2 text-left">
      <b-tabs content-class="mt-3" v-model="selectedRound">
        <b-tab v-for="round in rounds" :title="'' + round.roundNumber" :key="round.roundNumber">
          <table class="table table-bidder">
            <thead>
              <tr>
                <th scope="col">Bidder</th>
                <th scope="col" v-if="goodCombinations.length <= 10">
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
                <td v-if="goodCombinations.length <= 10">
                  <div class="d-flex d-flex-column">
                    <div class="flex-grow-1 flex-basis-0" v-for="(goodSet, index) in goodCombinations" :key="'set' + index">
                      {{ valueForGood(bidder, goodSet) | formatNumber }}
                    </div>
                  </div>
                </td>
                <td>
                  <div v-for="bid in bidsByBidder(bidder, round)" :key="bid.id">
                    {{ bid.amount | formatNumber }} for <good-badge :ids="bid.bundle.entries.map(obj => obj.good)" />
                  </div>
                </td>
                <td>
                  <good-badge :ids="allocationForBidder(bidder, round)" />
                </td>
                <td>{{ paymentForGoods(bidder, round) | formatNumber }}</td>
              </tr>
            </tbody>
          </table>
        </b-tab>
      </b-tabs>

      <div class="text-right py-3">
        <button @click="resetAuction" class="btn ml-2 btn-danger btn-sm">Reset Auction</button>
        <button @click="advancePhase" class="btn ml-2 btn-success btn-sm">Skip Phase</button>
      </div>

    </b-collapse>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import auction, { ApiAuctionType, ApiRound, ApiAuction, ApiBidder, ApiGood, ApiBundleEntry, ApiBid, ApiBundleEntryWrapper } from '../../store/modules/auction'
import BidderService from '../../services/bidder'
import GoodsService from '../../services/goods'
import GoodBadgeComponent from './GoodBadge.vue'

export default Vue.extend({
  name: 'AuctionAuctioneer',
  props: ['auction'],
  components: {
    'good-badge': GoodBadgeComponent,
    'auction-static-information': () => import('./rounds/StaticInformation.vue')
  },
  watch: {
    selectedRound (currentValue) {
      auction.dispatchGetRoundResult({ auctionId: this.$props.auction.id, round: currentValue })
    }
  },
  data: () => {
    return {
      selectedRound: null,
      isAuctioneerVisible: false
    }
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
      const currentAuction = auction.auctionById()(this.$props.auction.id)
      const bidArrays = auction.biddersById()(this.$props.auction.id).map(bidderId => {
        return auction.bidderById()(bidderId).bids || []
      })
      
      const currentBids: ApiBid[] = new Array().concat(...bidArrays)

      return currentAuction.auction.finished ? currentAuction.auction.rounds : [...currentAuction.auction.rounds, {
        roundNumber: currentAuction.auction.rounds.length + 1,
        bids: currentBids
      }]
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
    goodCombinations(): ApiBundleEntryWrapper[] {
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
    valueForGood(bidder: ApiBidder, goods: ApiBundleEntryWrapper) {
      return GoodsService.valueForGood(goods, bidder.id!)
    },
    bidsByBidder(bidder: ApiBidder, round: ApiRound) {
      if (round.bids) {
        return round.bids.filter(bid => bid.bidderId === bidder.id)
      }
      return []
    },
    allocationForBidder(bidder: ApiBidder, round: ApiRound): ApiBundleEntry[] {
      if (!round.mechanismResult || !round.mechanismResult.allocation[bidder.id!]) {
        return []
      }

      return round.mechanismResult.allocation[bidder.id!].bundle.entries.map(entry => {
        return { good: entry.good, amount: entry.amount }
      })
    },
    paymentForGoods(bidder: ApiBidder, round: ApiRound): number | null {
      if (!round.mechanismResult || !round.mechanismResult.payments[bidder.id!]) {
        return null
      }

      return round.mechanismResult.payments[bidder.id!]
    },
    advanceRound() {
      auction.dispatchAdvanceRound({ auctionId: this.$props.auction.id })
    },
    advancePhase() {
      auction.dispatchAdvancePhase({ auctionId: this.$props.auction.id })
    },
    resetAuction() {
      auction.dispatchResetAuctionToRound({ auctionId: this.$props.auction.id, round: 0, standardBids: true })
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
