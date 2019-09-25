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

    <div
      class="results-table"
      v-if="results.length > 0 && auctions.length > 0"
      v-intro="'This is an overview over the outcome of the auction.'"
    >
      <div class="row">
        <div class="col-2"></div>
        <div class="col" v-for="(auction, index) in auctions" :key="auction.id">
          <div class="col header py-2 text-center">
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
              Efficiency: {{ efficiency(index) }}%
            </span>
            <span
              class="badge badge-pill badge-secondary mr-1"
              v-intro="'The social welfare is the sum over the winner\'s values for their allocations.'"
              v-intro-if="index === 0"
            >
              Social Welfare: {{ results[index].socialWelfare }}
            </span>
            <span class="badge badge-pill badge-secondary" v-intro="'The revenue is simply the sum of all the payments.'">
              Revenue: {{ results[index].revenue }}
            </span>
          </div>
          <div class="row py-1 border-left border-right border-top border-bottom bg-primary text-white font-weight-bold">
            <div
              class="col"
              v-intro="
                'If all true information about the bidder\'s valuation would be known to the auctioneer, this would be the efficient allocation.'
              "
              v-intro-if="index === 0"
            >
              Efficient Allocation
            </div>
            <div class="col" v-intro="'This shows the actual allocation per winner of this auction run.'" v-intro-if="index === 0">
              Allocation
            </div>
            <div class="col" v-intro="'This is what this bidder has to pay for the bundle.'" v-intro-if="index === 0">
              Payment
            </div>
            <div
              class="col"
              v-intro="'Finally, this is the utility of this bidder for this outcome (assuming quasi-linear utility).'"
              v-intro-if="index === 0"
            >
              Utility
            </div>
          </div>
        </div>
      </div>

      <div v-if="results.length > 0">
        <div class="row" v-for="key in bidderIds" :key="key">
          <div class="col-2 border-bottom">
            {{ key }}
            <bidder-circle class="my-3" :bidder="getBidder(key)" />
          </div>
          <div class="col border-bottom border-right border-left" v-for="(result, index) in results" :key="'result-' + index">
            <div class="row my-3">
              <div class="col">
                <div
                  v-if="
                    auctions[index].auction.domain.efficientAllocationCalculated && auctions[index].auction.domain.efficientAllocation[key]
                  "
                >
                  <good-badge :ids="auctions[index].auction.domain.efficientAllocation[key].bundle.entries"></good-badge><br />
                  <span class="badge badge-primary"
                    >Value: {{ auctions[index].auction.domain.efficientAllocation[key].trueValue | formatNumber }}</span
                  >
                </div>
              </div>
              <div class="col">
                <good-badge :ids="value.bundle.entries"></good-badge><br />
                <span class="badge badge-primary">Value: {{ value.trueValue | formatNumber }}</span>
              </div>
              <div class="col">
                {{ result.payments[key] | formatNumber }}
              </div>
              <div class="col">
                {{ result.winnerUtilities[key] | formatNumber }}
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
import auction, { ApiAuctionType, ApiAuction, ApiAuctionAllocation, AuctionState, ApiBidder } from '../store/modules/auction'

export default Vue.extend({
  name: 'AuctionResultView',
  components: {
    'good-badge': () => import('@/components/auction/GoodBadge.vue'),
    'bidder-circle': () => import('@/components/auction/BidderCircle.vue')
  },
  computed: {
    bidderIds(): string[] {
      return (this.$data.auctions[0] as ApiAuction).auction.domain.bidders
    }
  },
  methods: {
    getBidder(id: string) {
      return auction.bidderById()(id)
    },
    calculateEfficiency(auctionId: string) {},
    efficiency(index: number) {
      if (this.$data.auctions[index].auction.domain.efficientAllocationCalculated) {
        return (this.$data.results[index].socialWelfare / this.$data.auctions[index].auction.domain.efficientSocialWelfare) * 100
      }
      return null
    },
    async fetchAuctions() {
      const auctionIds = Array.isArray(this.$route.query.auctions) ? this.$route.query.auctions : [this.$route.query.auctions]
      this.$data.auctions = await Promise.all(auctionIds.map(auctionId => auction.dispatchGetAuction({ auctionId: auctionId! })))
      this.$data.results = await Promise.all(auctionIds.map(auctionId => auction.dispatchGetAuctionResult({ auctionId: auctionId! })))
    }
  },
  data() {
    return {
      auctions: [],
      results: []
    }
  },
  async mounted() {
    await this.fetchAuctions()
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
