<template>
  <div class="container">
    <h1>Previous Auctions</h1>

    <div class="table-responsive">
      <table class="table table-striped">
        <thead>
          <tr>
            <th scope="col">Auction ID</th>
            <th scope="col">Date</th>
            <th scope="col">Mechanism</th>
            <th scope="col">Domain</th>
            <th scope="col"># Goods</th>
            <th scope="col"># Bidders</th>
            <th scope="col"># Played Rounds</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="auction in auctions" :key="auction.id">
            <td>{{ auction.id }}</td>
            <td></td>
            <td>{{ auction.auction.mechanismType }}</td>
            <td>{{ auction.auctionType }}</td>
            <td>{{ auction.auction.domain.goods.length }}</td>
            <td>{{ auction.auction.domain.bidders.length }}</td>
            <td>{{ auction.auction.rounds.length }}</td>
            <td class="text-right">
              <b-dropdown right variant="primary" split text="Load" class="m-2" :split-to="{ name: 'auction', params: { id: auction.id } }">
                <b-dropdown-item @click="remove(auction.id)">Delete</b-dropdown-item>
              </b-dropdown>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
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
