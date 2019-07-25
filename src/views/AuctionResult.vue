<template>
  <div class="container content" v-if="result">
    <div class="row">
      <div class="col">
        <h1>Result of Auction</h1>

        <p>Total Payments: {{ result.payments.totalPayments | formatNumber }}</p>

        <h2>Allocation</h2>
        <table class="table table-striped">
          <thead>
            <tr>
              <th scope="col">Bidder</th>
              <th scope="col">Value</th>
              <th scope="col">Payment</th>
              <th scope="col">Bundle</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(value, key) in result.allocation" :key="key">
              <td>{{ getBidderName(key) }}</td>
              <td>$ {{ value.value | formatNumber }}</td>
              <td>$ {{ result.payments[key] | formatNumber }}</td>
              <td><good-badge :ids="value.bundle.entries"></good-badge></td>
            </tr>
          </tbody>
        </table>

        <h2>Bids</h2>
        <table class="table table-striped">
          <thead>
            <tr>
              <th scope="col">Round</th>
              <th scope="col">Bidder</th>
              <th scope="col">Bundle</th>
              <th scope="col">Bid</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="currentRound in auction.auction.rounds">
              <tr v-for="bid of currentRound.bids" :key="bid.id">
                <td>{{ currentRound.description }}</td>
                <td>{{ getBidderName(bid.bidderId) }}</td>
                <td><good-badge :key="'bundle'" :ids="bid.bundle.entries"></good-badge></td>
                <td>$ {{ bid.amount | formatNumber }}</td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import auction, { ApiAuctionType, ApiAuction, ApiAuctionAllocation, AuctionState } from '../store/modules/auction'
import GoodBadgeComponent from '@/components/auction/GoodBadge.vue'

export default Vue.extend({
  name: 'AuctionResultView',
  components: {
    'good-badge': GoodBadgeComponent
  },
  methods: {
    getBidderName(id: string) {
      return auction.bidderById()(id).name
    }
  },
  computed: {
    result(): ApiAuctionAllocation | undefined | null {
      return auction.auctionResultById()(this.$route.params.id)
    },
    auction(): ApiAuction {
      return auction.auctionById()(this.$route.params.id)
    },
    auctionInstance() {
      return auction
    },
    auctionId(): string {
      return this.$route.params.id
    }
  },
  async mounted() {
    await auction.dispatchGetAuction({ auctionId: this.$route.params.id })
    await auction.dispatchGetAuctionResult({ auctionId: this.$route.params.id })
  }
})
</script>

<style scoped lang="scss">
.content {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
}
</style>
