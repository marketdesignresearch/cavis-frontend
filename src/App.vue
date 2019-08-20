<template>
  <div id="app" class="d-flex flex-column">
    <nav class="navbar navbar-expand-lg navbar-light bg-light mb-4">
      <div class="container">
        <a class="navbar-brand" href="#">Home</a>

        <button
          class="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav mr-auto">
            <li class="nav-item" v-intro="'Click here to get an overview over past auctions.'">
              <router-link tag="a" class="nav-link" :to="{ name: 'auction-list' }">Previous Auctions</router-link>
            </li>
          </ul>
          <ul class="navbar-nav pr-3">
          <li class="nav-item">
            <a class="nav-link" href="/docs" target="_blank">Documentation</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/docs/#/faq" target="_blank">FAQ</a>
          </li>
          </ul>
          <ul class="navbar-nav">
            <li class="nav-item" v-intro="'Click here to create a new auction.'">
              <router-link tag="a" class="nav-link btn btn-primary text-white" :to="{ name: 'auction-create' }">
                Create new Auction
              </router-link>
            </li>
            <li class="nav-item">
              <button class="nav-link btn ml-2 btn-secondary text-white" v-intro="'You can restart this tour anytime.'" @click="showHelp">Help</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <router-view />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  methods: {
    showHelp() {
      this.$intro().showHints()
      this.$intro()
        .setOptions({ showStepNumbers: false })
        .start()
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
