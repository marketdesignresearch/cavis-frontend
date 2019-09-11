<template>
  <div>
    <div class="container">
      <div class="jumbotron">
        <h1 class="display-4">Combinatorial Auction Visualizer</h1>
        <p class="lead">
          An online, interactive platform for combinatorial auctions.
        </p>
        <hr class="my-4" />
        <p>
          The goal is that students/instructors/researchers can use this platform to learn about different auction formats and their
          advantages and disadvantages in an interactive way.
        </p>
      </div>

      <auction-create class="pb-4" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import api from '@/services/api'

export default Vue.extend({
  components: {
    'auction-create': () => import('./AuctionSetupChoose.vue')
  },
  computed: {
    apiUrl(): string | undefined {
      return api().defaults.baseURL
    }
  },
  name: 'home'
})
</script>
