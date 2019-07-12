<script lang="ts">
import Vue from 'vue'
import auction, { ApiAuctionType, ApiAuction, ApiBid } from '../../../store/modules/auction'
import selection from '../../../store/modules/selection'

export default Vue.mixin({
  methods: {
    async nextRound() {
      const result = await auction.dispatchPlaceBids({ auctionId: this.$props.auction.id })
      selection.commitUnselectAll()
      if (!result.auction.finished) {
        const bids: ApiBid[] = await auction.dispatchPropose({
          auctionId: this.$props.auction.id,
          bidderIds: auction.biddersById()(this.$props.auction.id)
        })

        bids.forEach(bid => {
          auction.commitUpdateBidder({ bidderId: bid.bidderId!, bid: bid })
        })
      }
    }
  }
})
</script>
