<template>
  <div>
    <div>Auction: CCA</div>
    <div>Rounds: 
      <nav v-if="rounds" class="d-inline-flex">
        <ul class="pagination pagination-sm">
          <li class="page-item" :class="{ 'active': rounds.length === 0 }">
            <a class="page-link" href="#" @click="resetRound(0)" >Start</a>
          </li>
          <li class="page-item" v-for="round in rounds" :key="round.roundNumber" :class="{ 'active': round.roundNumber === rounds.length }">
            <a class="page-link" href="#" @click="resetRound(round.roundNumber)" v-if="round.roundNumber < rounds.length"> {{ round.roundNumber }}</a>
            <span class="page-link active" v-if="round.roundNumber === rounds.length"> {{ round.roundNumber }}</span>
          </li>
        </ul>
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
      rounds(): ApiRound[] {
        return this.$props.auction.auction.rounds
      }
    },
    data () {
      return {
      }
    },
    methods: {
      resetRound(round: number) {
        auction.dispatchResetAuctionToRound({ auctionId: this.$props.auction.uuid, round: round })
      },
      nextRound() {
        auction.dispatchPlaceBids({ auctionId: this.$props.auction.uuid })
      }
    }
})
</script>

<style scoped lang="scss">
</style>
