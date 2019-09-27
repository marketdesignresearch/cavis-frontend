<template>
  <div class="container content">
    <h2>
      Results
      <router-link
        v-if="auctions.length === 1"
        tag="button"
        class="btn btn-success btn-sm pull-right"
        :to="{ name: 'auction', params: { id: auctions[0].id } }"
        >Back to Auction</router-link
      >
    </h2>

    <hr />

    <div class="d-flex" v-if="results.length > 0 && auctions.length > 0">
      <div class="bidders">
        <div class="header header-cell">
          &nbsp;
        </div>
        <div class="bidder content-cell" v-for="bidderId in auctions[0].auction.domain.bidders" :key="bidderId">
          Bidder {{ getBidder(bidderId).name }}<br />
          <span class="badge badge-secondary badge-sm">{{ getBidder(bidderId).shortDescription }}</span>
        </div>
      </div>
      <div class="d-flex flex-grow-1 efficient">
        <div class="efficient-allocations d-flex flex-column flex-grow-1">
          <div class="header d-flex flex-column text-right justify-content-end">
            <div class="small font-weight-bold header-cell">
              Efficient Allocation
            </div>
          </div>
          <div v-if="efficientAuction">
            <div class="flex-grow-1 text-right content-cell" v-for="bidderId in efficientAuction.auction.domain.bidders" :key="bidderId">
              <good-badge :ids="efficientAllocationOf(bidderId, efficientAuction).bundle.entries"></good-badge><br />
              <span class="badge badge-primary"
                >Value: {{ efficientAllocationOf(bidderId, efficientAuction).trueValue | formatNumber }}</span
              >
            </div>
          </div>
        </div>
      </div>
      <div class="result d-flex flex-grow-1 scrollable">
        <div class="auctions d-flex flex-row flex-grow-1">
          <div class="auction d-flex flex-column flex-grow-1" v-for="(auction, index) in auctions" :key="auction.id">
            <div class="header d-flex flex-column justify-content-end">
              <div class="auction-results text-center">
                Auction: {{ auction.name || auction.id }}<br />

                <a @click="calculateEfficiency()" class="badge badge-pill badge-success mr-1 text-white" v-if="!efficiency(index)"
                  >Calculate Efficiency</a
                >
                <span
                  class="badge badge-pill badge-success mr-1"
                  v-if="efficiency(index)"
                  v-intro="'The efficiency compares the auction\'s resulting social welfare with the efficient social welfare.'"
                  v-intro-if="index === 0"
                >
                  Efficiency: {{ efficiency(index) | formatNumber }}%
                </span>
                <span
                  class="badge badge-pill badge-secondary mr-1"
                  v-intro="'The social welfare is the sum over the winner\'s values for their allocations.'"
                  v-intro-if="index === 0"
                >
                  Social Welfare: {{ results[index].socialWelfare | formatNumber }}
                </span>
                <span class="badge badge-pill badge-secondary mr-1" v-intro="'The revenue is simply the sum of all the payments.'">
                  Revenue: {{ results[index].revenue | formatNumber }}
                </span>
                <span class="badge badge-pill badge-secondary mr-1" v-intro="'The revenue is simply the sum of all the payments.'">
                  # of Rounds: {{ auction.auction.rounds.length }}
                </span>
                <span class="badge badge-pill text-white bg-pvm mr-1" v-if="isPVM(auction)">
                  # of Value Queries: {{ auction.auction.rounds.length }}
                </span>
                <span class="badge badge-pill badge-secondary mr-1" v-if="isCCA(auction)">
                  # of Demand Queries: {{ ccaDemandQueries(auction) }}
                </span>
              </div>
              <div class="bidder-header d-flex">
                <div
                  class="flex-fill-same text-right border-right header-cell small font-weight-bold"
                  v-intro="'This shows the actual allocation per winner of this auction run.'"
                  v-intro-if="index === 0"
                >
                  Allocation
                </div>
                <div
                  class="flex-fill-same text-right border-right header-cell small font-weight-bold"
                  v-intro="'This is what this bidder has to pay for the bundle.'"
                  v-intro-if="index === 0"
                >
                  Payment
                </div>
                <div
                  class="flex-fill-same text-right border-right header-cell small font-weight-bold"
                  v-intro="'Finally, this is the utility of this bidder for this outcome (assuming quasi-linear utility).'"
                  v-intro-if="index === 0"
                >
                  Utility
                </div>
              </div>
            </div>
            <div
              class="bidder-result-row d-flex flex-row flex-grow-1 flex-fill-same"
              v-for="bidderId in auction.auction.domain.bidders"
              :key="bidderId"
            >
              <div class="flex-fill-same text-right border-right content-cell">
                <div v-if="results[index].allocation[bidderId]">
                  <good-badge :ids="results[index].allocation[bidderId].bundle.entries"></good-badge><br />
                  <span class="badge badge-primary">Value: {{ results[index].allocation[bidderId].trueValue | formatNumber }}</span>
                </div>
              </div>
              <div class="flex-fill-same text-right border-right content-cell">
                {{ results[index].payments[bidderId] | formatNumber }}
              </div>
              <div class="flex-fill-same text-right border-right content-cell">
                {{ results[index].winnerUtilities[bidderId] | formatNumber }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import auction, {
  ApiAuctionType,
  ApiAuction,
  ApiAuctionAllocation,
  AuctionState,
  ApiBidder,
  ApiBundleEntryWrapper
} from '../store/modules/auction'
import api from '../services/api'

export default Vue.extend({
  name: 'AuctionResultView',
  components: {
    'good-badge': () => import('@/components/auction/GoodBadge.vue'),
    'bidder-circle': () => import('@/components/auction/BidderCircle.vue')
  },
  computed: {
    efficientAuction(): ApiAuction | null {
      let mostEfficientAuction: ApiAuction | null = null

      this.auctions.forEach(auction => {
        if (!mostEfficientAuction) {
          mostEfficientAuction = auction
        }

        if (
          auction.auction.domain.efficientAllocationCalculated &&
          auction.auction.domain.efficientSocialWelfare > mostEfficientAuction.auction.domain.efficientSocialWelfare
        ) {
          mostEfficientAuction = auction
        }
      })

      return mostEfficientAuction
    }
  },
  methods: {
    ccaDemandQueries(auction: ApiAuction): number {
      return auction.auction.rounds.length + (auction.auctionConfig!.ccaConfig!.supplementaryBids > 0 ? 1 : 0) + 1
    },
    isCCA(auction: ApiAuction): boolean {
      return auction.auctionType.startsWith('CCA')
    },
    isPVM(auction: ApiAuction): boolean {
      return auction.auctionType.startsWith('PVM')
    },
    getBidder(id: string) {
      return auction.bidderById()(id)
    },
    async calculateEfficiency(auctionId: string) {
      await api.get(`/auctions/${auctionId}/efficient-allocation`)

      // update auctions
      this.fetchResults()
    },
    efficientAllocationOf(bidderId: string, auction: ApiAuction): ApiBundleEntryWrapper | null {
      console.log(bidderId, auction)
      return auction.auction.domain.efficientAllocation[bidderId]
    },
    efficiency(index: number) {
      if (this.$data.auctions[index].auction.domain.efficientAllocationCalculated) {
        return (this.$data.results[index].socialWelfare / this.$data.auctions[index].auction.domain.efficientSocialWelfare) * 100
      }
      return null
    },
    async fetchResults() {
      const auctionIds = Array.isArray(this.$route.query.auctions) ? this.$route.query.auctions : [this.$route.query.auctions]

      await Promise.all(auctionIds.map(auctionId => auction.dispatchGetAuction({ auctionId: auctionId! })))
      await Promise.all(auctionIds.map(auctionId => auction.dispatchGetAuctionResult({ auctionId: auctionId! })))

      this.$data.auctions = auctionIds.map(auctionId => auction.auctionById()(auctionId!))
      this.$data.results = auctionIds.map(auctionId => auction.auctionResultById()(auctionId!))
    }
  },
  data() {
    return {
      auctions: [] as ApiAuction[],
      results: []
    }
  },
  async mounted() {
    await this.fetchResults()
    if (!this.$cookies.isKey('auctionResultIntro')) {
      setTimeout(
        () =>
          this.$intro()
            .setOptions({ showStepNumbers: false, skipLabel: 'End' })
            .start(),
        1000
      )
      this.$cookies.set('auctionResultIntro', true)
    }
  }
})
</script>

<style scoped lang="scss">
@import '../custom.scss';

.header-cell {
  padding: 1rem;
  @extend .border-bottom;
}

.content-cell {
  padding: 1rem;
  min-height: 110px;
  @extend .border-bottom;
}

.border-right {
  border-right: 1px solid darken($light, 20%);
}

.border-bottom {
  border-bottom: 1px solid darken($light, 20%);
}

.efficient-allocations {
  @extend .border-right;
}

.scrollable {
  overflow-x: scroll;
}

.flex-fill-same {
  flex: 1 1 110px !important;
}

.efficient {
  @extend .border-right;
  padding-bottom: 17px;
}

.bidders {
  @extend .border-right;
  padding-bottom: 17px;
}

.auction {
  min-width: 400px;
}

.auctions > .auction:nth-child(even) {
  background-color: rgba(black, 0.05);
}

.bidder-result-row :nth-child(even) {
  background-color: rgba(black, 0.05);
}

.header {
  height: 120px;
  border-bottom: 1px solid darken($light, 20%);
}

.content {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
}

.results-table {
  font-size: 0.8rem;

  .header {
    font-size: 1.2rem;
  }
}

.no-gutters {
  margin-right: 0;
  margin-left: 0;

  > .col,
  > [class*='col-'] {
    padding-right: 0;
    padding-left: 0;
  }
}
</style>
