import { getStoreBuilder } from 'vuex-typex'
import Vue from 'vue'
import Vuex, { Store } from 'vuex'

import { AuctionState } from './modules/auction'
import { SelectionState } from './modules/selection'
import './modules/auction'
import './modules/selection'

export interface RootState {
  auction: AuctionState
  selection: SelectionState
}

Vue.use(Vuex)
const store: Store<RootState> = getStoreBuilder<RootState>().vuexStore()
export default store // <-- "store" to provide to root Vue
