<template>
  <div class="container">
    Logging you in...
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

import { mapActions } from 'vuex'

export default Vue.extend({
  name: 'OidcCallback',
  methods: {
    ...mapActions(['oidcSignInCallback'])
  },
  async mounted() {
    try {
      await this.oidcSignInCallback()
      this.$router.push('/auth/login')
    } catch (error) {
      console.error(error)
      this.$router.push('/oidc-callback-error') // Handle errors any way you want
    }
  }
})
</script>
