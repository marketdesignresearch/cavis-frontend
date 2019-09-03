<template>
  <div class="container">
    <h1>Archived Auctions</h1>
    <hr />

    <div class="table-responsive">
      <table class="table table-bordered table-striped">
        <thead>
          <tr>
            <th scope="col"></th>
            <th scope="col">Name</th>
            <th scope="col">Date</th>
            <th scope="col">Auction Type</th>
            <th scope="col">Domain</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(auction, index) in auctions" :key="auction.id">
            <td>{{ index + 1 }}</td>
            <td>{{ auction.name || '-' }}</td>
            <td>{{ auction.createdAt | formatDate }}</td>
            <td>{{ auction.auctionType }}</td>
            <td>{{ auction.domain }}</td>
            <td
              class="text-right"
              v-intro="'To load the auction, you can simply click on the button. To delete the auction, press on the small arrow.'"
              v-intro-step="3"
              v-intro-if="index === 0"
            >
              <b-dropdown
                right
                variant="primary"
                split
                text="Load & Restore"
                class="m-2"
                :split-to="{ name: 'auction', params: { id: auction.uuid } }"
              >
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
import api from '../services/api'

export default Vue.extend({
  name: 'AuctionArchiveView',
  data: () => {
    return {
      auctions: []
    }
  },
  methods: {
    async fetchAuctions() {
      const { data } = await api().get(`/auctions/archived`)
      this.auctions = data
    },
    async remove(auctionId: string) {
      auction.dispatchRemoveAuction({ auctionId: auctionId })
    }
  },
  mounted() {
    this.fetchAuctions()
  }
})
</script>

<style scoped lang="scss"></style>
