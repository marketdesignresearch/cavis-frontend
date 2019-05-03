<template>
  <div>
    {{ bidder.name }}
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'AuctionBidder',
  props: ['bidder']
});
</script>

<style scoped lang="scss">
.bidder {
  margin: 5px;
  display: inline-flex;
}
</style>
