import auction, { ApiBidder, ApiBid } from '@/store/modules/auction'

export default {
  removeBid(bidderId: string, bundle: string[]) {
    auction.commitRemoveBid({
      bidderId: bidderId,
      bundle: bundle
    })
  },
  bidForBundle(bidderId: string, bundle: string[], auctionId: string) {
    const auctionInstance = auction.auctionById()(auctionId)
    const bidder = auction.bidderById()(bidderId)

    // if CCA, go with price for bid
    if (auctionInstance.auctionType.indexOf('CCA') !== -1 && bundle.length > 0) {
      return bundle
        .map(goodId => auctionInstance.auction.currentPrices[goodId])
        .reduce((previous, current) => {
          return previous + current
        })
    }

    if (bidder.value && bidder.value.bundleValues) {
      const correctValue = bidder.value.bundleValues.find(
        (bid: ApiBid) =>
          bid.bundle
            .map((obj: any) => obj.good)
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
  autoBid(auctionId: string, bidderId: string) {
    const auctionInstance = auction.auctionById()(auctionId)
    const bidder = auction.bidderById()(bidderId)

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
