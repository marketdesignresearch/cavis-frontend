import auction, { ApiBidder, ApiGood, ApiBid } from '@/store/modules/auction'

export default {
  removeBid(auctionId: string, bidder: ApiBidder, bundle: ApiGood[]) {
    auction.commitRemoveBid({
      auctionId: auctionId,
      bidderId: bidder.id!,
      bundle: bundle
    })
  },
  autoBidAll(auctionId: string) {
    const auctionInstance = auction.auctionById()(auctionId)
    auctionInstance.auction.domain.bidders.forEach(bidder => {
      this.autoBid(auctionId, bidder)
    })
  },
  bidForBundle(bidder: ApiBidder, bundle: ApiGood[]) {
    if (bidder.value && bidder.value.bundleValues) {
      const correctValue = bidder.value.bundleValues.find(
        (bid: ApiBid) =>
          bid.bundle
            .map(val => val.good)
            .sort()
            .join('') ===
          Array.from(bundle) // copy array before sorting, to not trigger change-detection
            .sort()
            .join('')
      )
      return correctValue ? correctValue.amount : null
    }
    return 0
  },
  autoBid(auctionId: string, bidder: ApiBidder) {
    const auctionInstance = auction.auctionById()(auctionId)
    if (bidder.value && bidder.id) {
      bidder.value.bundleValues
        // sort by "value"
        .sort((bidA, bidB) => {
          return bidB.amount - bidA.amount
        })
        // skip empty bundles
        .filter(bid => bid.bundle.length > 0)
        .forEach((value, index) => {
          // prevent too many bids
          if (auctionInstance.auction.allowedNumberOfBids && index >= auctionInstance.auction.allowedNumberOfBids) {
            return
          }

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
