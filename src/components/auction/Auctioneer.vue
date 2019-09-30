<template>
  <div v-if="auction">
    <div class="row">
      <div class="col"></div>
      <div
        class="col text-center"
        v-intro="
          'This is where the auctioneer sits. By clicking on the button, you can display a panel with all the information that the auctioneer has (which is mostly information that is not publicly available to all bidders), like submitted bids from all bidders in each round, etc.'
        "
      >
        <img src="../../assets/auctioneer2.png" class="logo mt-3" v-b-toggle.collapse-auctioneer />
        <p>
          <b-button v-b-toggle.collapse-auctioneer size="sm" class="mt-3">{{
            isAuctioneerVisible ? 'Hide Auctioneer View' : 'Show Auctioneer View'
          }}</b-button>
        </p>
      </div>
      <div
        class="col text-right"
        v-intro="
          'You can advance the auction with the actions provided in this area. In a single-round auction, this means you can close the auction and get the outcome; In a multi-round auction, you are able to advance a round (and when all the rounds are played, close the auction).'
        "
      >
        <p class="my-4">
          <!--
          <component :is="roundType" :auction="auction" />
          -->
        </p>
      </div>
    </div>

    <b-collapse id="collapse-auctioneer" v-model="isAuctioneerVisible" class="mt-2 text-left">
      <h4>Rounds</h4>

      <b-tabs content-class="mt-3" v-model="selectedRound">
        <b-tab v-for="round in rounds" style="position: relative" :title="currentRoundTitle(round, rounds.length)" :key="round.roundNumber">
          <div class="right py-3">
            <button v-if="round.roundNumber < rounds.length" @click="resetRound(round.roundNumber - 1)" class="btn ml-2 btn-danger btn-sm">
              Reset to Round #{{ round.roundNumber }}
            </button>
            <button v-if="rounds.length > 1" @click="resetAuction" class="btn ml-2 btn-danger btn-sm">Reset Auction</button>
          </div>

          <table class="table table-bordered table-bidder">
            <thead>
              <tr>
                <th class="w-25" scope="col">Bidder</th>
                <th scope="col">Bids</th>
                <th scope="col" v-if="isMultiRound && !isPVM">Interim Allocation</th>
                <th scope="col" v-if="isPVM">Inferred Allocation</th>
                <th scope="col" v-if="isMultiRound">Payment</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="bidder of bidders" :key="bidder.id">
                <td class="w-25">Bidder {{ bidder.name }}</td>
                <td>
                  <div class="row">
                    <div class="col" v-for="(bids, index) in bidsByBidderChunked(bidder, round)" :key="'chunked-' + index">
                      <div v-for="bid in bids" :key="bid.id">
                        {{ bid.amount | formatNumber }} for
                        <good-badge :ids="bid.bundle.entries.map(obj => obj.good)" />
                      </div>
                    </div>
                  </div>
                </td>
                <td v-if="isMultiRound && !isPVM">
                  <good-badge :ids="allocationForBidder(bidder, round)" />
                </td>

                <td v-if="isPVM">
                  <good-badge :ids="inferredAllocationForBidder(bidder, round)" />
                </td>

                <td v-if="isMultiRound">{{ paymentForGoods(bidder, round) | formatNumber }}</td>
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
import auction, {
  ApiAuctionType,
  ApiRound,
  ApiAuction,
  ApiBidder,
  ApiGood,
  ApiBundleEntry,
  ApiBid,
  ApiBundleEntryWrapper,
  ApiBundleValue
} from '../../store/modules/auction'
import gui from '../../store/modules/gui'
import BidderService from '../../services/bidder'
import GoodsService from '../../services/goods'
import hashBundle from '../../services/bundleHash'
import api from '../../services/api'

