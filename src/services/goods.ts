import auction, { ApiBid, ApiMechanismType, ApiBundleEntryWrapper, ApiBundleEntry } from '@/store/modules/auction'
import hashBundle from './bundleHash'

const powerSet = function(l: string[]): string[][] {
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
  bundleForBidder(bidderId: string): ApiBundleEntryWrapper[] {
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
  goodCombinations(auctionId: string): ApiBundleEntryWrapper[] {
    if (!auctionId) return []

    const goods = auction
      .goodsById()(auctionId)
      .slice(0, 5) // limit the combinations
    const currentAuction = auction.auctionById()(auctionId)

    // check if we have bundle-bids
    if (currentAuction.auction.mechanismType === ApiMechanismType.VCG_XOR) {
      return powerSet(goods).map(entries => {
        const bundleEntry: ApiBundleEntry[] = entries.map(good => {
          return {
            good: good,
            amount: 1
          }
        })

        return {
          hash: hashBundle(bundleEntry),
          entries: bundleEntry
        }
      })
    }

    // TODO: Hard-coded quantity of 1
    const entries: ApiBundleEntry[][] = goods.map(good => [{ good: good, amount: 1 }])

    return entries.map(entryWrapper => {
      return {
        hash: hashBundle(entryWrapper),
        entries: entryWrapper
      }
    })
  },
  valueForGood(bundle: ApiBundleEntryWrapper, bidderId: string): number | null {
    const bidder = auction.bidderById()(bidderId)

    if (bidder.value && bidder.value.bundleValues) {
      const correctValue = bidder.value.bundleValues.filter(value => value.bundle).find(value => value.bundle.hash === bundle.hash)
      return correctValue ? correctValue.value : null
    }
    return null
  },
  priceForGood(auctionId: string, bundle: ApiBundleEntryWrapper, bidderId: string): number | null {
    const bidder = auction.bidderById()(bidderId)

    if (bidder.value && bidder.value.bundleValues) {
      return bundle.entries
        .map(id => auction.priceForGood()(auctionId, id.good))
        .reduce((previous, current) => {
          return previous! + current!
        }, 0)
    }
    return null
  },
  bidForGood(goodIds: ApiBundleEntryWrapper, bidderId: string): number | null {
    const bidder = auction.bidderById()(bidderId)

    if (bidder.bids) {
      const correctBid = bidder.bids.find((bid: ApiBid) => {
        return bid.bundle.hash === goodIds.hash
      })
      return correctBid ? correctBid.amount : null
    }
    return null
  },
  isAllowed(bundle: ApiBundleEntryWrapper, bidderId: string | null, auctionId: string): boolean {
    if (!bidderId) {
      return false
    }

    const currentAuction = auction.auctionById()(auctionId)
    if (currentAuction.auction.restrictedBids && currentAuction.auction.restrictedBids[bidderId]) {
      const restrictedBundles: string[] = currentAuction.auction.restrictedBids[bidderId].map((entry: ApiBundleEntryWrapper) => entry.hash)
      return restrictedBundles.find(id => id === bundle.hash) !== undefined
    } else if (Object.keys(currentAuction.auction.restrictedBids).length === 0) {
      return true
    }

    return false
  }
}
