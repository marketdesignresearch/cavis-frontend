<template>
  <div>
    <div class="small pb-2">Auction: {{ auctionType }}</div>
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

    <button class="btn btn-success btn-sm" @click="nextRound()">Next Round</button>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import auction, { ApiAuctionType, ApiAuction, ApiBid, ApiRound } from '../../../store/modules/auction'

export default Vue.extend({
  props: ['auction'],
  computed: {
    auctionType(): string {
      switch (this.$props.auction.auction.mechanismType) {
        case ApiAuctionType.VCG_XOR:
          return 'CCA VCG'
        default:
          return ''
      }
    },
    rounds(): ApiRound[] {
      return this.$props.auction.auction.rounds
    }
  },
  methods: {
    resetRound(round: number) {
      auction.dispatchResetAuctionToRound({ auctionId: this.$props.auction.id, round: round })
    },
    nextRound() {
      auction.dispatchPlaceBids({ auctionId: this.$props.auction.id })
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
