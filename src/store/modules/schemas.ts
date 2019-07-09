import { schema } from 'normalizr'

/**
 * auction:
 */

const goodSchema = new schema.Entity('goods')
const bidderSchema = new schema.Entity('bidders')

const auctionSchema = new schema.Entity('auctions', {
  auction: {
    domain: {
      bidders: [bidderSchema],
      goods: [goodSchema]
    }
  }
})

export { goodSchema, bidderSchema, auctionSchema }
