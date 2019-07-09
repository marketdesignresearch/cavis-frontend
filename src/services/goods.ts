import auction, { ApiBidder, ApiGood, ApiBid, ApiAuctionType, ApiMechanismType } from '@/store/modules/auction'

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
  goodCombinations(auctionId: string): string[][] {
    if (!auctionId) return []

    const goods = auction
      .goodsById()(auctionId)
      .slice(0, 5) // limit the combinations
    const currentAuction = auction.auctionById()(auctionId)

    // check if we have bundle-bids
    if (currentAuction.auction.mechanismType === ApiMechanismType.VCG_XOR) {
      return powerSet(goods).filter((goods: []) => goods.length > 0)
    }

    return goods.map(good => [good])
  },
  valueForGood(goodIds: string[], bidderId: string): number | null {
    const bidder = auction.bidderById()(bidderId)

    if (bidder.value && bidder.value.bundleValues) {
      const ids = goodIds.sort().join('')
      const correctValue = bidder.value.bundleValues.find(
        (bid: ApiBid) =>
          bid.bundle
            .map(val => val.good)
            .sort()
            .join('') === ids
      )
      return correctValue ? correctValue.amount : null
    }
    return null
  },
  priceForGood(auctionId: string, goodIds: string[], bidderId: string): number | null {
    const bidder = auction.bidderById()(bidderId)

    if (bidder.value && bidder.value.bundleValues) {
      return goodIds
        .map(id => auction.priceForGood()(auctionId, id))
        .reduce((previous, current) => {
          return previous! + current!
        })
    }
    return null
  },
  bidForGood(goodIds: string[], bidderId: string): number | null {
    const bidder = auction.bidderById()(bidderId)

    if (bidder.bids) {
      const ids = goodIds.sort().join('')
      const correctBid = bidder.bids.find((bid: ApiBid) => {
        return (
          Object.keys(bid.bundle as any)
            .sort()
            .join('') === ids
        )
      })
      return correctBid ? correctBid.amount : null
    }
    return null
  },
  isAllowed(bidderId: string | null, auctionId: string): boolean {
    if (!bidderId) {
      return false
    }

    const currentAuction = auction.auctionById()(auctionId)
    if (currentAuction.auction.restrictedBids && currentAuction.auction.restrictedBids[bidderId]) {
      const goodIds: string[] = currentAuction.auction.restrictedBids[bidderId].map((obj: any) => {
        return obj.map((obj: any) => obj.good).join()
      })

      return goodIds.find(id => id === goodIds.join()) !== undefined
    } else if (Object.keys(currentAuction.auction.restrictedBids).length === 0) {
      return true
    }

    return false
  }
}
