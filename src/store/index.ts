import { getStoreBuilder } from 'vuex-typex'
import Vue from 'vue'
import Vuex, { Store } from 'vuex'
import { vuexOidcCreateStoreModule } from 'vuex-oidc'

import { AuctionState } from './modules/auction'
import { SelectionState } from './modules/selection'
import { GuiState } from './modules/gui'
import './modules/auction'
import './modules/selection'
import './modules/gui'

export interface RootState {
  auction: AuctionState
  selection: SelectionState
  gui: GuiState
}

Vue.use(Vuex)
const store: Store<RootState> = getStoreBuilder<RootState>().vuexStore()

// oidc
export const oidcSettings = {
  authority: 'https://accounts.google.com/',
  clientId: '331980528223-vd457jtapti5bhsi39ht9ivvmggbhceu.apps.googleusercontent.com',
  redirectUri: 'http://localhost:1234/oidc-callback',
  responseType: 'id_token token',
  scope: 'openid',
  automaticSilentRenew: true
}

store.registerModule(
  'oidcStore',
  vuexOidcCreateStoreModule(oidcSettings, null, {
    userLoaded: (user: any) => console.log('OIDC user is loaded:', user),
    userUnloaded: () => console.log('OIDC user is unloaded'),
    accessTokenExpiring: () => console.log('Access token will expire'),
    accessTokenExpired: () => console.log('Access token did expire'),
    silentRenewError: () => console.log('OIDC user is unloaded'),
    userSignedOut: () => console.log('OIDC user is signed out')
  })
)

export default store // <-- "store" to provide to root Vue
