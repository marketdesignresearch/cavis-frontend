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

    <button class="btn mt-2 btn-success btn-sm" @click="nextRound()">Next Round</button>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import auction, { ApiAuctionType, ApiAuction, ApiBid, ApiRound, ApiMechanismType } from '../../../store/modules/auction'
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
        case ApiAuctionType.SIMULTANEOUS_FIRST_PRICE:
          return 'Simultaneous First-Price'
        case ApiAuctionType.SIMULTANEOUS_SECOND_PRICE:
          return 'Simultaneous Second-Price'
        default:
          return ''
      }
    },
    rounds(): ApiRound[] {
      return this.$props.auction.auction.rounds
    }
  },
  methods: {
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
