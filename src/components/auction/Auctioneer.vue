<template>
  <div class="text-right">
    <b-button v-b-toggle.collapse-auctioneer size="sm">Toggle Auctioneer</b-button>
    <b-collapse id="collapse-auctioneer" class="mt-2 text-left">
      <div class="card shadow-sm">
        <div class="card-body" v-if="currentRound">
          <h4 class="card-subtitle mb-2 text-muted">Current Allocation</h4>
          <table class="table table-sm table-striped">
            <thead>
              <tr>
                <th scope="col">Bidder</th>
                <th scope="col">Bid</th>
                <th scope="col">Payment</th>
                <th scope="col">Goods</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(value, key) in currentRound.mechanismResult.allocation" :key="key">
                <td>{{ key }}</td>
                <td>{{ value.value }}</td>
                <td>{{ currentRound.mechanismResult.payments[key] }}</td>
                <td>
                  <span class="badge badge-sm badge-success" v-for="(value, key) in value.goods" :key="key">
                    {{ value }}x {{ key }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>


          <h4 class="card-subtitle mb-2 text-muted">Current Bids</h4>
          <table class="table table-sm table-striped">
            <thead>
              <tr>
                <th scope="col">Bidder</th>
                <th scope="col">Bundle</th>
                <th scope="col">Bid</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="bid of currentRound.bids" :key="bid.id">
                <td>{{ bid.bidderId }}</td>
                <td><span class="badge badge-sm badge-secondary" v-for="(bundle, index) in bid.bundle" :key="'bundle-' + index">{{ bundle.amount }}x {{ bundle.good }}</span></td>
                <td>{{ bid.amount }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="card-body" v-if="!currentRound">
          No rounds played yet.
        </div>
      </div>
    </b-collapse>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import auction, { ApiAuctionType } from '../../store/modules/auction'

export default Vue.extend({
  name: 'AuctionAuctioneer',
  props: ['auctionId'],
  computed: {
    currentRound: function () {
      const rounds = auction.auctionById()(this.$props.auctionId).auction.rounds
      return rounds[rounds.length - 1]
    }
  }
});
</script>

<style scoped lang="scss">
.bidder {
  padding: 10px;
}
</style>
