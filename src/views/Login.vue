<template>
  <div class="container">
    <h2>
      Sign In
    </h2>
    <hr />
    <p>
      If you'd like to keep your auctions <i>private</i>, you can sign in using your Google account so we are able to keep track of your
      auctions. We do not store any sensible information of you, only a small identifier (a random number) provided by Google.
    </p>
    <p class="text-center pt-3">
      <b-button size="lg" variant="outline-success" @click="authenticateOidc">
        Sign In with Google <font-awesome-icon class="pl-1" :icon="['fab', 'google']" />
      </b-button>
    </p>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapGetters, mapActions } from 'vuex'

export default Vue.extend({
  computed: {
    ...mapGetters(['oidcIsAuthenticated', 'oidcUser'])
  },
  methods: {
    ...mapActions(['authenticateOidc', 'signOutOidc'])
  }
})
</script>

<style scoped lang="scss"></style>
