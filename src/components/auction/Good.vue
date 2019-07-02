<template>
    <div class="flex-column">
      <div class="card good shadow-sm" :class="{ 'selected': isSelected }">
        <div class="price" v-if="priceForGood !== null">{{ priceForGood }} $</div>
      </div>
      <div class="pt-2">
        {{ good.id }}
      </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Popover } from 'element-ui'
import auction, { ApiAuctionType, ApiBidder, ApiBid, ApiGood } from '../../store/modules/auction'

export interface IAuctionGood {
  name: string
  value: number
}

const AuctionGoodComponent = Vue.extend({
  name: 'AuctionGood',
  components: {
    'el-popover': Popover
  },
  props: ['auctionId', 'good', 'isSelected'],
  computed: {
    priceForGood: function () {
      return auction.priceForGood()(this.$props.auctionId, this.$props.good.id)
    }
  }
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

  .price {
    height: 100%;
    line-height: 50px;
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
