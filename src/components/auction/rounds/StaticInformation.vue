<template>
  <div>
    <div class="small">
      Auction Mechanism:
      <b>{{ auctionType }}</b>
    </div>
    <div class="small" v-if="roundTypeShown">
      Type of Round:
      <b>{{ currentRoundType ? currentRoundType : 'Single-Round Auction' }}</b>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import auction, {
  ApiAuctionType,
  ApiAuction,
  ApiBid,
  ApiRound,
  ApiAuctionPaymentRule,
  ApiAuctionOutcomeRule
} from '../../../store/modules/auction'
import selection from '../../../store/modules/selection'
import RoundMixinVue from './RoundMixin.vue'

export default Vue.extend({
  props: {
    auction: Object,
    roundTypeShown: {
      type: Boolean,
      default: true
    }
  },
  mixins: [RoundMixinVue],
  computed: {
    paymentRule() {
      switch (this.$props.auction.auction.outcomeRule) {
        case ApiAuctionOutcomeRule.VCG_XOR:
          return 'VCG XOR'
        case ApiAuctionOutcomeRule.CCG:
          return 'CCG'
        default:
          return ''
      }
    },
    auctionType() {
      switch (this.$props.auction.auctionType) {
        case ApiAuctionType.SINGLE_ITEM_FIRST_PRICE:
          return 'First Price Auction'
        case ApiAuctionType.SINGLE_ITEM_SECOND_PRICE:
          return 'Second Price Auction'
        case ApiAuctionType.SIMULTANEOUS_FIRST_PRICE:
          return 'Simultaneous Multi-Item First Price Auction'
        case ApiAuctionType.SIMULTANEOUS_SECOND_PRICE:
          return 'Simultaneous Multi-Item Second Price Auction'
        case ApiAuctionType.VCG:
          return 'VCG Auction'
        case ApiAuctionType.SEQUENTIAL_FIRST_PRICE:
          return 'Sequential First-Price'
        case ApiAuctionType.SEQUENTIAL_SECOND_PRICE:
          return 'Sequential Second-Price'
        case ApiAuctionType.CCA:
          return 'Combinatorial Clock Auction (CCA)'
        case ApiAuctionType.PVM:
          return 'Linear Regression PVM'
        default:
          return ''
      }
    },
    currentRoundType(): string {
      return this.$props.auction.auction.currentRoundType
    }
  },
  methods: {
    async getAuctionResults() {
      const result = await auction.dispatchPlaceBids({ auctionId: this.$props.auction.id })
      selection.commitUnselectAll()
      this.$router.push({ name: 'auction-result', query: { auctions: [this.$props.auction.id] } })
    }
  }
})
</script>

<style scoped lang="scss"></style>
