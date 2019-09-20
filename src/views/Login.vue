<template>
  <div class="container">
    State: {{ oidcIsAuthenticated }} User: {{ oidcUser }}
    <button @click="signOutOidc">Sign out</button>
    <button @click="authenticateOidc">Sign In</button>
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
