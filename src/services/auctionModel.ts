import { ApiAuction } from '@/store/modules/auction'

const configToModelJSON = function(auction: ApiAuction): string {
  return JSON.stringify({
    auctionType: auction.auctionType,
    name: auction.name,
    tags: auction.tags,
    numberOfGoods: auction.auction.domain.goods.length,
    numberOfBidders: auction.auction.domain.bidders.length,
    seed: auction.seed,
    maxBids: auction.auctionConfig.maxBids,
    manualBids: auction.auctionConfig.manualBids,
    ccaConfig: auction.auctionConfig.ccaConfig,
    pvmConfig: auction.auctionConfig.pvmConfig
  })
}

export { configToModelJSON }
export default configToModelJSON
