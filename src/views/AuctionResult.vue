
<template>
  <div>
    <h1>Result of Auction</h1>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import auction, { ApiAuctionType, ApiAuction } from '../store/modules/auction'

export default Vue.extend({
  name: 'AuctionResultView'
})
</script>

<style scoped lang="scss">
</style>
