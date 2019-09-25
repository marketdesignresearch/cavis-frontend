<template>
  <div class="container">
    <h2>Archived Auctions</h2>
    <hr />

    <div class="table-responsive">
      <table class="table table-bordered table-striped table-bidder">
        <thead>
          <tr>
            <th scope="col" @click="sortBy('number')" class="parentHover">
              # <sort-marker :sortable="sort" :property="'number'"></sort-marker>
            </th>
            <th scope="col" @click="sortBy('name')" class="parentHover">
              Name <sort-marker :sortable="sort" :property="'name'"></sort-marker>
            </th>
            <th scope="col" @click="sortBy('createdAt')" class="parentHover">
              Date <sort-marker :sortable="sort" :property="'createdAt'"></sort-marker>
            </th>
            <th scope="col" @click="sortBy('auctionType')" class="parentHover">
              Auction Type <sort-marker :sortable="sort" :property="'auctionType'"></sort-marker>
            </th>
            <th scope="col" @click="sortBy('domain')" class="parentHover">
              Domain <sort-marker :sortable="sort" :property="'domain'"></sort-marker>
            </th>
            <th scope="col" @click="sortBy('seed')" class="parentHover">
              Seed <sort-marker :sortable="sort" :property="'seed'"></sort-marker>
            </th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(auction, index) in sortedAuctions" :key="auction.id">
            <td>
              {{ auction.number }}
            </td>
            <td>{{ auction.name || '-' }}</td>
            <td>{{ auction.createdAt | formatDate }}</td>
            <td>{{ auction.auctionType }}</td>
            <td>{{ auction.domain }}</td>
            <td>{{ auction.seed }}</td>
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
                size="sm"
                text="Load & Restore"
                class="m-2"
                :split-to="{ name: 'auction', params: { id: auction.id } }"
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
import auction, { ApiAuction } from '../store/modules/auction'
import api from '../services/api'

export default Vue.extend({
  name: 'AuctionArchiveView',
  data: () => {
    return {
      auctions: [],
      sort: {
        sortBy: 'createdAt',
        sortASC: false
      }
    }
  },
  components: {
    'sort-marker': () => import('@/components/utils/sort-marker.vue')
  },
  computed: {
    sortedAuctions() {
      const sortedArray = this.$data.auctions
        .map((auction: any, index: number) => {
          auction.number = index
          return auction
        })
        .sort((a: ApiAuction, b: ApiAuction) => {
          if (!this.sort.sortASC) {
            return (a as any)[this.sort.sortBy] >= (b as any)[this.sort.sortBy] ? -1 : 1
          }
          return (a as any)[this.sort.sortBy] < (b as any)[this.sort.sortBy] ? -1 : 1
        })

      return sortedArray
    }
  },
  methods: {
    async fetchAuctions(): Promise<void> {
      const { data } = await api.get(`/auctions/archived`)
      this.auctions = data
    },
    async remove(auctionId: string): Promise<void> {
      auction.dispatchRemoveAuction({ auctionId: auctionId })
    },
    sortBy(property: string) {
      this.sort.sortASC = !this.sort.sortASC
      this.sort.sortBy = property
    }
  },
  mounted() {
    ;(this as any).fetchAuctions()
  }
})
</script>

<style scoped lang="scss"></style>
