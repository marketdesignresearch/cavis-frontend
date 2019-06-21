import auction, { ApiBidder, ApiGood } from '@/store/modules/auction'

export default {
  removeBid(auctionId: string, bidder: ApiBidder, bundle: ApiGood[]) {
    auction.commitRemoveBid({
      auctionId: auctionId,
      bidderId: bidder.id!,
      bundle: bundle
    })
  },
  autoBid(auctionId: string, bidder: ApiBidder) {
    if (bidder.value && bidder.id) {
      bidder.value.bundleValues.forEach(value => {
        let bundle: any = {}

        value.bundle.forEach(bid => {
          bundle[bid.good] = bid.amount
        })

        auction.commitUpdateBidder({
          auctionId: auctionId,
          bidderId: bidder.id!,
          bid: {
            amount: value.amount,
            bidderId: bidder.id,
            bundle: bundle
          }
        })
      })
    }
  }
}
