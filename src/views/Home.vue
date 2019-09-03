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

        <p class="lead text-center my-4">
          <a class="btn btn-primary btn-lg" href="/docs/" role="button">Learn more</a>
          <router-link tag="button" class="btn btn-success mx-3 btn-lg text-white" :to="{ name: 'auction-create' }"
            >Setup an Auction</router-link
          >
        </p>

        <div class="mt-4">
          <p>
            CAVis was developed at the <a href="https://www.uzh.ch/" target="_blank">University of Zurich</a> in collaboration with
            <a href="https://www.bu.edu/" target="_blank">Boston University</a>.
          </p>

          <p>
            CAVis is an open-source web application, published under the GNU Affero license (Contributions are welcome!). The source code of
            all components is <a href="https://github.com/marketdesignresearch/" target="_blank">published</a> on GitHub.
          </p>

          <p>
            Notable dependencies (each also developed and open-sourced by us) that enable this visualization are:
          </p>

          <ul>
            <li>
              <a href="https://github.com/marketdesignresearch/mechlib/" target="_blank">Mechanism Library</a>: A java library that provides
              the core concepts for several kinds of market mechanisms
            </li>
            <li>
              <a href="http://spectrumauctions.org/" target="_blank">SATS</a>: A "Spectrum Auction Test Suite" that provides the models and
              Winner Determination Problems of several spectrum auction domains
            </li>
          </ul>
        </div>
      </div>
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
