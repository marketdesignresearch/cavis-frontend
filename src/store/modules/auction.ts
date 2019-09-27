import Vue from 'vue'
import api from '@/services/api'
import { getStoreBuilder, BareActionContext } from 'vuex-typex'
import { RootState } from '..'
import { normalize } from 'normalizr'
import { auctionSchema } from './schemas'
import selection from './selection'
import BigNumber from 'bignumber.js'

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
  VCG = 'VCG',
  CCA = 'CCA',
  PVM = 'PVM'
}

export enum ApiAuctionPaymentRule {
  VCG = 'VCG',
  CCG = 'CCG'
}

export enum ApiMechanismType {
  FIRST_PRICE = 'FIRST_PRICE',
  SECOND_PRICE = 'SECOND_PRICE',
  VCG_XOR = 'VCG_XOR',
  VCG_OR = 'VCG_OR',
  CCG = 'CCG'
}

export enum ApiDomainType {
  UNIT_DEMAND_VALUE = 'unitDemandValue',
  ADDITIVE_VALUE = 'additiveValue'
}

export enum ApiBidderStrategy {
  TRUTHFUL = 'TRUTHFUL',
  CUSTOM = 'CUSTOM'
}

export interface ApiBidderCreateDTO {
  name: string
  min: number
  max: number
  defaultStrategy: ApiBidderStrategy
}

export interface ApiAuctionCreateDTO {
  domain: {
    type: ApiDomainType
    bidders: ApiBidderCreateDTO[]
    goods: ApiGood[]
    synergy?: number
    numberOfNationalBidders?: number
    numberOfRegionalBidders?: number
    interestingCase?: boolean
    maxLocalValue?: number
  }
  auctionType: ApiAuctionType
  name: string
  seed: string
  tags: string[]
  private: boolean
  auctionConfig: ApiAuctionConfig
}

export interface ApiAuctionConfig {
  maxBids?: number
  manualBids?: number
  demandQueryTimeLimit?: number
  reservePrices?: Map<string, number>
  useProposedReservePrices?: boolean
  ccaConfig?: {
    supplementaryBids: number
    priceUpdate: number
    initialPriceUpdateIfPriceEqualsZero: number
    paymentRule: ApiAuctionPaymentRule
    maxRounds: number
  }
  pvmConfig?: {
    initialRoundBid: number
    paymentRule: ApiAuctionPaymentRule
    maxRounds: number
  }
}

export enum ApiAuctionOutcomeRule {
  VCG_XOR = 'VCG_XOR',
  CCG = 'CCG'
}

export interface ApiAuction {
  id?: string
  name: string
  tags: string[]
  auctionConfig: ApiAuctionConfig
  auction: {
    mechanismType: ApiMechanismType
    currentRoundType?: string
    finished: boolean
    domain: {
      efficientAllocationCalculated: boolean
      efficientAllocation: {
        [x: string]: ApiEfficientBundleValue
      }
      efficientSocialWelfare: number
      bidders: string[]
      goods: string[]
    }
    latestBids?: {
      bids: {
        bundleBids: ApiBid[]
      }
    }
    restrictedBids: {
      [x: string]: ApiBundleEntryWrapper[]
    }
    currentPrices: {
      [x: string]: number
    }
    allowedNumberOfBids: number
    manualBids: number
    rounds: ApiRound[]
    outcomeRule: ApiAuctionOutcomeRule
  }
  seed: number
  private: boolean
  auctionType: ApiAuctionType
  result?: ApiAuctionAllocation
}

export interface ApiRound {
  roundNumber: number
  bids: ApiBid[]
  prices?: {
    [x: string]: number
  }
  overDemand?: {
    [x: string]: number
  }
  outcome?: ApiAuctionAllocation
}

export interface ApiBidder {
  id?: string
  name: string
  bids: ApiBid[]
  defaultStrategy: ApiBidderStrategy
  strategy: ApiBidderStrategy
  value?: {
    bundleValues: ApiBundleValue[]
  }
}

