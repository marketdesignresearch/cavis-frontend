<template>
  <div class="flex-column">
    <div class="good" :class="{ selected: isSelected, disabled: !isAllowed }">
      <div class="card-edge-top">{{ good.name }}</div>
      <div class="card-edge-bottom">{{ good.name }}</div>
      <div class="name">{{ good.name }}</div>
      <span class="badge badge-success badge-pill badge-price" v-if="priceForGood">
        {{ priceForGood | formatNumber }} <font-awesome-icon icon="dollar-sign" />
      </span>
      <div class="proposedValue" v-if="showProposedValue">{{ proposedBundleValue | formatNumber }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import auction, { ApiAuctionType, ApiBidder, ApiBid, ApiGood } from '../../store/modules/auction'
import GoodsService from '@/services/goods'
import selection from '../../store/modules/selection'
import api from '../../services/api'
import hashBundle from '../../services/bundleHash'

export interface IAuctionGood {
  name: string
  value: number
}

const AuctionGoodComponent = Vue.extend({
  name: 'AuctionGood',
  props: ['auctionId', 'goodId'],
  watch: {
    selectedBidder: async function(current, previous) {
      if (current) {
        this.updateProposedValue(current)
      }
    },
    bundleHash: async function(current, previous) {
      const bidderId = selection.state().selectedBidder

      if (bidderId) {
        this.updateProposedValue(bidderId)
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
  methods: {
    updateProposedValue: async function(bidderId: string) {
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
    }
  },
  computed: {
    showProposedValue: function(): boolean {
      return selection.selectedGoods().indexOf(this.$props.goodId) === -1 && this.$data.proposedBundleValue !== null
    },
    selectedBidder: function(): string | null {
      return selection.state().selectedBidder
    },
    bundleHash: function(): string {
      return Object.keys(selection.state().selectedGoods)
        .sort()
        .join()
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

      const entries = [{ good: this.good.id!, amount: 1 }]
      return GoodsService.isAllowed({ entries: entries, hash: hashBundle(entries) }, selectedBidder, this.$props.auctionId) // FIXME
    }
  }
})

export default AuctionGoodComponent
export { AuctionGoodComponent }
</script>

<style scoped lang="scss">
@import '../../custom.scss';

.good {
  position: relative;
  background-image: url('../../assets/card-blank.png');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;

  .card-edge-top {
    position: absolute;
    top: 5px;
    left: 8px;
    font-size: 10px;
    opacity: 0.5;
  }

  .card-edge-bottom {
    display: none;
    position: absolute;
    bottom: 5px;
    right: 8px;
    font-size: 10px;
    transform: rotate(180deg);
    opacity: 0.5;
  }

  .name {
    position: absolute;
    font-size: 28px;
    width: 60px;
    margin-top: 10px;
    text-align: center;
  }

  &:hover {
    background-image: url('../../assets/card-blank-selected.png');
  }

  &.selected {
    background-image: url('../../assets/card-blank-selected-success.png');
    color: white;
  }

  &.disabled {
    opacity: 0.5;
  }

  .badge-price {
    font-size: 0.8rem;
    position: absolute;
    bottom: -10px;
    right: -10px;
  }

  .proposedValue {
    font-size: 0.8rem;
    height: 100%;
    line-height: 70px;
    text-align: center;
    position: absolute;
    top: 25px;
    width: 100%;
    opacity: 0.75;
  }

  user-select: none;
  margin: 0 auto;
  cursor: pointer;
  width: 60px;
  height: 80px;
  margin: 20px;
  display: inline-flex;
}
</style>
