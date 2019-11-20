<template>
  <div class="container">
    <h2>Set up an Auction</h2>
    <hr />

    <p>
      Select one of our historic auctions to re-play or further configure this scenario, or create your own instance, configured to your
      liking.
    </p>

    <div class="row">
      <div class="col">
        <div
          class="card-deck"
          v-intro="
            'To get started, you can choose a starting point for the auction you are going to create.<br>\
              With the first options, you can jump directly in a configuration of historic auction examples, who all in some way had a flaw.'
          "
          v-intro-position="'top'"
        >
          <div class="card" @click="configureAndCreate('new-zealand-1990')">
            <img src="../assets/new-zealand.jpg" class="card-img-top" />
            <div class="card-body">
              <h5 class="card-title">New Zealand 1990</h5>
              <p class="card-text">
                A configuration based on a spectrum auction that took place in New Zealand in 1990, which pointed out a potential problem
                with a simultaneous second-price auction.
              </p>
            </div>
          </div>
          <div class="card" @click="configureAndCreate('swiss-march-2000')">
            <img src="../assets/ch-march.jpg" class="card-img-top" />
            <div class="card-body">
              <h5 class="card-title">Swiss March 2000</h5>
              <p class="card-text">
                A configuration based on a spectrum auction (called "Swiss Wireless Local Loop (WLL)") that took place in Switzerland in
                March 2000, which pointed out a potential problem with a sequential second-price auction.
              </p>
            </div>
          </div>
          <!--<div class="card" @click="configureAndCreate('swiss-december-2000')">
            <img src="../assets/ch-december.jpg" class="card-img-top" />
            <div class="card-body">
              <h5 class="card-title">Swiss December 2000</h5>
              <p class="card-text">
                A configuration based on the Swiss auction for UMTS licenses that took place in December 2000 in the format of a
                simultaneous second-price auction, which failed to generate much revenue.
              </p>
            </div>
          </div>-->
          <div
            class="card"
            @click="configureAndCreate('custom')"
            v-intro="'With this option, you can customize your auction from scratch.'"
            v-intro-position="'top'"
          >
            <img src="../assets/custom.jpg" class="card-img-top" />
            <div class="card-body">
              <h5 class="card-title">Custom</h5>
              <p class="card-text">Configure an auction from scratch, selecting the mechanism, domain and additional parameters.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'AuctionSetupView',
  methods: {
    select(auctionType: string) {
      this.$data.modelValue = this.$data.historicDomains.find((obj: any) => obj.id === auctionType)
    },
    configureAndCreate(domain: string) {
      this.$router.push({ name: 'auction-customize', query: { domain: domain } })
    }
  }
})
</script>

<style scoped lang="scss">
@import '../custom.scss';

.content {
  display: flex;
  max-height: 40vh;
  flex-direction: column;
}

.card {
  cursor: pointer;
}

.card:hover {
  @extend .shadow;
}
</style>
