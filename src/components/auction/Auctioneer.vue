<template>
  <div v-if="auction">

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
          <component :is="roundType" :auction="auction" />
        </p>
      </div>
    </div>

    <b-collapse id="collapse-auctioneer" class="mt-2 text-left">
      <div v-if="currentRound">
        <h4 class="card-subtitle mb-2 text-muted">Current Allocation</h4>
        
        <table class="table table-bidder">
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
        <table class="table table-bidder">
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
      <b-tabs content-class="mt-3">
        <b-tab v-for="round in rounds" :title="'Round ' + round.roundNumber" :key="round.roundNumber">
          <table class="table table-bidder">
            <thead>
              <tr>
                <th scope="col">Bidder</th>
                <th scope="col">
                  <div>Values</div>
                  <div class="d-flex d-flex-column">
                    <div class="flex-grow-1 flex-basis-0" v-for="(goodSet, index) in goodCombinations" :key="'set' + index">
                      <good-badge :goods="goodSet" />
                    </div>
                  </div>
                </th>
                <th scope="col">Bids</th>
                <th scope="col">Allocation</th>
                <th scope="col">Payment</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="bidder of bidders" :key="bidder.id">
                <td>{{ bidder.name }}</td>
                <td>
                  <div class="d-flex d-flex-column">
                    <div class="flex-grow-1 flex-basis-0" v-for="(goodSet, index) in goodCombinations" :key="'set' + index">
                      {{ valueForGood(bidder, goodSet) }}
                    </div>
                  </div>
                </td>
                <td>
                  -
                </td>
                <td>
                  -
                </td>
                <td>
                  -
                </td>
              </tr>
            </tbody>
          </table>
        </b-tab>
      </b-tabs>
    </b-collapse>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import auction, { ApiAuctionType, ApiRound, ApiAuction, ApiBidder, ApiGood } from '../../store/modules/auction'
import BidderService from '../../services/bidder'
import GoodsService from '../../services/goods'
import GoodBadgeComponent from './GoodBadge.vue';

export default Vue.extend({
  name: 'AuctionAuctioneer',
  props: ['auction'],
  components: {
    'good-badge': GoodBadgeComponent
  },
  computed: {
    roundType (): string {
      return 'component-round-' + this.$props.auction.auctionType
    },
    currentRound (): ApiRound | null {
      const rounds = this.$props.auction.auction.rounds
      return rounds[rounds.length - 1]
    },
    rounds (): ApiRound[] {
      return [{ roundNumber: 0 }, ...this.$props.auction.auction.rounds]
    },
    goods (): ApiGood[] {
      const goods = this.$props.auction.auction.domain.goods
      return goods
    },
    bidders (): ApiBidder[] {
      const bidders = this.$props.auction.auction.domain.bidders
      return bidders
    },
    goodCombinations (): ApiGood[][] {
      return GoodsService.goodCombinations(this.$props.auction.uuid)
    }
  },
  methods: {
    autoBid () {
      BidderService.autoBidAll(this.$props.auction.id)
    },
    allocate () {
      auction.dispatchPlaceBids({ auctionId: this.$props.auction.id })
    },
    results () {
      this.allocate()
      this.$router.push({ name: 'auction-result', params: { id: this.$props.auction.id } })
    },
    valueForGood(bidder: ApiBidder, goods: ApiGood[]) {
      return GoodsService.valueForGood(bidder, goods)
    },
    priceForGood(bidder: ApiBidder, goods: ApiGood[]) {
      return GoodsService.priceForGood(bidder, this.$props.auctionId, goods)
    },
    bidForGood(bidder: ApiBidder, goods: ApiGood[]) {
      return GoodsService.bidForGood(bidder, goods)
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

.flex-basis-0 {
  flex-basis: 0;
}
</style>
