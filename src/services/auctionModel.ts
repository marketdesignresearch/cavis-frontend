import { ApiAuction } from '@/store/modules/auction'

const configToModelJSON = function(auction: ApiAuction): string {
  return JSON.stringify({
    auctionType: auction.auctionType,
    name: auction.name,
    tags: auction.tags,
    numberOfGoods: auction.auction.domain.goods.length,
    numberOfBidders: auction.auction.domain.bidders.length,
    maxBids: auction.auction.allowedNumberOfBids,
    manualBids: auction.auction.manualBids,
    seed: auction.seed
  })
}

export { configToModelJSON }
export default configToModelJSON
