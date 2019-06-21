import auction, { ApiBidder } from '@/store/modules/auction'

export default {
  autoBid(auctionId: string, bidder: ApiBidder) {
    if (bidder.value && bidder.id) {
      let bundle: any = {}
      bidder.value.bundleValues[0].bundle.forEach(bid => {
        bundle[bid.good] = bid.amount
      })

      auction.commitUpdateBidder({
        auctionId: auctionId,
        bidderId: bidder.id!,
        bid: {
          amount: bidder.value.bundleValues[0].amount,
          bidderId: bidder.id,
          bundle: bundle
        }
      })
    }
  }
}
