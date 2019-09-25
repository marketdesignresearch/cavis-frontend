<template>
  <div id="app" class="d-flex flex-column">
    <b-navbar class="mb-4" toggleable="lg" type="light">
      <div class="container">
        <router-link tag="a" class="navbar-brand" :to="{ name: 'home' }">
          Home
        </router-link>

        <b-navbar-toggle target="nav-collapse">
          <font-awesome-icon fixed-width :icon="['fa', 'bars']" />
        </b-navbar-toggle>

        <b-collapse id="nav-collapse" is-nav v-model="navCollapsed">
          <b-navbar-nav>
            <b-nav-item :to="{ name: 'auction-list' }" v-intro="'Click here to get an overview over recent auctions.'" v-intro-step="1">
              Auctions
            </b-nav-item>

            <b-nav-item href="/docs/" target="_blank">
              Documentation <font-awesome-icon fixed-width icon="external-link-alt" />
            </b-nav-item>

            <b-nav-item :to="{ name: 'faq' }">
              FAQ
            </b-nav-item>

            <b-nav-item :to="{ name: 'about' }">
              About
            </b-nav-item>

            <b-button
              variant="info"
              class="text-white"
              v-intro="'You can restart this tour anytime.'"
              v-intro-step="99"
              @click="showTutorial"
            >
              Tutorial
            </b-button>
          </b-navbar-nav>

          <b-navbar-nav class="ml-auto">
            <b-nav-item v-if="!oidcIsAuthenticated" :to="{ name: 'auth-login' }">Login</b-nav-item>

            <img v-if="oidcIsAuthenticated" :src="oidcUser.picture" class="img-fluid user-avatar" />
            <b-nav-item-dropdown
              v-if="oidcIsAuthenticated"
              id="dropdown-settings"
              right
              :text="oidcUser.name"
              variant="link"
              :menu-class="'text-primary'"
            >
              <b-dropdown-item @click="signOutOidc">Logout</b-dropdown-item>
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

export default Vue.extend({
  computed: {
    ...mapGetters(['oidcIsAuthenticated', 'oidcUser'])
  },
  mounted() {
    if (!this.$cookies.isKey('firstIntro')) {
      // show introjs
      setTimeout(this.showTutorial, 3000)
      this.$cookies.set('firstIntro', true)
    }
  },
  methods: {
    ...mapActions(['signOutOidc']),
    showTutorial() {
      const startAt = this.$router.currentRoute.name === 'home' ? 1 : 3 // start later if not on home
      this.$intro().showHints()
      this.$intro()
        .setOptions({ showStepNumbers: false, skipLabel: 'End' })
        .goToStepNumber(startAt)
        .start()
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
