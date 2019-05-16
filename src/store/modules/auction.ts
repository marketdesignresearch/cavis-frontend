import api from '@/services/api'
import { getStoreBuilder, BareActionContext } from 'vuex-typex'
import { RootState } from '..'

export interface AuctionState {
  auctions: {
    [key: string]: ApiAuction
  }
}

export enum ApiAuctionType {
  SINGLE_ITEM_SECOND_PRICE
}

export interface ApiAuction {
  id?: string
  bidders: ApiBidder[]
  goods: ApiGood[]
  type: ApiAuctionType
}

export interface ApiBidder {
  id: string
  bids: ApiBid[]
}

export interface ApiGood {
  id: string
  availability: number
  dummyGood: boolean
}

export interface ApiBid {
  amount: number
  bundle: {
    [x: string]: number
  }
}

const moduleBuilder = getStoreBuilder<RootState>().module<AuctionState>('auction', { auctions: {} })

// getters
const auctionById = moduleBuilder.read(state => (auctionId: string) => state.auctions[auctionId], 'getAuctionById')
const hasBidBeenPlaced = moduleBuilder.read(
  state => (auctionId: string, bidderId: string) => {
    if (!state.auctions[auctionId]) {
      return false
    }

    const bidder = state.auctions[auctionId].bidders.find(obj => obj.id === bidderId)
    if (bidder) {
      return bidder.bids.length > 0
    }
    return false
  },
  'hasBidBeenPlaced'
)

// mutations
function appendAuctionMutation(state: AuctionState, payload: { auction: ApiAuction }) {
  if (payload.auction.id) {
    state.auctions[payload.auction.id] = payload.auction
  }
}

function updateBid(state: AuctionState, payload: { auctionId: string; bidderId: string; bid: ApiBid }) {
  const existingBidder: ApiBidder | undefined = state.auctions[payload.auctionId].bidders.find(obj => obj.id === payload.bidderId)

  if (existingBidder) {
    existingBidder.bids = [payload.bid]
  }
}

// actions
async function createAuction(context: BareActionContext<AuctionState, RootState>, payload: { bidders: ApiBidder[]; goods: ApiGood[] }) {
  const createdAuction: ApiAuction = { bidders: payload.bidders, goods: payload.goods, type: ApiAuctionType.SINGLE_ITEM_SECOND_PRICE }
  const { data } = await api().post('/auctions/', auction)
  createdAuction.id = data
  auction.commitAppendAuction({ auction: createdAuction })
}

async function placeBids(
  context: BareActionContext<AuctionState, RootState>,
  payload: { bidderId: string; auctionId: string; bid: number }
) {
  const bidders = context.state.auctions[payload.auctionId].bidders
  const bids: any = {}

  bidders.forEach(bidder => {
    bids[bidder.id] = bidder.bids
  })

  const { data } = await api().put(`/auctions/${payload.auctionId}/bids`, bids)
}

const stateGetter = moduleBuilder.state()

const auction = {
  // state
  get state() {
    return stateGetter
  },

  // getters
  get auctionById() {
    return auctionById
  },

  get hasBidBeenPlaced() {
    return hasBidBeenPlaced
  },

  // mutations
  commitAppendAuction: moduleBuilder.commit(appendAuctionMutation),
  commitUpdateBidder: moduleBuilder.commit(updateBid),

  // actions
  dispatchCreateAuction: moduleBuilder.dispatch(createAuction),
  dispatchPlaceBid: moduleBuilder.dispatch(placeBids)
}

export default auction
