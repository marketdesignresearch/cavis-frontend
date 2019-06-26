<template>
  <div v-if="auctionId">

    <div class="row">
      <div class="col">
      
      </div>
      <div class="col text-center">
        <img src="../../assets/auctioneer.png" class="logo mt-3" v-b-toggle.collapse-auctioneer />
        <p>
          <b-button v-b-toggle.collapse-auctioneer size="sm" class="mt-3">Toggle Auctioneer</b-button>
        </p>
      </div>
      <div class="col text-right">
        <p class="my-4">
          <button class="btn btn-success btn-sm ml-2" @click="results()">Get Auction Results</button>
        </p>
      </div>
    </div>

    <b-collapse id="collapse-auctioneer" class="mt-2 text-left">
      <div class="row">
        <div class="col">
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
        <div class="col">
        </div>
        <div class="col">
        </div>
      </div>
    </b-collapse>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import auction, { ApiAuctionType, ApiRound } from '../../store/modules/auction'
import BidderService from '../../services/bidder'

export default Vue.extend({
  name: 'AuctionAuctioneer',
  props: ['auctionId'],
  computed: {
    currentRound (): ApiRound | null {
      if (this.$props.auctionId) {
        const rounds = auction.auctionById()(this.$props.auctionId).auction.rounds
        return rounds[rounds.length - 1]
      }

      return null
    }
  },
  methods: {
    autoBid () {
      BidderService.autoBidAll(this.$props.auctionId)
    },
    allocate () {
      auction.dispatchPlaceBids({ auctionId: this.$route.params.id })
    },
    results () {
      this.allocate()
      this.$router.push({ name: 'auction-result', params: { id: this.$props.auctionId } })
    }
  }
});
</script>

<style scoped lang="scss">
.bidder {
  padding: 10px;
}

.logo {
  width: 50px;
}
</style>
