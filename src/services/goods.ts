import auction, { ApiBidder, ApiGood, ApiBid, ApiAuctionType, ApiMechanismType, BundleEntry, ApiBundleEntry } from '@/store/modules/auction'

const powerSet = function(l: any) {
  // TODO: ensure l is actually array-like, and return null if not
  return (function ps(list): any {
    if (list.length === 0) {
      return [[]]
    }
    const head = list.pop()
    const tailPS = ps(list)
    return tailPS.concat(
      tailPS.map((e: any) => {
        return [head].concat(e)
      })
    )
  })(l.slice())
}

export default {
  bundleForBidder(bidderId: string): ApiBundleEntry[][] {
    const bidder = auction.bidderById()(bidderId)

    if (bidder.value && bidder.value.bundleValues) {
      return bidder.value.bundleValues
        .filter(bid => bid.bundle)
        .map(bid => {
          return bid.bundle
        })
    }

    return []
  },
  goodCombinations(auctionId: string): ApiBundleEntry[][] {
    if (!auctionId) return []

    const goods = auction
      .goodsById()(auctionId)
      .slice(0, 5) // limit the combinations
    const currentAuction = auction.auctionById()(auctionId)

    // check if we have bundle-bids
    if (currentAuction.auction.mechanismType === ApiMechanismType.VCG_XOR) {
      return powerSet(goods).filter((goods: []) => goods.length > 0)
    }

    return goods.map(good => [{ good: good, amount: 1 }]) // TODO: Hard-coded availability of 1
  },
  valueForGood(bundle: ApiBundleEntry[], bidderId: string): number | null {
    const bidder = auction.bidderById()(bidderId)

    if (bidder.value && bidder.value.bundleValues) {
      const comparison = bundle
        .map(bundleEntry => bundleEntry.good + bundleEntry.amount)
        .sort()
        .join('')
      const correctValue = bidder.value.bundleValues
        .filter(value => value.bundle)
        .find(
          value =>
            value.bundle
              .map(bundleEntry => bundleEntry.good + bundleEntry.amount)
              .sort()
              .join('') === comparison
        )
      return correctValue ? correctValue.value : null
    }
    return null
  },
  priceForGood(auctionId: string, bundle: ApiBundleEntry[], bidderId: string): number | null {
    const bidder = auction.bidderById()(bidderId)

    if (bidder.value && bidder.value.bundleValues) {
      return bundle
        .map(id => auction.priceForGood()(auctionId, id.good))
        .reduce((previous, current) => {
          return previous! + current!
        }, 0)
    }
    return null
  },
  bidForGood(goodIds: ApiBundleEntry[], bidderId: string): number | null {
    const bidder = auction.bidderById()(bidderId)

    if (bidder.bids) {
      const comparison = goodIds
        .map(bundleEntry => bundleEntry.good + bundleEntry.amount)
        .sort()
        .join('')
      const correctBid = bidder.bids.find((bid: ApiBid) => {
        return (
          bid.bundle
            .map(bundleEntry => bundleEntry.good + bundleEntry.amount)
            .sort()
            .join('') === comparison
        )
      })
      return correctBid ? correctBid.amount : null
    }
    return null
  },
  isAllowed(bundle: ApiBundleEntry[], bidderId: string | null, auctionId: string): boolean {
    if (!bidderId) {
      return false
    }

    const currentAuction = auction.auctionById()(auctionId)
    if (currentAuction.auction.restrictedBids && currentAuction.auction.restrictedBids[bidderId]) {
      const restrictedBundles: string[] = currentAuction.auction.restrictedBids[bidderId].map((entry: ApiBundleEntry[]) =>
        entry
          .map(e => e.good + e.amount)
          .sort()
          .join('')
      )

      return (
        restrictedBundles.find(
          id =>
            id ===
            bundle
              .map(entry => entry.good + entry.amount)
              .sort()
              .join('')
        ) !== undefined
      )
    } else if (Object.keys(currentAuction.auction.restrictedBids).length === 0) {
      return true
    }

    return false
  }
}
