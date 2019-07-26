import auction, { ApiBundleValue, ApiBundleEntryWrapper, ApiBidderStrategy } from '@/store/modules/auction'
import hashBundle from './bundleHash'

export default {
  removeBid(bidderId: string, bundle: ApiBundleEntryWrapper) {
    auction.commitRemoveBid({
      bidderId: bidderId,
      bundle: bundle
    })
    auction.commitChangeBidderStrategy({ bidderId: bidderId, strategy: ApiBidderStrategy.CUSTOM })
  },
  bidForBundle(bidderId: string, bundle: ApiBundleEntryWrapper, auctionId: string) {
    const auctionInstance = auction.auctionById()(auctionId)
    const bidder = auction.bidderById()(bidderId)

    // if CCA, go with price for bid
    if (auctionInstance.auctionType.indexOf('CCA') !== -1 && bundle.entries.length > 0) {
      return bundle.entries
        .map(entry => auctionInstance.auction.currentPrices[entry.good] * entry.amount)
        .reduce((previous, current) => {
          return previous + current
        })
    }

    if (bidder.value && bidder.value.bundleValues) {
      const correctValue = bidder.value.bundleValues.find((bid: ApiBundleValue) => {
        return bid.bundle.hash === hashBundle(bundle.entries)
      })
      return correctValue ? correctValue.value : null
    }
    return 0
  }
}