export interface BundleEntry {
  good: ApiGood
  amount: number
}

export interface ApiGood {
  id?: string
  name: string
  quantity: number
  dummyGood: boolean
  isSelected: boolean
}

export interface ApiBundleValue {
  value: number
  bidderId?: string
  bundle: ApiBundleEntryWrapper
}

export interface ApiEfficientBundleValue extends ApiBundleValue {
  trueValue: number
}

export interface ApiBundleEntryWrapper {
  hash: string
  entries: ApiBundleEntry[]
}

export interface ApiBundleEntry {
  good: string
  amount: number
}

export interface ApiBid {
  id?: string
  amount: BigNumber
  value?: number
  bidderId?: string
  bundle: ApiBundleEntryWrapper
}

export interface ApiAuctionAllocation {
  socialWelfare: number
  revenue: number
  winnerUtilities: {
    [x: string]: number
  }
  allocation: {
    [x: string]: {
      value: number
      bundle: ApiBundleEntryWrapper
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
  state => (auctionId: string, bidderId: string, bundle: ApiBundleEntryWrapper) => {
    if (!state.auctions[auctionId]) {
      return null
    }

    const currentBidder = state.bidders[bidderId]

    if (!currentBidder || !currentBidder.value) {
      return null
    }

    const value = currentBidder.value.bundleValues.filter(value => value.bundle).find(value => value.bundle.hash === bundle.hash)

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
      Vue.set(state.bidders[bidderId], 'strategy', ApiBidderStrategy.TRUTHFUL)
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

function addBundleValue(state: AuctionState, payload: { bidderId: string; bundleValue: ApiBundleValue }) {
  const bidder = state.bidders[payload.bidderId]

  if (bidder) {
    if (!bidder.value) {
      Vue.set(bidder, 'value', { bundleValues: [payload.bundleValue] })
    } else {
      if (!bidder.value.bundleValues.find(value => value.bundle.hash === payload.bundleValue.bundle.hash)) {
        bidder.value.bundleValues.push(payload.bundleValue)
      }
    }
  }
}

function updateRoundResult(state: AuctionState, payload: { auctionId: string; round: number; result: ApiAuctionAllocation }) {
  const apiRound = state.auctions[payload.auctionId].auction.rounds[payload.round]

  if (apiRound) {
    Vue.set(apiRound, 'outcome', payload.result)
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

function removeBid(state: AuctionState, payload: { bidderId: string; bundle: ApiBundleEntryWrapper }) {
  const existingBidder = state.bidders[payload.bidderId]

  if (existingBidder && existingBidder.bids) {
    const bidIndex = existingBidder.bids.findIndex(bid => {
      return bid.bundle.hash === payload.bundle.hash
    })

    if (bidIndex !== -1) {
      existingBidder.bids.splice(bidIndex, 1)
    }
  }
}

function changeBidderStrategy(state: AuctionState, payload: { bidderId: string; strategy: ApiBidderStrategy }) {
  const existingBidder = state.bidders[payload.bidderId]

  if (existingBidder) {
    Vue.set(existingBidder, 'strategy', payload.strategy)
  }
}

function removeBids(state: AuctionState, payload: { bidderId: string }) {
  const existingBidder = state.bidders[payload.bidderId]

  if (existingBidder && existingBidder.bids) {
    while (existingBidder.bids.length > 0) {
      existingBidder.bids.pop()
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
  const { data } = await api.get(`/auctions/${payload.auctionId}`)
  auction.commitAppendAuction({ auction: data })
  return data
}

async function createAuction(context: BareActionContext<AuctionState, RootState>, payload: { auctionCreateDTO: ApiAuctionCreateDTO }) {
  const { data } = await api.post('/auctions/', payload.auctionCreateDTO)
  auction.commitAppendAuction({ auction: data })
  return data
}

async function removeAuction(context: BareActionContext<AuctionState, RootState>, payload: { auctionId: string }) {
  await api.delete(`/auctions/${payload.auctionId}`)
  auction.commitRemoveAuction({ auctionId: payload.auctionId })
}

async function archiveAuction(context: BareActionContext<AuctionState, RootState>, payload: { auctionId: string }) {
  await api.post(`/auctions/${payload.auctionId}/archive`)
  auction.commitRemoveAuction({ auctionId: payload.auctionId })
}

async function getRoundResult(context: BareActionContext<AuctionState, RootState>, payload: { auctionId: string; round: number }) {
  const { data } = await api.get(`/auctions/${payload.auctionId}/rounds/${payload.round}/result`)
  auction.commitRoundResult({ auctionId: payload.auctionId, round: payload.round, result: data })
}

async function placeBids(context: BareActionContext<AuctionState, RootState>, payload: { auctionId: string }): Promise<ApiAuction> {
  const bidderIds = context.state.auctions[payload.auctionId].auction.domain.bidders
  const bidders = bidderIds.map((id: string) => context.state.bidders[id])

  let bids: {
    [index: string]: {
      amount: BigNumber
      bundle: {
        [index: string]: number
      }
    }[]
  } = {}

  bidders.forEach(bidder => {
    if (!bidder.bids) bidder.bids = []
    bids[bidder.id!] = bidder.bids.map(bid => {
      const bundle: {
        [index: string]: number
      } = {}

      bid.bundle.entries.forEach(good => {
        bundle[good.good] = good.amount
      })

      return {
        amount: bid.amount,
        bundle: bundle
      }
    })
  })

  // place bids and close round
  await api.post(`/auctions/${payload.auctionId}/bids`, bids)
  const { data: auctionData } = await api.post(`/auctions/${payload.auctionId}/close-round`, bids)

  // update auctions after placing bids
  auction.commitAppendAuction({ auction: auctionData })

  // remove bids from bidders
  bidders.forEach(bidder => {
    bids[bidder.id!] = []
  })

  return auctionData as ApiAuction
}

async function getResult(context: BareActionContext<AuctionState, RootState>, payload: { auctionId: string }) {
  const { data } = await api.get(`/auctions/${payload.auctionId}/result`)
  auction.commitResult({ auctionId: payload.auctionId, result: data })
  return data
}

async function resetAuctionToRound(
  context: BareActionContext<AuctionState, RootState>,
  payload: { auctionId: string; round: number; standardBids?: boolean }
) {
  let { data: bids } = await api.put(`/auctions/${payload.auctionId}/reset`, { round: payload.round })

  // update auction
  await auction.dispatchGetAuction({ auctionId: payload.auctionId })

  // if we do not want to restore bids
  if (payload.standardBids) {
    const bidderIds = auction.biddersById()(payload.auctionId)
    bids = await auction.dispatchPropose({ auctionId: payload.auctionId, bidderIds: bidderIds })
  }

  bids.forEach((bid: ApiBid) => {
    bid.amount = new BigNumber(bid.amount) // convert bid amount to bignumber
    auction.commitUpdateBidder({ bidderId: bid.bidderId!, bid: bid })
  })

  // unselect all after reset
  selection.commitUnselectAll()
}

async function advanceRound(context: BareActionContext<AuctionState, RootState>, payload: { auctionId: string }) {
  const { data } = await api.post(`/auctions/${payload.auctionId}/advance-round`)
  auction.commitAppendAuction({ auction: data })
  if (!data.finished) {
    const bids: ApiBid[] = await auction.dispatchPropose({
      auctionId: data.id,
      bidderIds: auction.biddersById()(data.id)
    })

    bids.forEach(bid => {
      auction.commitUpdateBidder({ bidderId: bid.bidderId!, bid: bid })
    })
  }
}

async function advancePhase(context: BareActionContext<AuctionState, RootState>, payload: { auctionId: string }) {
  const { data } = await api.post(`/auctions/${payload.auctionId}/advance-phase`)
  auction.commitAppendAuction({ auction: data })
  if (!data.finished) {
    const bids: ApiBid[] = await auction.dispatchPropose({
      auctionId: data.id,
      bidderIds: auction.biddersById()(data.id)
    })

    bids.forEach(bid => {
      auction.commitUpdateBidder({ bidderId: bid.bidderId!, bid: bid })
    })
  }
}

async function finish(context: BareActionContext<AuctionState, RootState>, payload: { auctionId: string }) {
  const { data } = await api.post(`/auctions/${payload.auctionId}/finish`)
  auction.commitAppendAuction({ auction: data })
}

async function propose(
  context: BareActionContext<AuctionState, RootState>,
  payload: { auctionId: string; bidderIds: string[] }
): Promise<ApiBid[]> {
  const { data } = await api.post(`/auctions/${payload.auctionId}/propose`, payload.bidderIds)
  data.forEach((bid: ApiBid) => {
    if (bid.value) {
      const bundleValue: ApiBundleValue = {
        value: bid.value,
        bundle: bid.bundle,
        bidderId: bid.bidderId
      }
      auction.commitBundleValue({ bidderId: bid.bidderId!, bundleValue: bundleValue })
    }
  })
  return data
}

async function demandQuery(
  context: BareActionContext<AuctionState, RootState>,
  payload: { auctionId: string; bidders: ApiBidder[]; goodIds: string[] }
) {}

async function valueQuery(
  context: BareActionContext<AuctionState, RootState>,
  payload: { auctionId: string; bidderIds: string[]; bundles: ApiBundleEntryWrapper[] }
) {
  const bundles: any[] = []

  payload.bundles.forEach(bundle => {
    const tmpBundle: { [x: string]: number } = {}

    bundle.entries.forEach(entry => {
      tmpBundle[entry.good] = entry.amount
    })

    bundles.push(tmpBundle)
  })

  const valueQuery = {
    bidders: payload.bidderIds,
    bundles: bundles
  }

  const { data: valueQueryResult } = await api.post(`/auctions/${payload.auctionId}/valuequery`, valueQuery)

  Object.keys(valueQueryResult).forEach(bidderId => {
    valueQueryResult[bidderId].forEach((value: ApiBundleValue) => {
      auction.commitBundleValue({ bidderId: bidderId, bundleValue: value })
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
  commitRemoveBids: moduleBuilder.commit(removeBids),
  commitChangeBidderStrategy: moduleBuilder.commit(changeBidderStrategy),
  commitResult: moduleBuilder.commit(addResult),
  commitBundleValue: moduleBuilder.commit(addBundleValue),
  commitRemoveAuction: moduleBuilder.commit(removeAuctionMutation),
  commitRoundResult: moduleBuilder.commit(updateRoundResult),

  // actions
  dispatchGetAuction: moduleBuilder.dispatch(getAuction),
  dispatchCreateAuction: moduleBuilder.dispatch(createAuction),
  dispatchRemoveAuction: moduleBuilder.dispatch(removeAuction),
  dispatchArchiveAuction: moduleBuilder.dispatch(archiveAuction),
  dispatchPlaceBids: moduleBuilder.dispatch(placeBids),
  dispatchGetAuctionResult: moduleBuilder.dispatch(getResult),
  dispatchResetAuctionToRound: moduleBuilder.dispatch(resetAuctionToRound),
  dispatchValueQuery: moduleBuilder.dispatch(valueQuery),
  dispatchDemandQuery: moduleBuilder.dispatch(demandQuery),
  dispatchAdvanceRound: moduleBuilder.dispatch(advanceRound),
  dispatchAdvancePhase: moduleBuilder.dispatch(advancePhase),
  dispatchFinish: moduleBuilder.dispatch(finish),
  dispatchPropose: moduleBuilder.dispatch(propose),
  dispatchGetRoundResult: moduleBuilder.dispatch(getRoundResult)
}

export default auction
