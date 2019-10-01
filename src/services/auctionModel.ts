import { ApiAuction } from '@/store/modules/auction'

const configToModelJSON = function(auction: ApiAuction): string {
  const strippedDomainConfig: any = Object.assign({}, auction.domainConfig)

  // remove bidders / goods
  delete strippedDomainConfig.bidders
  delete strippedDomainConfig.goods

  // add bidder min/max
  if (auction.domainConfig.bidders) {
    strippedDomainConfig.minBidder = auction.domainConfig.bidders[0].min
    strippedDomainConfig.maxBidder = auction.domainConfig.bidders[0].max
  }

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
    pvmConfig: auction.auctionConfig.pvmConfig,
    domainConfig: strippedDomainConfig
  })
}

export { configToModelJSON }
export default configToModelJSON
