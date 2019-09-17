<template>
  <div class="container content">
    <h2>Results</h2>
    <hr />

    <div class="results-table" v-if="results.length > 0 && auctions.length > 0">
      <div class="row">
        <div class="col-2"></div>
        <div class="col" v-for="(auction, index) in auctions" :key="auction.id">
          <div class="col font-weight-bold py-2 text-center">
            Auction<br />
            <span class="badge badge-primary">{{ auction.name || auction.id }}</span
            ><br />
            Efficiency: {{ results[index].revenue }}<br />
            Social Welfare: {{ results[index].socialWelfare }}
          </div>
          <div class="row py-3 border-top border-bottom font-weight-bold">
            <div class="col">
              Efficient Allocation
            </div>
            <div class="col">
              Allocation
            </div>
            <div class="col">
              Value
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
          <div class="col-2">
            <bidder-circle class="pb-2" :bidder="getBidder(key)" />
          </div>
          <div class="col border-left" v-for="(result, index) in results" :key="'result-' + index">
            <div class="row my-3">
              <div class="col">
                <button class="btn btn-sm btn-primary" @click="fetchEfficientAllocation(auctions[index].id)">Calculate</button>
              </div>
              <div class="col">
                <good-badge :ids="value.bundle.entries"></good-badge>
              </div>
              <div class="col">
                {{ value.value | formatNumber }}<br />
                (Truthful: {{ value.trueValue | formatNumber }})
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
    fetchEfficientAllocation(auctionId: string) {}
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
