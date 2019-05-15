import api from '@/services/api'
import { getStoreBuilder, BareActionContext } from 'vuex-typex'
import { RootState } from '..'

export interface AuctionState {
  auctions: ApiAuction[]
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
  value: {
    bundleValues: []
  }
}

export interface ApiGood {
  id: string
  availability: number
  dummyGood: boolean
}

const moduleBuilder = getStoreBuilder<RootState>().module<AuctionState>('auction', { auctions: [] })

// getters
const auctionById = moduleBuilder.read(state => (id: string) => state.auctions.find(obj => obj.id === id), 'getAuctionById')

// mutations
function appendAuctionMutation(state: AuctionState, payload: { auction: ApiAuction }) {
  state.auctions.push(payload.auction)
}

// actions
async function createAuction(context: BareActionContext<AuctionState, RootState>, payload: { bidders: ApiBidder[]; goods: ApiGood[] }) {
  const createdAuction: ApiAuction = { bidders: payload.bidders, goods: payload.goods, type: ApiAuctionType.SINGLE_ITEM_SECOND_PRICE }
  const { data } = await api().post('/auctions/', auction)
  createdAuction.id = data
  auction.commitAppendAuction({ auction: createdAuction })
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

  // mutations
  commitAppendAuction: moduleBuilder.commit(appendAuctionMutation),

  // actions
  dispatchCreateAuction: moduleBuilder.dispatch(createAuction)
}

export default auction
