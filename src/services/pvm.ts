import { ApiAuction, ApiBundleEntryWrapper } from '@/store/modules/auction'
import selection from '@/store/modules/selection'

export default {
  selectQueriedBundle(auction: ApiAuction) {
    selection.commitUnselectGoods()
    this.queriedBundle(auction, selection.selectedBidder()!).forEach(bundleEntryWrapper => {
      bundleEntryWrapper.entries.forEach(value => {
        selection.commitSelectGood({ goodId: value.good })
      })
    })
  },
  queriedBundle(auction: ApiAuction, bidderId: string): ApiBundleEntryWrapper[] {
    return auction.auction.restrictedBids[bidderId]
  }
}
