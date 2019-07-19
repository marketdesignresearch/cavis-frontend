import Vue from 'vue'
import { getStoreBuilder } from 'vuex-typex'
import { RootState } from '..'
import hashBundle from '@/services/bundleHash'
import { ApiBundleEntryWrapper } from './auction'

export interface SelectionState {
  selectedGoods: {
    [x: string]: boolean
  }
  selectedBidder: string | null
}

const moduleBuilder = getStoreBuilder<RootState>().module<SelectionState>('selection', { selectedGoods: {}, selectedBidder: null })
const stateGetter = moduleBuilder.state()

// getters
const selectedGoods = moduleBuilder.read(state => Object.keys(state.selectedGoods), 'selectedGoods')
const selectedBundle = moduleBuilder.read(state => {
  const entries = Object.keys(state.selectedGoods).map(id => {
    return { good: id, amount: 1 }
  })
  return {
    hash: hashBundle(entries),
    entries: entries
  }
}, 'selectedBundle')
const selectedBidder = moduleBuilder.read(state => state.selectedBidder, 'selectedBidder')

// mutations
function commitSelectGood(state: SelectionState, payload: { goodId: string }) {
  if (state.selectedGoods[payload.goodId]) {
    Vue.delete(state.selectedGoods, payload.goodId)
  } else {
    Vue.set(state.selectedGoods, payload.goodId, true)
  }
}

function commitSelectBidder(state: SelectionState, payload: { bidderId: string }) {
  if (state.selectedBidder === payload.bidderId) {
    state.selectedBidder = null
  } else {
    state.selectedBidder = payload.bidderId
  }
}

function commitUnselectGoods(state: SelectionState) {
  Object.keys(state.selectedGoods).forEach(key => Vue.delete(state.selectedGoods, key))
}
function commitUnselectAll(state: SelectionState) {
  Object.keys(state.selectedGoods).forEach(key => Vue.delete(state.selectedGoods, key))
  state.selectedBidder = null
}

const selection = {
  // state
  get state() {
    return stateGetter
  },

  get selectedGoods() {
    return selectedGoods
  },

  get selectedBidder() {
    return selectedBidder
  },

  get selectedBundle(): () => ApiBundleEntryWrapper {
    return selectedBundle
  },

  // mutations
  commitSelectGood: moduleBuilder.commit(commitSelectGood),
  commitSelectBidder: moduleBuilder.commit(commitSelectBidder),
  commitUnselectGoods: moduleBuilder.commit(commitUnselectGoods),
  commitUnselectAll: moduleBuilder.commit(commitUnselectAll)
}

export default selection
