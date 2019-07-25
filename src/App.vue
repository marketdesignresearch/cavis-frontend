<template>
  <div id="app" class="d-flex flex-column">
    <nav class="navbar navbar-expand-lg navbar-light bg-light mb-4">
      <div class="container">
      <a class="navbar-brand" href="#">Home</a>

      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item">
            <router-link tag="a" class="nav-link" :to="{ name: 'auction-list' }">Previous Auctions</router-link>
          </li>
        </ul>
        <ul class="navbar-nav">
          <li class="nav-item">
            <router-link tag="a" class="nav-link btn btn-primary text-white" :to="{ name: 'auction-setup' }">Create new Auction</router-link>
          </li>
        </ul>
      </div>
      </div>
    </nav>

    <router-view />
  </div>
</template>

<style lang="scss" scoped>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
}

.content {
  flex: 1 0 auto
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
