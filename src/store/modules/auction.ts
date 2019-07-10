import Vue from 'vue'
import api from '@/services/api'
import { getStoreBuilder, BareActionContext } from 'vuex-typex'
import { RootState } from '..'
import { normalize } from 'normalizr'
import { auctionSchema } from './schemas'

export interface AuctionState {
  bidders: {
    [key: string]: ApiBidder
  }
  goods: {
    [key: string]: ApiGood
  }
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
  id?: string
  auction: {
    mechanismType: ApiMechanismType
    currentRoundType?: string
    finished: boolean
    domain: {
      bidders: string[]
      goods: string[]
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
  mechanismResult: ApiAuctionAllocation
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
  id?: string
  name: string
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
      bundle: [
        {
          amount: string
          good: string
        }
      ]
    }
  }
  payments: {
    totalPayments: number
    [x: string]: number
  }
}

const moduleBuilder = getStoreBuilder<RootState>().module<AuctionState>('auction', { auctions: {}, bidders: {}, goods: {} })

// getters
const auctions = moduleBuilder.read(state => Object.values(state.auctions), 'auctions')
const auctionById = moduleBuilder.read(state => (auctionId: string) => state.auctions[auctionId], 'auctionById')
const bidderById = moduleBuilder.read(state => (bidderId: string) => state.bidders[bidderId], 'bidderById')
const goodById = moduleBuilder.read(state => (goodId: string) => state.goods[goodId], 'goodById')

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

const valueForBundle = moduleBuilder.read(
  state => (auctionId: string, bidderId: string, bundle: string[]) => {
    if (!state.auctions[auctionId]) {
      return null
    }

    const currentBidder = state.bidders[bidderId]

    if (!currentBidder || !currentBidder.value) {
      return null
    }

    const value = currentBidder.value.bundleValues
      .filter(bid => bid.bundle)
      .find(
        bid =>
          bid.bundle
            .map(val => val.good)
            .sort()
            .join('') === bundle.sort().join('')
      )

    return value
  },
  'valueForBundle'
)

// mutations
function appendAuctionMutation(state: AuctionState, payload: { auction: ApiAuction }) {
  const normalizedData = normalize(payload.auction, auctionSchema)

  if (normalizedData.entities.bidders) {
    Object.keys(normalizedData.entities.bidders).forEach(bidderId => {
      Vue.set(state.bidders, bidderId, normalizedData.entities.bidders[bidderId])
    })
  }

  if (normalizedData.entities.auctions) {
    Object.keys(normalizedData.entities.auctions).forEach(auctionId => {
      Vue.set(state.auctions, auctionId, normalizedData.entities.auctions[auctionId])
    })
  }

  if (normalizedData.entities.goods) {
    Object.keys(normalizedData.entities.goods).forEach(goodId => {
      Vue.set(state.goods, goodId, normalizedData.entities.goods[goodId])
    })
  }
}

function addBundleValue(state: AuctionState, payload: { bidderId: string; bundleValue: ApiBid }) {
  const bidder = state.bidders[payload.bidderId]

  if (bidder) {
    if (!bidder.value) {
      Vue.set(bidder, 'value', { bundleValues: [payload.bundleValue] })
    } else {
      bidder.value.bundleValues.push(payload.bundleValue)
    }
  }
}

function updateBid(state: AuctionState, payload: { bidderId: string; bid: ApiBid }) {
  const existingBidder = state.bidders[payload.bidderId]

  if (existingBidder && !existingBidder.bids) {
    Vue.set(existingBidder, 'bids', [payload.bid])
  } else if (existingBidder) {
    existingBidder.bids.push(payload.bid)
  }
}

function removeBid(state: AuctionState, payload: { bidderId: string; bundle: string[] }) {
  const existingBidder = state.bidders[payload.bidderId]

  if (existingBidder && existingBidder.bids) {
    const bidIndex = existingBidder.bids.findIndex(bid => {
      return (
        Object.keys(bid.bundle)
          .sort()
          .join('') === payload.bundle.sort().join('')
      )
    })

    if (bidIndex !== -1) {
      existingBidder.bids.splice(bidIndex, 1)
    }
  }
}

function removeAuctionMutation(state: AuctionState, payload: { auctionId: string }) {
  Vue.delete(state.auctions, payload.auctionId)
}

function addResult(state: AuctionState, payload: { auctionId: string; result: ApiAuctionAllocation }) {
  Vue.set(state.auctions[payload.auctionId], 'result', { ...payload.result })
}

// actions
async function getAuction(context: BareActionContext<AuctionState, RootState>, payload: { auctionId: string }): Promise<ApiAuction> {
  const { data } = await api().get(`/auctions/${payload.auctionId}`)
  auction.commitAppendAuction({ auction: data })
  return data
}

