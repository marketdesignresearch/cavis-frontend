import auction, { ApiBidder, ApiGood, ApiBid, ApiAuctionType } from '@/store/modules/auction'

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
  goodCombinations(auctionId: string): ApiGood[][] {
    if (!auctionId) return []

    const goods = auction.goodsById()(auctionId)
    const currentAuction = auction.auctionById()(auctionId)

    // check if we have bundle-bids
    if (currentAuction.auction.mechanismType === ApiAuctionType.VCG_XOR) {
      return powerSet(goods).filter((goods: []) => goods.length > 0)
    }

    return goods.map(good => [good])
  },
  valueForGood(bidder: ApiBidder, goods: ApiGood[]): number | null {
    if (bidder.value && bidder.value.bundleValues) {
      const ids = goods
        .map(obj => obj.id)
        .sort()
        .join('')
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
  priceForGood(bidder: ApiBidder, auctionId: string, goods: ApiGood[]): number | null {
    if (bidder.value && bidder.value.bundleValues) {
      return goods
        .map(obj => auction.priceForGood()(auctionId, obj.id))
        .reduce((previous, current) => {
          return previous! + current!
        })
    }
    return null
  },
  bidForGood(bidder: ApiBidder, goods: ApiGood[]): number | null {
    if (bidder.bids) {
      const ids = goods
        .map(obj => obj.id)
        .sort()
        .join('')
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
  isAllowed(bidder: ApiBidder, auctionId: string, goods: ApiGood[] | string[]): boolean {
    if (!bidder) {
      return false
    }

    let convertedGoods: string[]

    if (goods.length > 0 && typeof goods[0] === 'object') {
      convertedGoods = (goods as ApiGood[]).map(obj => obj.id)
    } else {
      convertedGoods = goods as string[]
    }

    const currentAuction = auction.auctionById()(auctionId)
    if (currentAuction.auction.restrictedBids && currentAuction.auction.restrictedBids[bidder.id!]) {
      const goodIds: string[] = currentAuction.auction.restrictedBids[bidder.id!].map((obj: any) => {
        return obj.map((obj: any) => obj.good).join()
      })

      return goodIds.find(id => id === convertedGoods.join()) !== undefined
    }

    return false
  }
}
