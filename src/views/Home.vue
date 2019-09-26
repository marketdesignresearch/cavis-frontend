<template>
  <div>
    <div class="jumbotron">
      <div class="container">
        <h1
          class="display-4"
          v-intro="
            'Welcome to CAVis, a visualizer for combinatorial Auctions.<br><br>\
            We will guide you through the various pages and features of the tool. And don\'t worry, this tutorial is only triggered automatically on your first visit (or after you\'ve cleared your cookies).<br><br>\
            You can advance or go back in the tutorial by using your arrow keys, which might prove more efficient than using your mouse.'
          "
          v-intro-position="'bottom-middle-aligned'"
        >
          Combinatorial Auction Visualizer
        </h1>
        <p
          class="lead"
          v-intro="
            'The purpose of CAVis is to allow you to play around with various auction settings (e.g. certain types of bidders). \
            One of the goals is that you can learn something about advantages and disadvantages of certain combinations of auction settings and formats.'
          "
          v-intro-position="'bottom-middle-aligned'"
        >
          CAVis is an online, interactive tool to discover and learn about combinatorial auctions.
        </p>
        <p>
          You can play different auction formats in domains where bidders have different values for the goods, while also discovering
          examples of situations where certain auction formats can lead to undesired outcomes in particular settings.
        </p>
      </div>
    </div>

    <auction-create class="pb-4" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import api from '@/services/api'

export default Vue.extend({
  mounted() {
    if (!this.$cookies.isKey('homeIntro')) {
      // show introjs
      window.addEventListener('load', () => {
        // run after everything is in-place
        this.$intro()
          .setOptions({ showStepNumbers: false, skipLabel: 'End' })
          .start()
        this.$cookies.set('homeIntro', true)
      })
    }
  },
  components: {
    'auction-create': () => import('./AuctionSetupChoose.vue')
  },
  computed: {
    apiUrl(): string | undefined {
      return api.defaults.baseURL
    }
  },
  name: 'home'
})
</script>
