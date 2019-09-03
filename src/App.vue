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
            <li class="nav-item" v-intro="'Click here to get an overview over recent auctions.'" v-intro-step="1">
              <router-link class="nav-link" :to="{ name: 'auction-list' }">Auctions</router-link>
            </li>
          </b-navbar-nav>

          <b-navbar-nav class="ml-auto">
            <li class="nav-item">
              <a class="nav-link" href="/docs/" target="_blank">Documentation</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="/docs/#/faq" target="_blank">FAQ</a>
            </li>
            <li class="nav-item" v-intro="'Click here to create a new auction.'" v-intro-step="2">
              <router-link tag="button" class="nav-link btn btn-primary text-white" :to="{ name: 'auction-create' }">
                Create new Auction
              </router-link>
            </li>
            <li class="nav-item">
              <button
                class="nav-link btn btn-info text-white"
                :class="{ 'mt-1': navCollapsed, 'ml-1': !navCollapsed }"
                v-intro="'You can restart this tour anytime.'"
                v-intro-step="99"
                @click="showHelp"
              >
                Help
              </button>
            </li>
          </b-navbar-nav>
        </b-collapse>
      </div>
    </b-navbar>

    <router-view />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  mounted() {
    if (!this.$cookies.isKey('firstIntro')) {
      // show introjs
      this.showHelp()
      this.$cookies.set('firstIntro', true)
    }
  },
  methods: {
    showHelp() {
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