async function getAuctions(context: BareActionContext<AuctionState, RootState>): Promise<ApiAuction[]> {
  const { data } = await api().get('/auctions/')
  data.forEach((auctionInstance: any) => auction.commitAppendAuction({ auction: auctionInstance }))
  return data
}

async function createAuction(context: BareActionContext<AuctionState, RootState>, payload: { auctionCreateDTO: ApiAuctionCreateDTO }) {
  const { data } = await api().post('/auctions/', payload.auctionCreateDTO)
  auction.commitAppendAuction({ auction: data })
  return data
}

async function removeAuction(context: BareActionContext<AuctionState, RootState>, payload: { auctionId: string }) {
  const { data } = await api().delete(`/auctions/${payload.auctionId}`)
  auction.commitRemoveAuction({ auctionId: payload.auctionId })
}

async function placeBids(context: BareActionContext<AuctionState, RootState>, payload: { auctionId: string }): Promise<ApiAuction> {
  const bidderIds = context.state.auctions[payload.auctionId].auction.domain.bidders
  const bidders = bidderIds.map((id: string) => context.state.bidders[id])

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

  return auctionData as ApiAuction
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

async function advanceRound(context: BareActionContext<AuctionState, RootState>, payload: { auctionId: string }) {
  const { data } = await api().post(`/auctions/${payload.auctionId}/advance-round`)
  auction.commitAppendAuction({ auction: data })
}

async function advancePhase(context: BareActionContext<AuctionState, RootState>, payload: { auctionId: string }) {
  const { data } = await api().post(`/auctions/${payload.auctionId}/advance-phase`)
  auction.commitAppendAuction({ auction: data })
}

async function finish(context: BareActionContext<AuctionState, RootState>, payload: { auctionId: string }) {
  const { data } = await api().post(`/auctions/${payload.auctionId}/finish`)
  auction.commitAppendAuction({ auction: data })
}

async function propose(context: BareActionContext<AuctionState, RootState>, payload: { auctionId: string; bidderIds: string[] }) {
  const { data } = await api().post(`/auctions/${payload.auctionId}/propose`, payload.bidderIds)
  data.forEach((bid: ApiBid) => {
    auction.commitBundleValue({ bidderId: bid.bidderId!, bundleValue: bid })
  })
}

async function demandQuery(
  context: BareActionContext<AuctionState, RootState>,
  payload: { auctionId: string; bidders: ApiBidder[]; goodIds: string[] }
) {}

async function valueQuery(
  context: BareActionContext<AuctionState, RootState>,
  payload: { auctionId: string; bidderIds: string[]; goodIds: string[] }
) {
  const bundle: { [x: string]: number } = {}

  payload.goodIds.forEach(id => {
    bundle[id] = 1
  })

  const valueQuery = {
    bidders: payload.bidderIds,
    bundles: [bundle]
  }

  const { data: valueQueryResult } = await api().post(`/auctions/${payload.auctionId}/valuequery`, valueQuery)

  Object.keys(valueQueryResult).forEach(bidderId => {
    valueQueryResult[bidderId].forEach((bid: any) => {
      const apiBid: ApiBid = {
        amount: bid.value,
        bundle: bid.bundle,
        bidderId: bidderId
      }
      auction.commitBundleValue({ bidderId: bidderId, bundleValue: apiBid })
    })
  })
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

  get bidderById() {
    return bidderById
  },

  get goodById() {
    return goodById
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

  get valueForBundle() {
    return valueForBundle
  },

  // mutations
  commitAppendAuction: moduleBuilder.commit(appendAuctionMutation),
  commitUpdateBidder: moduleBuilder.commit(updateBid),
  commitRemoveBid: moduleBuilder.commit(removeBid),
  commitResult: moduleBuilder.commit(addResult),
  commitBundleValue: moduleBuilder.commit(addBundleValue),
  commitRemoveAuction: moduleBuilder.commit(removeAuctionMutation),

  // actions
  dispatchGetAuction: moduleBuilder.dispatch(getAuction),
  dispatchGetAuctions: moduleBuilder.dispatch(getAuctions),
  dispatchCreateAuction: moduleBuilder.dispatch(createAuction),
  dispatchRemoveAuction: moduleBuilder.dispatch(removeAuction),
  dispatchPlaceBids: moduleBuilder.dispatch(placeBids),
  dispatchGetAuctionResult: moduleBuilder.dispatch(getResult),
  dispatchResetAuctionToRound: moduleBuilder.dispatch(resetAuctionToRound),
  dispatchValueQuery: moduleBuilder.dispatch(valueQuery),
  dispatchDemandQuery: moduleBuilder.dispatch(demandQuery),
  dispatchAdvanceRound: moduleBuilder.dispatch(advanceRound),
  dispatchAdvancePhase: moduleBuilder.dispatch(advancePhase),
  dispatchFinish: moduleBuilder.dispatch(finish),
  dispatchPropose: moduleBuilder.dispatch(propose)
}

export default auction
