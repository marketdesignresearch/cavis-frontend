<template>
  <div id="app" class="d-flex flex-column">
    <b-navbar class="mb-4" toggleable="lg" type="light">
      <div class="container">
        <router-link tag="a" class="navbar-brand" :to="{ name: 'auction-create' }">
          Home
        </router-link>

        <b-navbar-toggle target="nav-collapse">
          <font-awesome-icon fixed-width :icon="['fa', 'bars']" />
        </b-navbar-toggle>

        <b-collapse id="nav-collapse" is-nav v-model="navCollapsed">
          <b-navbar-nav>
            <li class="nav-item">
              <router-link class="nav-link" :to="{ name: 'auction-list' }">Previous Auctions</router-link>
            </li>
          </b-navbar-nav>

          <b-navbar-nav class="ml-auto">
            <li class="nav-item">
              <a class="nav-link" href="/docs/" target="_blank">Documentation</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="/docs/#/faq" target="_blank">FAQ</a>
            </li>
            <li class="nav-item" v-intro="'Click here to create a new auction.'">
              <router-link tag="a" class="nav-link btn btn-primary text-white" :to="{ name: 'auction-create' }">
                Create new Auction
              </router-link>
            </li>
            <li class="nav-item">
              <a
                class="nav-link btn btn-secondary text-white"
                :class="{ 'mt-1': navCollapsed, 'ml-1': !navCollapsed }"
                v-intro="'You can restart this tour anytime.'"
                @click="showHelp"
                >Help</a
              >
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
      const startAt = this.$router.currentRoute.name === 'home' ? 1 : 2 // start later if not on home
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
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
}

.content {
  flex: 1 0 auto;
}

.navbar-toggler {
  border: none;
}

#nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
