<template>
  <div class="flex-column">
    <div class="card good shadow-sm" :class="{ selected: isSelected, disabled: !isAllowed }">
      <div class="price" v-if="priceForGood">{{ priceForGood | formatNumber }} $</div>
      <div class="proposedValue" v-if="proposedBundleValue && !isSelected && isAllowed">{{ proposedBundleValue | formatNumber }} $</div>
    </div>
    <div class="pt-2">
      {{ good.name }}
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import auction, { ApiAuctionType, ApiBidder, ApiBid, ApiGood } from '../../store/modules/auction'
import GoodsService from '@/services/goods'
import selection from '../../store/modules/selection'
import api from '../../services/api'

export interface IAuctionGood {
  name: string
  value: number
}

const AuctionGoodComponent = Vue.extend({
  name: 'AuctionGood',
  props: ['auctionId', 'goodId'],
  watch: {
    bundleHash: async function(current, previous) {
      const bidderId = selection.state().selectedBidder

      if (current && bidderId) {
        const bundle: { [x: string]: number } = {}

        Object.keys(selection.state().selectedGoods).forEach(key => {
          bundle[key] = 1
        })

        bundle[this.$props.goodId] = 1

        const valueQuery = {
          bidders: [bidderId],
          bundles: [bundle]
        }

        const { data: valueQueryResult } = await api().post(`/auctions/${this.$props.auctionId}/valuequery`, valueQuery)
        this.$data.proposedBundleValue = valueQueryResult[bidderId][0].value
      } else {
        this.$data.proposedBundleValue = null
      }
    }
  },
  data: () => {
    return {
      proposedBundleValue: null
    }
  },
  computed: {
    bundleHash: function(): string {
      return Object.keys(selection.state().selectedGoods).sort().join()
    },
    hasBundleValue: function(): boolean {
      return Object.keys(selection.state().selectedGoods).length > 0 && !selection.state().selectedGoods[this.$props.goodId]
    },
    isSelected: function(): boolean {
      return selection.state().selectedGoods[this.$props.goodId]
    },
    good: function(): ApiGood {
      return auction.goodById()(this.$props.goodId)
    },
    priceForGood: function(): number | null {
      return auction.priceForGood()(this.$props.auctionId, this.$props.goodId)
    },
    isAllowed: function(): boolean {
      const selectedBidder = selection.selectedBidder()

      if (!selectedBidder) {
        return false
      }
      return GoodsService.isAllowed([{ good: this.good.id!, amount: 1 }], selectedBidder, this.$props.auctionId) // FIXME
    }
  }
})

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
    text-align: center;
    position: absolute;
    width: 100%;
  }

  .proposedValue {
    font-size: 0.8rem;
    height: 100%;
    line-height: 75px;
    text-align: center;
    position: absolute;
    width: 100%;
    opacity: 0.75;
    margin-top: 18px;
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
