<template>
  <div class="container">
    <b-button variant="primary" @click="authenticateOidc">Sign In with Google</b-button>
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
