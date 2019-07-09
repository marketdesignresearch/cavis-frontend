<template>
  <div>
    <div class="small pb-2">Auction: VCG</div>

    <button class="btn btn-success btn-sm" @click="nextRound()">Get Auction Results</button>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import auction, { ApiAuctionType, ApiAuction, ApiBid } from '../../../store/modules/auction'
import selection from '../../../store/modules/selection'

export default Vue.extend({
  props: ['auction'],
  data() {
    return {}
  },
  methods: {
    nextRound() {
      auction.dispatchPlaceBids({ auctionId: this.$props.auction.id })
      selection.commitUnselectAll()
      this.$router.push({ name: 'auction-result', params: { id: this.$props.auction.id } })
    }
  }
})
</script>

<style scoped lang="scss"></style>
