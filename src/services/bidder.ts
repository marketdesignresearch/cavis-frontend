import auction, { ApiBidder } from '@/store/modules/auction'

export default {
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
