<template>
    <div class="card good d-flex justify-content-center shadow-sm" :class="{ 'selected': isSelected }">
      <div class="align-self-center">
      {{ good.id.substr(good.id.length - 1) }}
      </div>
    </div>
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
@import '../../custom.scss';

.good {
  &.selected {
    @extend .bg-primary;
    @extend .text-white;
  }
  user-select: none;
  margin: 0 auto;
  cursor: pointer;
  width: 50px;
  height: 50px;
  margin: 5px;
  display: inline-flex;

}
</style>
