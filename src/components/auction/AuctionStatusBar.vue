<template>
  <div class="status-bar-container" v-if="auction">
    <div class="status-bar shadow-lg d-flex">
      <!-- v-intro="'Here, you can see some general information about the auction (like its type).'" -->
      <auction-static-information :auction="auction" />
      <div class="text-center flex-grow-1">
        <!-- given no round type, its a standard bidding round -->
        <div v-if="!auction.auction.currentRoundType">
          <span class="text-bolder">
            Auction Phase:
            <b>Bidding Round</b>
          </span>
          <br />
          <span class="small">Change existing or submit additional bids.</span>
        </div>

        <!-- roundType -->
        <div v-if="auction.auction.currentRoundType">
          <b>{{ auction.auction.currentRoundType }}</b>
          <br />

          <!-- PVM & Initial Round -->
          <span class="small">In this round, a initial set of bids is collected from all bidders.</span>
        </div>
      </div>

      <!-- v-intro="'You can advance the auction with the actions provided in this area. In a single-round auction, this means you can close the auction and get the outcome; In a multi-round auction, you are able to advance a round (and when all the rounds are played, close the auction).'" -->
      <component :is="roundType" :auction="auction" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import auction, { ApiAuction } from '../../store/modules/auction'

const AuctionStatusBarComponent = Vue.extend({
  name: 'AuctionStatusBar',
  props: ['auctionId'],
  components: {
    'auction-static-information': () => import('@/components/auction/rounds/StaticInformation.vue')
  },
  computed: {
    auction(): ApiAuction {
      return auction.auctionById()(this.$props.auctionId)
    },
    roundType(): string {
      return 'component-round-' + this.auction.auctionType
    }
  }
})

export default AuctionStatusBarComponent
export { AuctionStatusBarComponent }
</script>

<style scoped lang="scss">
@import '../../custom.scss';

.status-bar-container {
  position: fixed;
  width: 100%;
  bottom: 30px;
}

.status-bar {
  margin: 0 auto;
  border-radius: 50px;

  padding: 30px;

  height: 120px;
  width: 100%;
  max-width: 1024px;
  background-color: white;
}
</style>
