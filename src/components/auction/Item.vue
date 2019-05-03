<template>
  <div class="item"></div>
</template>

<script lang="ts">
import Vue from 'vue';

export interface IAuctionItem {
  name: string
  value: number
}

const AuctionItemComponent = Vue.extend({
  name: 'AuctionItem',
  props: ['item']
});

export default AuctionItemComponent
export { AuctionItemComponent }
</script>

<style scoped lang="scss">
.item {
  background: black;
  width: 10px;
  height: 10px;
  margin: 5px;
  display: inline-flex;
}
</style>
