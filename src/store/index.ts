import { getStoreBuilder } from 'vuex-typex'
import Vue from 'vue'
import Vuex, { Store } from 'vuex'

import { AuctionState } from './modules/auction'
import './modules/auction'

export interface RootState {
  auction: AuctionState
}

Vue.use(Vuex)
const store: Store<RootState> = getStoreBuilder<RootState>().vuexStore()
export default store // <-- "store" to provide to root Vue
