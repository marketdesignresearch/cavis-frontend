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
  SINGLE_ITEM_SECOND_PRICE = 'SECOND_PRICE',
  SINGLE_ITEM_FIRST_PRICE = 'FIRST_PRICE',
  VCG_XOR = 'VCG_XOR'
}

export enum ApiDomainType {
  UNIT_DEMAND_VALUE = 'unitDemandValue'
}

export interface ApiAuctionCreateDTO {
  domain: {
    type: ApiDomainType
    bidders: ApiBidder[]
    goods: ApiGood[]
  }
  auctionType: ApiAuctionType
}

export interface ApiAuction {
  uuid?: string
  auction: {
    mechanismType: ApiAuctionType
    domain: {
      bidders: ApiBidder[]
      goods: ApiGood[]
    }
    latestBids?: {
      bids: {
        bundleBids: ApiBid[]
      }
    }
    rounds: ApiRound[]
  }
  allocation?: ApiAuctionAllocation
}

export interface ApiRound {
  roundNumber: number
  bids: ApiBid[]
}

export interface ApiBidder {
  id?: string
  name: string
  bids: ApiBid[]
  value?: {
    bundleValues: ApiBid[]
  }
}

export interface ApiGood {
  id: string
  availability: number
  dummyGood: boolean
  isSelected: boolean
}

export interface ApiBid {
  id?: string
  amount: number
  bidderId?: string
  bundle: {
    good: string
    amount: number
  }[]
}

export interface ApiAuctionAllocation {}

const moduleBuilder = getStoreBuilder<RootState>().module<AuctionState>('auction', { auctions: {} })

// getters
const auctions = moduleBuilder.read(state => Object.values(state.auctions), 'auctions')
const auctionById = moduleBuilder.read(state => (auctionId: string) => state.auctions[auctionId], 'auctionById')
const biddersById = moduleBuilder.read(
  state => (auctionId: string) => (state.auctions[auctionId] ? state.auctions[auctionId].auction.domain.bidders : []),
  'biddersById'
)
const goodsById = moduleBuilder.read(
  state => (auctionId: string) => (state.auctions[auctionId] ? state.auctions[auctionId].auction.domain.goods : []),
  'goodsById'
)

const bidsByBidderId = moduleBuilder.read(
  state => (auctionId: string, bidderId: string, round: number) => {
    return state.auctions[auctionId] && state.auctions[auctionId].auction.rounds.length > round
      ? state.auctions[auctionId].auction.rounds[round].bids.filter(bid => bid.bidderId === bidderId)
      : []
  },
  'bidsByBidderId'
)

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

  if (existingBidder && !existingBidder.bids) {
    Vue.set(existingBidder, 'bids', [payload.bid])
  } else if (existingBidder) {
    existingBidder.bids.push(payload.bid)
  }
}

function addAllocation(state: AuctionState, payload: { auctionId: string; allocation: ApiAuctionAllocation }) {
  Vue.set(state.auctions[payload.auctionId], 'allocation', { ...payload.allocation })
}

function toggleGoodSelection(state: AuctionState, payload: { auctionId: string; goodId: string }) {
  const good = state.auctions[payload.auctionId].auction.domain.goods.find(obj => obj.id === payload.goodId)
  if (good) {
    good.isSelected = !good.isSelected
  }
}

// actions
async function getAuction(context: BareActionContext<AuctionState, RootState>, payload: { auctionId: string }) {
  const { data } = await api().get(`/auctions/${payload.auctionId}`)
  auction.commitAppendAuction({ auction: data })
}

async function getAuctions(context: BareActionContext<AuctionState, RootState>) {
  const { data } = await api().get('/auctions/')
  data.forEach((auctionInstance: any) => auction.commitAppendAuction({ auction: auctionInstance }))
}

async function createAuction(context: BareActionContext<AuctionState, RootState>, payload: { auctionCreateDTO: ApiAuctionCreateDTO }) {
  const { data } = await api().post('/auctions/', payload.auctionCreateDTO)
  auction.commitAppendAuction({ auction: data })
  return data
}

async function placeBids(context: BareActionContext<AuctionState, RootState>, payload: { auctionId: string }) {
  const bidders = context.state.auctions[payload.auctionId].auction.domain.bidders
  const bids: { [index: string]: any } = {}

  bidders.forEach(bidder => {
    bids[bidder.id!] = bidder.bids
  })

  const { data } = await api().post(`/auctions/${payload.auctionId}/bids`, bids)

  // update auctions after placing bids
  auction.dispatchGetAuction({ auctionId: payload.auctionId })

  return data
}

async function allocateAuction(context: BareActionContext<AuctionState, RootState>, payload: { auctionId: string }) {
  const { data } = await api().get(`/auctions/${payload.auctionId}/result`)
  auction.commitAddAllocation({ auctionId: payload.auctionId, allocation: data })
  return data
}

async function resetAuctionToRound(context: BareActionContext<AuctionState, RootState>, payload: { auctionId: string; round: number }) {
  const { data } = await api().put(`/auctions/${payload.auctionId}/reset`, { round: payload.round })
  auction.commitAppendAuction({ auction: data })
}

const stateGetter = moduleBuilder.state()

const auction = {
  // state
  get state() {
    return stateGetter
  },

  // getters
  get auctions() {
    return auctions
  },

  get auctionById() {
    return auctionById
  },

  get biddersById() {
    return biddersById
  },

  get bidsByBidderId() {
    return bidsByBidderId
  },

  get goodsById() {
    return goodsById
  },

  // mutations
  commitAppendAuction: moduleBuilder.commit(appendAuctionMutation),
  commitUpdateBidder: moduleBuilder.commit(updateBid),
  commitAddAllocation: moduleBuilder.commit(addAllocation),
  commitToggleGoodSelection: moduleBuilder.commit(toggleGoodSelection),

  // actions
  dispatchGetAuction: moduleBuilder.dispatch(getAuction),
  dispatchGetAuctions: moduleBuilder.dispatch(getAuctions),
  dispatchCreateAuction: moduleBuilder.dispatch(createAuction),
  dispatchPlaceBids: moduleBuilder.dispatch(placeBids),
  dispatchAllocateAuction: moduleBuilder.dispatch(allocateAuction),
  dispatchResetAuctionToRound: moduleBuilder.dispatch(resetAuctionToRound)
}

export default auction
