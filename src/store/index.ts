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

import auth from '@/services/auth'
import api from '@/services/api'
import { Route } from 'vue-router'

export interface RootState {
  auction: AuctionState
  selection: SelectionState
  gui: GuiState
}

Vue.use(Vuex)

const url = `${window.location.protocol}//${window.location.host}/`

// oidc
export const oidcSettings = {
  authority: 'https://accounts.google.com/',
  clientId: '331980528223-vd457jtapti5bhsi39ht9ivvmggbhceu.apps.googleusercontent.com',
  redirectUri: `${url}oidc-callback`,
  post_logout_redirect_uri: url,
  responseType: 'id_token token',
  scope: 'openid',
  automaticSilentRenew: true
}

const store: Store<RootState> = getStoreBuilder<RootState>().vuexStore()

store.registerModule(
  'oidcStore',
  vuexOidcCreateStoreModule(
    oidcSettings,
    {
      isPublicRoute: (route: Route) => true, // all routes are public by default
      dispatchEventsOnWindow: true
    },
    {
      userLoaded: (user: any) => {
        console.log('OIDC user loaded')
        auth.init(api, user)
      },
      userUnloaded: () => console.log('OIDC user is unloaded'),
      accessTokenExpiring: () => console.log('Access token will expire'),
      accessTokenExpired: () => console.log('Access token did expire'),
      silentRenewError: () => console.log('OIDC user is unloaded'),
      userSignedOut: () => console.log('OIDC user is signed out'),
      oidcError: (payload: any) => console.log(`An error occured at ${payload.context}:`, payload.error)
    }
  )
)

export default store // <-- "store" to provide to root Vue
