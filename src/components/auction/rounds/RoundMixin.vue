<script lang="ts">
import Vue from 'vue'
import auction, { ApiAuctionType, ApiAuction, ApiBid } from '../../../store/modules/auction'
import selection from '../../../store/modules/selection'

export default Vue.mixin({
  methods: {
    async nextRound() {
      const result = await auction.dispatchPlaceBids({ auctionId: this.$props.auction.id })
      selection.commitUnselectAll()
      if (result.auction.finished) {
        this.$router.push({ name: 'auction-result', params: { id: this.$props.auction.id } })
      } else {
        const bundleValues = await auction.dispatchPropose({
          auctionId: this.$props.auction.id,
          bidderIds: auction.biddersById()(this.$props.auction.id)
        })

        bundleValues.forEach(bundleValue => {
          const apiBid: ApiBid = {
            amount: bundleValue.amount!,
            bidderId: bundleValue.bidderId!,
            bundle: bundleValue.bundle
          }
          auction.commitUpdateBidder({ bidderId: bundleValue.bidderId!, bid: apiBid })
        })
      }
    }
  }
})
</script>
