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

    <div class="results-table" v-if="results.length > 0 && auctions.length > 0">
      <div class="row">
        <div class="col-2"></div>
        <div class="col" v-for="(auction, index) in auctions" :key="auction.id">
          <div class="col header py-2 text-center">
            Auction: {{ auction.name || auction.id }}<br />
            <a @click="calculateEfficiency()" class="badge badge-pill badge-success mr-1 text-white" v-if="!efficiency(index)"
              >Calculate Efficiency</a
            >
            <span class="badge badge-pill badge-success mr-1" v-if="efficiency(index)">Efficiency: {{ efficiency(index) }}%</span>
            <span class="badge badge-pill badge-secondary mr-1">Social Welfare: {{ results[index].socialWelfare }}</span>
            <span class="badge badge-pill badge-secondary">Revenue: {{ results[index].revenue }}</span>
          </div>
          <div class="row py-1 border-left border-right border-top border-bottom bg-primary text-white font-weight-bold">
            <div class="col">
              Efficient Allocation
            </div>
            <div class="col">
              Allocation
            </div>
            <div class="col">
              Payment
            </div>
            <div class="col">
              Utility
            </div>
          </div>
        </div>
      </div>

      <div v-if="results.length > 0">
        <div class="row" v-for="(value, key) in results[0].allocation" :key="key">
          <div class="col-2 border-bottom">
            <bidder-circle class="my-3" :bidder="getBidder(key)" />
          </div>
          <div class="col border-bottom border-right border-left" v-for="(result, index) in results" :key="'result-' + index">
            <div class="row my-3">
              <div class="col">
                <div v-if="auctions[index].auction.domain.efficientAllocationCalculated">
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
import auction, { ApiAuctionType, ApiAuction, ApiAuctionAllocation, AuctionState } from '../store/modules/auction'

export default Vue.extend({
  name: 'AuctionResultView',
  components: {
    'good-badge': () => import('@/components/auction/GoodBadge.vue'),
    'bidder-circle': () => import('@/components/auction/BidderCircle.vue')
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
    }
  },
  data() {
    return {
      auctions: [],
      results: []
    }
  },
  async mounted() {
    const auctionIds = Array.isArray(this.$route.query.auctions) ? this.$route.query.auctions : [this.$route.query.auctions]
    this.$data.auctions = await Promise.all(auctionIds.map(auctionId => auction.dispatchGetAuction({ auctionId: auctionId! })))
    this.$data.results = await Promise.all(auctionIds.map(auctionId => auction.dispatchGetAuctionResult({ auctionId: auctionId! })))
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