export default Vue.extend({
  name: 'AuctionAuctioneer',
  props: ['auction'],
  components: {
    'good-badge': () => import('./GoodBadge.vue'),
    'auction-static-information': () => import('./rounds/StaticInformation.vue')
  },
  watch: {
    selectedRound(currentValue) {
      // do not query if this is the current/last round
      if (currentValue >= this.rounds.length - 2) {
        return
      }

      auction.dispatchGetRoundResult({ auctionId: this.$props.auction.id, round: currentValue })
    }
  },
  mounted() {
    this.valueQuery(auction.biddersById()(this.$props.auction.id), this.goodCombinations, this.$props.auction.id)
  },
  data: () => {
    const data: {
      selectedRound: number | null
      bundleValues: {
        [x: string]: ApiBundleValue[]
      }
    } = {
      selectedRound: null,
      bundleValues: {}
    }

    return data
  },
  computed: {
    isAuctioneerVisible: {
      get(): boolean {
        return gui.auctioneerVisible()
      },
      set(value: boolean) {
        gui.commitAuctioneerVisibility({ visible: value })
      }
    },
    roundType(): string {
      return 'component-round-' + this.$props.auction.auctionType
    },
    isMultiPhase(): boolean {
      const multiPhaseAuctions = [ApiAuctionType.CCA, ApiAuctionType.PVM]
      return multiPhaseAuctions.includes(this.$props.auction.auctionType as ApiAuctionType)
    },
    isPVM(): boolean {
      return (this.$props.auction.auctionType as ApiAuctionType).startsWith('PVM')
    },
    isMultiRound(): boolean {
      const multiRoundAuctions = [
        ApiAuctionType.SEQUENTIAL_FIRST_PRICE,
        ApiAuctionType.SEQUENTIAL_SECOND_PRICE,
        ApiAuctionType.CCA,
        ApiAuctionType.PVM
      ]
      return multiRoundAuctions.includes(this.$props.auction.auctionType as ApiAuctionType)
    },
    currentRound(): ApiRound | null {
      const rounds = this.$props.auction.auction.rounds
      return rounds[rounds.length - 1]
    },
    rounds(): ApiRound[] {
      const currentAuction = auction.auctionById()(this.$props.auction.id)
      const bidArrays = auction
        .biddersById()(this.$props.auction.id)
        .map(bidderId => {
          return auction.bidderById()(bidderId).bids || []
        })

      const currentBids: ApiBid[] = new Array().concat(...bidArrays)

      return currentAuction.auction.finished
        ? currentAuction.auction.rounds
        : [
            ...currentAuction.auction.rounds,
            {
              roundNumber: currentAuction.auction.rounds.length + 1,
              bids: currentBids
            }
          ]
    },
    goods(): ApiGood[] {
      return this.$props.auction.auction.domain.goods.map((goodId: string) => {
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
    currentRoundTitle(round: ApiRound, length: number) {
      const isFinished: boolean = this.$props.auction.auction.finished
      return round.roundNumber === length ? `${length}` + (!isFinished ? ` (Current Round)` : '') : '' + round.roundNumber
    },
    allocate() {
      auction.dispatchPlaceBids({ auctionId: this.$props.auction.id })
    },
    results() {
      this.allocate()
      this.$router.push({ name: 'auction-result', query: { auctions: [this.$props.auction.id] } })
    },
    valueForGood(bidder: ApiBidder, goods: ApiBundleEntryWrapper) {
      if (this.bundleValues[bidder.id!]) {
        const correctValue = this.bundleValues[bidder.id!].filter(value => value.bundle).find(value => value.bundle.hash === goods.hash)
        return correctValue ? correctValue.value : null
      }

      return '-'
    },
    bidsByBidderChunked(bidder: ApiBidder, round: ApiRound, chunkSize = 4) {
      if (round.bids) {
        const filtered = round.bids.filter(bid => bid.bidderId === bidder.id)
        return filtered
          .map((element, index) => {
            return index % chunkSize === 0 ? filtered.slice(index, index + chunkSize) : null
          })
          .filter(e => e !== null)
      }
      return []
    },
    allocationForBidder(bidder: ApiBidder, round: ApiRound): ApiBundleEntry[] {
      if (!round.outcome || !round.outcome.allocation[bidder.id!]) {
        return []
      }

      return round.outcome.allocation[bidder.id!].bundle.entries.map(entry => {
        return { good: entry.good, amount: entry.amount }
      })
    },
    inferredAllocationForBidder(bidder: ApiBidder, round: ApiRound): ApiBundleEntry[] {
      if (!round.pvm || !round.pvm.inferredOptimalAllocation[bidder.id!]) {
        return []
      }

      return round.pvm.inferredOptimalAllocation[bidder.id!].bundle.entries.map(entry => {
        return { good: entry.good, amount: entry.amount }
      })
    },
    paymentForGoods(bidder: ApiBidder, round: ApiRound): number | null {
      if (!round.outcome || !round.outcome.payments[bidder.id!]) {
        return null
      }

      return round.outcome.payments[bidder.id!]
    },
    async valueQuery(bidderIds: string[], queryBundles: ApiBundleEntryWrapper[], auctionId: string) {
      const bundles: any[] = []

      queryBundles.forEach(bundle => {
        const tmpBundle: { [x: string]: number } = {}

        bundle.entries.forEach(entry => {
          tmpBundle[entry.good] = entry.amount
        })

        bundles.push(tmpBundle)
      })

      const valueQuery = {
        bidders: bidderIds,
        bundles: bundles
      }

      const { data: valueQueryResult } = await api.post(`/auctions/${auctionId}/valuequery`, valueQuery)

      Object.keys(valueQueryResult).forEach(bidderId => {
        this.bundleValues[bidderId] = valueQueryResult[bidderId]
      })
    },
    resetAuction() {
      auction.dispatchResetAuctionToRound({ auctionId: this.$props.auction.id, round: 0, standardBids: true })
    },
    resetRound(round: number) {
      auction.dispatchResetAuctionToRound({ auctionId: this.$props.auction.id, round: round })
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

.right {
  position: absolute;
  right: 0;
  top: -70px;
}
</style>
