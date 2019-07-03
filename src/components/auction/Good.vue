<template>
    <div class="flex-column">
      <div class="card good shadow-sm" :class="{ 'selected': isSelected, 'disabled': !isAllowed }">
        <div class="price" v-if="priceForGood">{{ priceForGood }} $</div>
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
import GoodsService from '@/services/goods'

export interface IAuctionGood {
  name: string
  value: number
}

const AuctionGoodComponent = Vue.extend({
  name: 'AuctionGood',
  components: {
    'el-popover': Popover
  },
  props: ['auctionId', 'good', 'isSelected', 'bidder'],
  computed: {
    priceForGood: function (): number | null {
      return auction.priceForGood()(this.$props.auctionId, this.$props.good.id)
    },
    isAllowed: function (): boolean {
      return GoodsService.isAllowed(this.$props.bidder, this.$props.auctionId, [this.$props.good])
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

  &.disabled {
    opacity: 0.5;
    pointer-events: none;
    cursor: not-allowed;
  }

  .price {
    font-size: 0.8rem;
    height: 100%;
    line-height: 75px;
  }

  user-select: none;
  margin: 0 auto;
  cursor: pointer;
  width: 75px;
  height: 75px;
  margin: 5px;
  display: inline-flex;

}
</style>
