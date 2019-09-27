<template>
  <div class="small">
    <div v-if="rounds.length > 0">
      Current Round: <b>{{ rounds[rounds.length - 1].roundNumber + 1 }}</b>
      <!--
      <nav class="d-inline-flex">
        <span class="round" :class="{ active: rounds.length === 0 }">
          <a href="#" v-if="rounds.length > 0" @click="resetRound(0)">1</a>
          <span v-if="rounds.length === 0">1</span>
        </span>
        <span v-if="rounds.length >= 15">&nbsp;/&nbsp;...</span>
        <span class="round" v-for="(round, index) in rounds" :key="round.roundNumber" :class="{ active: index === rounds.length - 1 }">
          <span v-if="index > rounds.length - 4 || rounds.length < 15">
            <span>&nbsp;/&nbsp;</span>
            <a href="#" v-if="index < rounds.length - 1" @click="resetRound(round.roundNumber)">{{ round.roundNumber + 1 }}</a>
            <span v-if="index === rounds.length - 1 && !finished">{{ round.roundNumber + 1 }}</span>
            <span v-if="index === rounds.length - 1 && finished">END</span>
          </span>
        </span>
      </nav>
      -->
    </div>

    <button class="btn mt-2 btn-success btn-sm" @click="nextRound()" v-if="!finished">Next Round</button>
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
          return 'PVM Auction'
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
    }
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
