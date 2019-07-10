import auction, { ApiBidder, ApiBid, ApiBundleValue } from '@/store/modules/auction'

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
        (bid: ApiBundleValue) =>
          bid.bundle
            .map((obj: any) => obj.good)
            .sort()
            .join('') ===
          Array.from(bundle) // copy array before sorting, to not trigger change-detection
            .sort()
            .join('')
      )
      return correctValue ? correctValue.value : null
    }
    return 0
  }
}
