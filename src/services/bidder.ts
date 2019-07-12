import auction, { ApiBidder, ApiBid, ApiBundleValue, ApiBundleEntry } from '@/store/modules/auction'

export default {
  removeBid(bidderId: string, bundle: ApiBundleEntry[]) {
    auction.commitRemoveBid({
      bidderId: bidderId,
      bundle: bundle
    })
  },
  bidForBundle(bidderId: string, bundle: ApiBundleEntry[], auctionId: string) {
    const auctionInstance = auction.auctionById()(auctionId)
    const bidder = auction.bidderById()(bidderId)

    // if CCA, go with price for bid
    if (auctionInstance.auctionType.indexOf('CCA') !== -1 && bundle.length > 0) {
      return bundle
        .map(entry => auctionInstance.auction.currentPrices[entry.good] * entry.amount)
        .reduce((previous, current) => {
          return previous + current
        })
    }

    if (bidder.value && bidder.value.bundleValues) {
      const correctValue = bidder.value.bundleValues.find(
        (bid: ApiBundleValue) =>
          bid.bundle
            .map((obj: ApiBundleEntry) => obj.good + obj.amount)
            .sort()
            .join('') ===
          Array.from(bundle) // copy array before sorting, to not trigger change-detection
            .map(entry => entry.good + entry.amount)
            .sort()
            .join('')
      )
      return correctValue ? correctValue.value : null
    }
    return 0
  }
}
