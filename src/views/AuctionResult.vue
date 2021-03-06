<template>
  <div
    class="container content"
    v-intro="
      'This is the result screen. It shows a summary and some numbers for the finished auction. If you have selected multiple comparable auctions from the auction list, you will see them all in comparison in the following table.'
    "
  >
    <h2>
      Results
      <router-link
        v-if="auctions.length > 0"
        tag="button"
        class="btn btn-success btn-sm pull-right"
        :to="{ name: 'auction', params: { id: auctions[0].id } }"
        v-intro="'You can go back to the auction screen by clicking here.'"
        >Back to Auction</router-link
      >
    </h2>

    <hr />

    <div class="d-flex" v-if="results.length > 0 && auctions.length > 0">
      <div class="bidders">
        <div class="header header-cell">&nbsp;</div>
        <div class="bidder content-cell" v-for="bidderId in auctions[0].auction.domain.bidders" :key="bidderId">
          Bidder {{ getBidder(bidderId).name }}
          <br />
          <span class="badge badge-secondary badge-sm">{{ getBidder(bidderId).shortDescription }}</span>
        </div>
      </div>
      <div class="d-flex flex-grow-1 efficient">
        <div class="efficient-allocations d-flex flex-column flex-grow-1">
          <div class="header d-flex flex-column text-right justify-content-end">
            <div
              class="small font-weight-bold header-cell"
              v-intro="
                'As a reference, the efficient allocation shows what the allocation would be given the complete information about each bidder\'s value function.'
              "
            >
              Efficient Allocation
            </div>
          </div>
          <div class="flex-grow-1 text-right content-cell" v-for="bidderId in efficientAuction.auction.domain.bidders" :key="bidderId">
            <div v-if="efficientAllocationOf(bidderId, efficientAuction)">
              <good-badge :ids="efficientAllocationOf(bidderId, efficientAuction).bundle.entries"></good-badge>
              <br />
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
                {{ auction.name || auction.id }}
                <br />

                <auction-static-information :auction="auction" :roundTypeShown="false" />

                <a
                  @click="calculateEfficiency(auction.id)"
                  class="badge badge-pill badge-success mr-1 text-white cursor-pointer"
                  v-if="!efficiency(index)"
                  >Calculate Efficiency</a
                >
                <span
                  class="badge badge-pill badge-success mr-1"
                  v-if="efficiency(index)"
                  v-intro="'The efficiency compares the auction\'s resulting social welfare with the efficient social welfare.'"
                  v-intro-if="index === 0"
                  >Efficiency: {{ efficiency(index) | formatNumber }}%</span
                >
                <span
                  class="badge badge-pill badge-secondary mr-1"
                  v-intro="'The social welfare is the sum over the winner\'s values for their allocations.'"
                  v-intro-if="index === 0"
                  >Social Welfare: {{ results[index].socialWelfare | formatNumber }}</span
                >
                <span
                  class="badge badge-pill badge-secondary mr-1"
                  v-intro="'The revenue is simply the sum of all the payments.'"
                  v-intro-if="index === 0"
                  >Revenue: {{ results[index].revenue | formatNumber }}</span
                >
                <span
                  class="badge badge-pill badge-secondary mr-1"
                  v-intro="
                    'At a glance, you\'re also shown how many rounds were run. For some auction formats, you\'ll also see information about the number of value/demand queries.'
                  "
                  v-intro-if="index === 0"
                  ># of Rounds: {{ auction.auction.rounds.length }}</span
                >
                <span class="badge badge-pill text-white bg-pvm mr-1" v-if="isPVM(auction)"
                  ># of Value Queries: {{ auction.auction.rounds.length }}</span
                >
                <span class="badge badge-pill badge-secondary mr-1" v-if="isCCA(auction)"
                  ># of Demand Queries: {{ ccaDemandQueries(auction) }}</span
                >
              </div>
              <div class="bidder-header d-flex">
                <div
                  class="flex-fill-same text-right border-right header-cell small font-weight-bold"
                  v-intro="'This shows the actual allocation per bidder.'"
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
                  <good-badge :ids="results[index].allocation[bidderId].bundle.entries"></good-badge>
                  <br />
                  <span class="badge badge-primary">Value: {{ results[index].allocation[bidderId].trueValue | formatNumber }}</span>
                </div>
              </div>
              <div class="flex-fill-same text-right border-right content-cell">{{ results[index].payments[bidderId] | formatNumber }}</div>
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
  ApiBundleEntryWrapper,
  ApiEfficientBundleValue
} from '../store/modules/auction'
import api from '../services/api'

export default Vue.extend({
  name: 'AuctionResultView',
  components: {
    'good-badge': () => import('@/components/auction/GoodBadge.vue'),
    'auction-static-information': () => import('@/components/auction/rounds/StaticInformation.vue')
  },
  computed: {
    auctionIds(): string[] {
      return Array.isArray(this.$route.query.auctions) ? (this.$route.query.auctions as string[]) : [this.$route.query.auctions]
    },
    auctions(): ApiAuction[] {
      return this.auctionIds.map(auctionId => auction.auctionById()(auctionId!))
    },
    results(): ApiAuctionAllocation[] {
      return this.auctionIds
        .map(auctionId => auction.auctionResultById()(auctionId!))
        .filter(obj => obj !== null && obj !== undefined) as ApiAuctionAllocation[]
    },
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
      return (
        auction.auction.rounds.length +
        (auction.auctionConfig!.ccaConfig!.supplementaryBids > 0 ? auction.auctionConfig!.ccaConfig!.supplementaryBids : 0) +
        1
      )
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
    efficientAllocationOf(bidderId: string, auction: ApiAuction): ApiEfficientBundleValue | null {
      if (!auction.auction.domain.efficientAllocationCalculated) {
        return null
      }
      return auction.auction.domain.efficientAllocation[bidderId] ? auction.auction.domain.efficientAllocation[bidderId] : null
    },
    efficiency(index: number) {
      if (this.auctions[index].auction.domain.efficientAllocationCalculated) {
        return (this.results[index].socialWelfare / this.auctions[index].auction.domain.efficientSocialWelfare) * 100
      }
      return null
    },
    async fetchResults() {
      await Promise.all(this.auctionIds.map(auctionId => auction.dispatchGetAuction({ auctionId: auctionId! })))
      await Promise.all(this.auctionIds.map(auctionId => auction.dispatchGetAuctionResult({ auctionId: auctionId! })))
    }
  },
  async mounted() {
    await this.fetchResults()
    // if (!this.$cookies.isKey('auctionResultIntro')) {
    //   setTimeout(
    //     () =>
    //       this.$intro()
    //         .setOptions({ showStepNumbers: false, skipLabel: 'End' })
    //         .start(),
    //     1000
    //   )
    //   this.$cookies.set('auctionResultIntro', true)
    // }
  }
})
</script>

<style scoped lang="scss">
@import '../custom.scss';

.cursor-pointer {
  cursor: pointer;
}

.header-cell {
  padding: 0.5rem;
  @extend .border-bottom;
}

.content-cell {
  padding: 0.5rem;
  min-height: 130px;
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
  min-width: 500px;
}

.auctions > .auction:nth-child(even) {
  background-color: rgba(black, 0.05);
}

.bidder-result-row :nth-child(even) {
  background-color: rgba(black, 0.05);
}

.header {
  height: 180px;
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
