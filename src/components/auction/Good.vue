<template>
    <div class="item shadow-sm" :class="{ 'selected': isSelected }"></div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Popover } from 'element-ui'

export interface IAuctionGood {
  name: string
  value: number
}

const AuctionGoodComponent = Vue.extend({
  name: 'AuctionGood',
  components: {
    'el-popover': Popover
  },
  props: ['good', 'isSelected']
});

export default AuctionGoodComponent
export { AuctionGoodComponent }
</script>

<style scoped lang="scss">
.item {
  &.selected {
    background: black;
  }
  cursor: pointer;
  background: white;
  border: 1px solid #33333350;
  width: 20px;
  height: 20px;
  margin: 5px;
  display: inline-flex;
}
</style>
