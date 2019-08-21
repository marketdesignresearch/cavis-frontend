<template>
  <div class="container">
    <h1>Setup an Auction</h1>
    <hr />

    <p>
      Select one of our historic auctions to re-play or further configure this scenario, or create your own instance, configured to your
      liking.
    </p>

    <div class="row">
      <div class="col">
        <div class="card-deck" v-intro="'Here, you can choose a starting point for the auction you are going to create.'">
          <div
            class="card"
            style="width: 18rem;"
            @click="selectedDomain = 'custom'"
            :class="{ 'border border-success': selectedDomain === 'custom' }"
            v-intro="'With this option, you can customize your auction from scratch.'"
          >
            <img src="https://picsum.photos/300/300/?image=41" class="card-img-top" />
            <div class="card-body">
              <h5 class="card-title">Custom</h5>
              <p class="card-text">Configure an auction from scratch, selecting the mechanism, domain and additional parameters.</p>
            </div>
          </div>
          <div
            class="card"
            style="width: 18rem;"
            @click="selectedDomain = 'new-zealand-1990'"
            :class="{ 'border border-success': selectedDomain === 'new-zealand-1990' }"
            v-intro="
              'This option brings you directly into an auction configuration that represents the New Zealand auction of 1990, which was a simultaneous second-price auction on multiple goods.'
            "
          >
            <img src="https://picsum.photos/300/300/?image=41" class="card-img-top" />
            <div class="card-body">
              <h5 class="card-title">New Zealand 1990</h5>
              <p class="card-text">
                A real-world example of a simultaneous second-price auction, showcasing the difficulties of this approach.
              </p>
            </div>
          </div>
          <div
            class="card"
            style="width: 18rem;"
            @click="selectedDomain = 'swiss-march-2000'"
            :class="{ 'border border-success': selectedDomain === 'swiss-march-2000' }"
            v-intro="
              'Similarly, this provides an auction configuration that represents the Swiss auction of March 2000, which was a sequential second-price auction on multiple goods.'
            "
          >
            <img src="https://picsum.photos/300/300/?image=41" class="card-img-top" />
            <div class="card-body">
              <h5 class="card-title">Swiss March 2000</h5>
              <p class="card-text">
                A real-world example of a sequential second-price auction, showcasing the difficulties of this approach.
              </p>
            </div>
          </div>
          <div
            class="card"
            style="width: 18rem;"
            @click="selectedDomain = 'swiss-december-2000'"
            :class="{ 'border border-success': selectedDomain === 'swiss-december-2000' }"
            v-intro="'Lastly, this provides an auction configuration that represents the Swiss auction of December 2000.'"
          >
            <img src="https://picsum.photos/300/300/?image=41" class="card-img-top" />
            <div class="card-body">
              <h5 class="card-title">Swiss December 2000 UMTS</h5>
              <p class="card-text">A real-world example showing "bidder meltdown".</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row pt-5">
      <div class="col text-center">
        <button
          class="btn btn-lg btn-success"
          :disabled="!selectedDomain"
          @click="configureAndCreate"
          v-intro="'Once you have chosen, click here to continue.'"
        >
          Configure and Create
        </button>
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
    configureAndCreate() {
      this.$router.push({ name: 'auction-customize', query: { domain: this.$data.selectedDomain } })
    }
  },
  data() {
    return {
      selectedDomain: null
    }
  }
})
</script>

<style scoped lang="scss">
@import '../custom.scss';

.content {
  display: flex;
  min-height: 80vh;
  flex-direction: column;
}

.card {
  cursor: pointer;
}

.card:hover {
  @extend .shadow;
}
</style>