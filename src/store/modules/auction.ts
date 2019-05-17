import Vue from 'vue'
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

export interface ApiAuctionCreateDTO {
  setting: {
    type: string
    bidders: ApiBidder[]
    goods: ApiGood[]
  }
  type: ApiAuctionType
}

export interface ApiAuction {
  uuid?: string
  auction: {
    domain: {
      bidders: ApiBidder[]
      goods: ApiGood[]
    }
  }
  type: ApiAuctionType
  allocation?: ApiAuctionAllocation
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

export interface ApiAuctionAllocation {}

const moduleBuilder = getStoreBuilder<RootState>().module<AuctionState>('auction', { auctions: {} })

// getters
const auctionById = moduleBuilder.read(state => (auctionId: string) => state.auctions[auctionId], 'getAuctionById')
const biddersById = moduleBuilder.read(state => (auctionId: string) => state.auctions[auctionId].auction.domain.bidders, 'biddersById')
const goodsById = moduleBuilder.read(state => (auctionId: string) => state.auctions[auctionId].auction.domain.goods, 'goodsById')

// mutations
function appendAuctionMutation(state: AuctionState, payload: { auction: ApiAuction }) {
  if (payload.auction.uuid) {
    Vue.set(state.auctions, payload.auction.uuid, { ...payload.auction })
  }
}

function updateBid(state: AuctionState, payload: { auctionId: string; bidderId: string; bid: ApiBid }) {
  const existingBidder: ApiBidder | undefined = state.auctions[payload.auctionId].auction.domain.bidders.find(
    obj => obj.id === payload.bidderId
  )

  if (existingBidder) {
    Vue.set(existingBidder, 'bids', [payload.bid])
  }
}

function addAllocation(state: AuctionState, payload: { auctionId: string; allocation: ApiAuctionAllocation }) {
  Vue.set(state.auctions[payload.auctionId], 'allocation', { ...payload.allocation })
}

// actions
async function createAuction(context: BareActionContext<AuctionState, RootState>, payload: { auctionCreateDTO: ApiAuctionCreateDTO }) {
  const { data } = await api().post('/auctions/', payload.auctionCreateDTO)
  auction.commitAppendAuction({ auction: data })
  return data
}

async function placeBids(context: BareActionContext<AuctionState, RootState>, payload: { auctionId: string }) {
  const bidders = context.state.auctions[payload.auctionId].auction.domain.bidders
  const bids: any = {}

  bidders.forEach(bidder => {
    bids[bidder.id] = bidder.bids
  })

  const { data } = await api().post(`/auctions/${payload.auctionId}/bids`, bids)
  return data
}

async function allocateAuction(context: BareActionContext<AuctionState, RootState>, payload: { auctionId: string }) {
  const { data } = await api().get(`/auctions/${payload.auctionId}/result`)
  auction.commitAddAllocation({ auctionId: payload.auctionId, allocation: data })
  return data
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

  get biddersById() {
    return biddersById
  },

  get goodsById() {
    return goodsById
  },

  // mutations
  commitAppendAuction: moduleBuilder.commit(appendAuctionMutation),
  commitUpdateBidder: moduleBuilder.commit(updateBid),
  commitAddAllocation: moduleBuilder.commit(addAllocation),

  // actions
  dispatchCreateAuction: moduleBuilder.dispatch(createAuction),
  dispatchPlaceBids: moduleBuilder.dispatch(placeBids),
  dispatchAllocateAuction: moduleBuilder.dispatch(allocateAuction)
}

export default auction
