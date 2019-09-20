import Vue from 'vue'
import { getStoreBuilder } from 'vuex-typex'
import { RootState } from '..'

export interface GuiState {
  auctioneerVisible: boolean
}

const moduleBuilder = getStoreBuilder<RootState>().module<GuiState>('gui', { auctioneerVisible: false })
const stateGetter = moduleBuilder.state()

// getters
const auctioneerVisible = moduleBuilder.read(state => state.auctioneerVisible, 'auctioneerVisible')

// mutations
function commitAuctioneerVisibility(state: GuiState, payload: { visible: boolean }) {
  Vue.set(state, 'auctioneerVisible', payload.visible)
}

const selection = {
  // state
  get state() {
    return stateGetter
  },

  get auctioneerVisible() {
    return auctioneerVisible
  },

  // mutations
  commitAuctioneerVisibility: moduleBuilder.commit(commitAuctioneerVisibility)
}

export default selection
