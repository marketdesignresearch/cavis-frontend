<template>
  <div>
    <div class="small pb-2">Auction: Single-Item First-Price</div>

    <button class="btn btn-success btn-sm" @click="nextRound()">Get Auction Results</button>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import auction, { ApiAuctionType, ApiAuction, ApiBid } from '../../../store/modules/auction'
import selection from '../../../store/modules/selection'
import RoundMixinVue from './RoundMixin.vue'

export default Vue.extend({
  props: ['auction'],
  mixins: [RoundMixinVue]
})
</script>

<style scoped lang="scss"></style>
