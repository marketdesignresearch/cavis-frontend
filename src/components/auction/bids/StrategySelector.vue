<template>
  <div class="text-left text-bold">
    <small>Strategy:</small>
    <b-form-select v-model="strategy.selected" @change="strategyChanged" :options="strategy.options"></b-form-select>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import auction, { ApiBidderStrategy, ApiBid } from '../../../store/modules/auction'
import { mapGetters } from 'vuex'
import selection from '../../../store/modules/selection'

export default Vue.extend({
  props: ['auctionId'],
  data() {
    return {
      strategy: {
        selected: ApiBidderStrategy.TRUTHFUL,
        options: [{ value: ApiBidderStrategy.TRUTHFUL, text: 'Truthful' }, { value: ApiBidderStrategy.CUSTOM, text: 'Custom' }]
      }
    }
  },
  computed: {
    selectedBidder(): string | null {
      return selection.selectedBidder()
    },
    selectedBidderStrategy(): string | undefined {
      const bidderId = selection.selectedBidder()
      if (bidderId) {
        return auction.bidderById()(bidderId).strategy
      }
    }
  },
  watch: {
    selectedBidderStrategy: function(newStrategy) {
      this.strategy.selected = newStrategy
    }
  },
  methods: {
    async strategyChanged(newStrategy: ApiBidderStrategy, oldStrategy: ApiBidderStrategy) {
      if (!this.selectedBidder) {
        return
      }

      try {
        if (newStrategy === ApiBidderStrategy.TRUTHFUL && newStrategy !== oldStrategy) {
          await this.$bvModal.msgBoxConfirm('All your bids will be overriden, are you sure?')
          const bids: ApiBid[] = await auction.dispatchPropose({
            auctionId: this.auctionId,
            bidderIds: [this.selectedBidder]
          })

          auction.commitRemoveBids({ bidderId: this.selectedBidder })

          bids.forEach(bid => {
            auction.commitUpdateBidder({ bidderId: bid.bidderId!, bid: bid })
          })

          auction.commitChangeBidderStrategy({ bidderId: this.selectedBidder, strategy: ApiBidderStrategy.TRUTHFUL })
        } else {
          auction.commitChangeBidderStrategy({ bidderId: this.selectedBidder, strategy: ApiBidderStrategy.CUSTOM })
        }
      } catch (error) {
        console.warn(error)
      }
    }
  }
})
</script>

<style scoped lang="scss"></style>
