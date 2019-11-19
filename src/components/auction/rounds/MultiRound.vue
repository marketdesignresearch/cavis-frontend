<template>
  <div class="small">
    <div v-if="rounds.length > 0 && !finished">
      Current Round:
      <b>{{ rounds[rounds.length - 1].roundNumber + 1 }}</b>
    </div>
    <div v-else-if="!finished">
      Current Round:
      <b>1</b>
    </div>

    <div v-if="finished">Auction Finished ({{ rounds.length }} Rounds)</div>

    <b-dropdown v-if="!finished" class="mt-2" right size="sm" variant="success" split text="Next Round" @click="nextRound">
      <b-dropdown-item @click="advancePhase">Skip Phase</b-dropdown-item>
    </b-dropdown>

    <button class="btn mt-2 btn-success btn-sm" @click="showAuctionResults()" v-if="finished">Show Auction Result</button>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import auction, { ApiAuctionType, ApiAuction, ApiBid, ApiRound } from '../../../store/modules/auction'
import selection from '../../../store/modules/selection'
import RoundMixinVue from './RoundMixin.vue'

export default Vue.extend({
  props: ['auction'],
  mixins: [RoundMixinVue],
  computed: {
    auctionType(): string {
      switch (this.$props.auction.auctionType) {
        case ApiAuctionType.SEQUENTIAL_FIRST_PRICE:
          return 'Sequential First-Price'
        case ApiAuctionType.SEQUENTIAL_SECOND_PRICE:
          return 'Sequential Second-Price'
        case ApiAuctionType.CCA:
          return 'Combinatorial Clock Auction (CCA)'
        case ApiAuctionType.PVM:
          return 'Linear Regression PVM'
        default:
          return ''
      }
    },
    rounds(): ApiRound[] {
      return this.$props.auction.auction.rounds
    },
    currentRoundType(): string {
      return this.$props.auction.auction.currentRoundType
    },
    finished(): boolean {
      return this.$props.auction.auction.finished
    }
  },
  methods: {
    showAuctionResults() {
      this.$router.push({ name: 'auction-result', query: { auctions: [this.$props.auction.id] } })
    },
    async resetRound(round: number) {
      auction.dispatchResetAuctionToRound({ auctionId: this.$props.auction.id, round: round })
      selection.commitUnselectAll()
    },
    advancePhase() {
      auction.dispatchAdvancePhase({ auctionId: this.$props.auction.id })
    }
    /*
     * This does not apply bids!
    async advanceRound() {
      await auction.dispatchAdvanceRound({ auctionId: this.$props.auction.id })
    }
    */
  }
})
</script>

<style scoped lang="scss">
@import '../../../custom';

span {
  a {
    color: theme-color('secondary');
  }

  &.active {
    font-weight: bold;
  }
}
</style>
