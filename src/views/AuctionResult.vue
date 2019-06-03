
<template>
  <div>
    <div class="container content" v-if="allocation">
      <div class="row">
        <div class="col">
        <h1>Result of Auction</h1>
        
        <p>Total Payments: {{ allocation.payments.totalPayments }}</p>

        <h2>Allocation</h2>
        <table class="table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Bidder</th>
              <th scope="col">Value</th>
              <th scope="col">Payment</th>
              <th scope="col">Goods</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(value, key) in allocation.allocation" :key="key">
              <th scope="row">1</th>
              <td>{{ key }}</td>
              <td>{{ value.value }}</td>
              <td>{{ allocation.payments[key] }}</td>
              <td>
                <span v-for="(value, key) in value.goods" :key="key">
                  {{ value }}x {{ key }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      </div>

    </div>
    <AuctionProgress stage="result" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import auction, { ApiAuctionType, ApiAuction, ApiAuctionAllocation } from '../store/modules/auction'
import AuctionProgress from '@/components/auction/Progress.vue'

export default Vue.extend({
  name: 'AuctionResultView',
  components: {
    'AuctionProgress': AuctionProgress
  },
  computed: {
    allocation(): ApiAuctionAllocation | undefined {
      return auction.auctionById()(this.$route.params.id).allocation
    },
    auctionId(): string {
      return this.$route.params.id
    }
  },
  mounted () {
    // fetch allocation
    auction.dispatchAllocateAuction({ auctionId: this.$route.params.id })
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
