<template>
  <div class="container">
    <h1>All Auctions</h1>

    <table class="table">
      <thead>
        <tr>
          <th scope="col">Auction ID</th>
          <th scope="col">Bidders</th>
          <th scope="col">Played Rounds</th>
          <th scope="col">Type</th>
          <th scope="col"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="auction in auctions" :key="auction.id">
          <td>{{ auction.id }}</td>
          <td>{{ auction.auction.domain.bidders.length }}</td>
          <td>{{ auction.auction.rounds.length }}</td>
          <td>{{ auction.auction.mechanismType }}</td>
          <td>
            <router-link tag="button" :to="{ name: 'auction', params: { id: auction.id } }" class="btn btn-sm btn-primary">
              Load
            </router-link>
            <button class="btn btn-sm btn-warning" @click="remove(auction.id)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import auction from '../store/modules/auction'

export default Vue.extend({
  name: 'AuctionListView',
  computed: {
    auctions() {
      return auction.auctions()
    }
  },
  methods: {
    remove(auctionId: string) {
      auction.dispatchRemoveAuction({ auctionId: auctionId })
    }
  },
  mounted() {
    auction.dispatchGetAuctions()
  }
})
</script>

<style scoped lang="scss"></style>
