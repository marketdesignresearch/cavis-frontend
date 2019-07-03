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
  SINGLE_ITEM_FIRST_PRICE = 'SINGLE_ITEM_FIRST_PRICE',
  SINGLE_ITEM_SECOND_PRICE = 'SINGLE_ITEM_SECOND_PRICE',
  SEQUENTIAL_FIRST_PRICE = 'SEQUENTIAL_FIRST_PRICE',
  SEQUENTIAL_SECOND_PRICE = 'SEQUENTIAL_SECOND_PRICE',
  SIMULTANEOUS_FIRST_PRICE = 'SIMULTANEOUS_FIRST_PRICE',
  SIMULTANEOUS_SECOND_PRICE = 'SIMULTANEOUS_SECOND_PRICE',
  VCG_XOR = 'VCG_XOR',
  VCG_OR = 'VCG_OR',
  CCA_VCG = 'CCA_VCG',
  CCA_CCG = 'CCA_CCG',
  PVM_VCG = 'PVM_VCG',
  PVM_CCG = 'PVM_CCG'
}

export enum ApiMechanismType {
  FIRST_PRICE = 'FIRST_PRICE',
  SECOND_PRICE = 'SECOND_PRICE',
  VCG_XOR = 'VCG_XOR',
  VCG_OR = 'VCG_OR',
  CCG = 'CCG'
}

export enum ApiDomainType {
  UNIT_DEMAND_VALUE = 'unitDemandValue'
}

export enum ApiBidderStrategy {
  TRUTHFUL = 'TRUTHFUL'
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
    mechanismType: ApiMechanismType
    domain: {
      bidders: ApiBidder[]
      goods: ApiGood[]
    }
    latestBids?: {
      bids: {
        bundleBids: ApiBid[]
      }
    }
    restrictedBids: any
    currentPrices: {
      [x: string]: number
    }
    allowedNumberOfBids: number
    rounds: ApiRound[]
  }
  auctionType: ApiAuctionType
  result?: ApiAuctionAllocation
}

export interface ApiRound {
  roundNumber: number
  bids: ApiBid[]
}

export interface ApiBidder {
  id?: string
  name: string
  bids: ApiBid[]
  defaultStrategy: ApiBidderStrategy
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

export interface ApiAuctionAllocation {
  allocation: {
    [x: string]: {
      value: number
      goods: {
        [x: string]: string
      }
    }
  }
  payment: {
    totalPayments: number
    [x: string]: number
  }
}

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

const auctionResultById = moduleBuilder.read(
  state => (auctionId: string) =>
    state.auctions[auctionId] ? (state.auctions[auctionId].result ? state.auctions[auctionId].result : null) : null,
  'auctionResultById'
)

const priceForGood = moduleBuilder.read(
  state => (auctionId: string, goodId: string) =>
    state.auctions[auctionId]
      ? state.auctions[auctionId].auction.currentPrices
        ? state.auctions[auctionId].auction.currentPrices[goodId]
        : null
      : null,
  'priceForGood'
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

function removeBid(state: AuctionState, payload: { auctionId: string; bidderId: string; bundle: ApiGood[] }) {
  const existingBidder: ApiBidder | undefined = state.auctions[payload.auctionId].auction.domain.bidders.find(
    obj => obj.id === payload.bidderId
  )

  if (existingBidder && existingBidder.bids) {
    const bidIndex = existingBidder.bids.findIndex(bid => {
      return (
        Object.keys(bid.bundle)
          .sort()
          .join('') ===
        payload.bundle
          .map(v => v.id)
          .sort()
          .join('')
      )
    })

    if (bidIndex !== -1) {
      existingBidder.bids.splice(bidIndex, 1)
    }
  }
}

function addResult(state: AuctionState, payload: { auctionId: string; result: ApiAuctionAllocation }) {
  Vue.set(state.auctions[payload.auctionId], 'result', { ...payload.result })
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
  return data
}

async function getAuctions(context: BareActionContext<AuctionState, RootState>) {
  const { data } = await api().get('/auctions/')
  data.forEach((auctionInstance: any) => auction.commitAppendAuction({ auction: auctionInstance }))
  return data
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

  // place bids and close round
  await api().post(`/auctions/${payload.auctionId}/bids`, bids)
  const { data: auctionData } = await api().post(`/auctions/${payload.auctionId}/close-round`, bids)

  // update auctions after placing bids
  auction.commitAppendAuction({ auction: auctionData })

  // remove bids from bidders
  bidders.forEach(bidder => {
    bids[bidder.id!] = []
  })

  return auctionData
}

async function getResult(context: BareActionContext<AuctionState, RootState>, payload: { auctionId: string }) {
  const { data } = await api().get(`/auctions/${payload.auctionId}/result`)
  auction.commitResult({ auctionId: payload.auctionId, result: data })
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

  get auctionResultById() {
    return auctionResultById
  },

  get bidsByBidderId() {
    return bidsByBidderId
  },

  get goodsById() {
    return goodsById
  },

  get priceForGood() {
    return priceForGood
  },

  // mutations
  commitAppendAuction: moduleBuilder.commit(appendAuctionMutation),
  commitUpdateBidder: moduleBuilder.commit(updateBid),
  commitRemoveBid: moduleBuilder.commit(removeBid),
  commitResult: moduleBuilder.commit(addResult),
  commitToggleGoodSelection: moduleBuilder.commit(toggleGoodSelection),

  // actions
  dispatchGetAuction: moduleBuilder.dispatch(getAuction),
  dispatchGetAuctions: moduleBuilder.dispatch(getAuctions),
  dispatchCreateAuction: moduleBuilder.dispatch(createAuction),
  dispatchPlaceBids: moduleBuilder.dispatch(placeBids),
  dispatchGetAuctionResult: moduleBuilder.dispatch(getResult),
  dispatchResetAuctionToRound: moduleBuilder.dispatch(resetAuctionToRound)
}

export default auction
