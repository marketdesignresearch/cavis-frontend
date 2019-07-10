<template>
  <div class="small">
    <div>Auction: {{ auctionType }}</div>
    <div>
      Round:
      <nav v-if="rounds" class="d-inline-flex">
        <span class="round" :class="{ active: rounds.length === 0 }">
          <a href="#" @click="resetRound(0)">1</a>
        </span>
        <span class="round" v-for="(round, index) in rounds" :key="round.roundNumber" :class="{ active: index === rounds.length - 1 }">
          <span v-if="index < rounds.length">&nbsp;/&nbsp;</span>
          <a href="#" @click="resetRound(round.roundNumber)">{{ round.roundNumber + 1 }}</a>
        </span>
      </nav>
    </div>

    <div v-if="currentRound">
      <div v-if="currentRound.type === 'CLOCK'">Clock Round</div>
      <div v-if="currentRound.type === 'SUPPLEMENTARY'">Supplementary Round</div>
    </div>

    <button class="btn mt-2 btn-success btn-sm" @click="nextRound()" v-if="!isFinished">Next Round</button>
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
    isFinished(): boolean {
      return this.$props.auction.auction.finished
    },
    auctionType(): string {
      switch (this.$props.auction.auction.mechanismType) {
        case ApiAuctionType.VCG_XOR:
          return 'CCA VCG'
        default:
          return ''
      }
    },
    currentRound(): ApiRound {
      const rounds = this.$props.auction.auction.rounds
      return rounds.length > 0 ? rounds[rounds.length - 1] : null
    },
    rounds(): ApiRound[] {
      return this.$props.auction.auction.rounds
    }
  },
  methods: {
    resetRound(round: number) {
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
