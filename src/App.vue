<template>
  <div id="app" class="d-flex flex-column">
    <b-navbar class="mb-4" toggleable="lg" type="light">
      <div class="container">
        <router-link
          tag="a"
          class="navbar-brand"
          :to="{ name: 'home' }"
          v-intro="'Click here get to the home screen anytime to start a new auction.'"
          v-intro-step="96"
        >
          Home
        </router-link>

        <b-navbar-toggle target="nav-collapse">
          <font-awesome-icon fixed-width :icon="['fa', 'bars']" />
        </b-navbar-toggle>

        <b-collapse id="nav-collapse" is-nav v-model="navCollapsed">
          <b-navbar-nav>
            <b-nav-item :to="{ name: 'auction-list' }" v-intro="'Click here to get an overview over recent auctions.'" v-intro-step="97">
              Auctions
            </b-nav-item>
          </b-navbar-nav>

          <b-navbar-nav
            class="ml-auto"
            v-intro="
              'Here, you can access the documentation (including background information, explanations, etc.), the FAQ, or learn more about the people behind this tool.'
            "
            v-intro-step="98"
          >
            <button
              class="btn btn-primary btn-tutorial mr-2"
              v-intro="
                'You can activate the tutorial anytime with this button; it will be explaining the component you see on your screen at that moment.'
              "
              v-intro-step="99"
              v-intro-position="'left'"
              @click="showTutorial"
            >
              Tutorial
            </button>
            <b-nav-item :to="{ name: 'faq' }">
              FAQ
            </b-nav-item>

            <b-nav-item :to="{ name: 'about' }" class="border-right pr-2">
              About
            </b-nav-item>

            <b-nav-item href="/docs/" target="_blank" class="border-right px-2">
              Documentation <font-awesome-icon fixed-width icon="external-link-alt" />
            </b-nav-item>

            <b-nav-item class="pl-2" v-if="!oidcIsAuthenticated" :to="{ name: 'auth-login' }">Sign In</b-nav-item>

            <img v-if="oidcIsAuthenticated" :src="oidcUser.picture" class="img-fluid user-avatar ml-3" />
            <b-nav-item-dropdown
              v-if="oidcIsAuthenticated"
              id="dropdown-settings"
              right
              :text="oidcUser.name"
              variant="link"
              :menu-class="'text-primary'"
            >
              <b-dropdown-item @click="signOutOidc">Sign out</b-dropdown-item>
            </b-nav-item-dropdown>
          </b-navbar-nav>
        </b-collapse>
      </div>
    </b-navbar>

    <router-view />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/store'
import { mapGetters, mapActions } from 'vuex'
import api from './services/api'
import { AxiosError } from 'axios'

export default Vue.extend({
  computed: {
    ...mapGetters(['oidcIsAuthenticated', 'oidcUser'])
  },
  beforeCreate() {
    api.registerResponseErrorHandler((error: AxiosError) => {
      if (error && !error.response) {
        this.$bvModal.msgBoxOk('We had some problems reaching the server. Check your internet connection or try again later.', {
          centered: true,
          title: 'Oops.'
        })
      }

      if (error && error.response && error.response.status === 500) {
        this.$bvModal.msgBoxOk('Something went wrong. Please try again.', {
          centered: true,
          title: 'Oops.'
        })
      }
    })
  },
  mounted() {
    window.addEventListener('vuexoidc:userUnloaded', this.userUnloaded)
  },
  destroyed() {
    window.removeEventListener('vuexoidc:userUnloaded', this.userUnloaded)
  },
  methods: {
    ...mapActions(['signOutOidc']),
    showTutorial() {
      this.$intro()
        .setOptions({ showStepNumbers: false, skipLabel: 'End' })
        .start()
    },
    userUnloaded() {
      this.$router.push({ name: 'home' })
    }
  },
  data: () => {
    return {
      navCollapsed: false
    }
  }
})
</script>

<style lang="scss" scoped>
@import 'custom.scss';

//.btn-tutorial {
//  z-index: 100;
//  position: fixed;
//  right: 30px;
//  bottom: 30px;
//  background-color: white;
//}

.user-avatar {
  margin-top: 5px;
  width: 30px;
  height: 30px;
  border-radius: 15px;
}

.navbar-collapse.collapse.show,
.navbar-collapse.collapsing {
  button {
    @extend .btn-block;
  }

  li.nav-item {
    a.nav-link {
      padding-right: 0;
      padding-left: 0;
    }
  }
}

li.nav-item {
  a.nav-link {
    padding-left: 1rem;
    padding-right: 2rem;
  }
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
}

.content {
  flex: 1 0 auto;
}

.navbar-toggler {
  border: none;
}
</style>
