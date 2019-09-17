<template>
  <div class="container">
    <h2>
      Auctions
      <router-link tag="button" class="btn btn-secondary btn-sm float-right" :to="{ name: 'auction-archive' }">
        Archive <font-awesome-icon icon="archive" />
      </router-link>
    </h2>
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
            <th scope="col"># Goods and Bidders</th>
            <th scope="col"># Played Rounds</th>
            <th scope="col">Tags</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(auction, index) in auctions" :key="auction.id">
            <td>{{ index + 1 }}</td>
            <td>
              <click-to-edit :value="auction.name" @input="updateAuctionName($event, auction.id)" />
              <br /><span class="small">Seed: {{ auction.seed }}</span>
            </td>
            <td>{{ auction.createdAt | formatDate }}</td>
            <td>{{ auction.auctionType }}</td>
            <td>{{ auction.domain }}</td>
            <td>
              Goods: {{ auction.numberOfGoods }}<br />
              Bidders: {{ auction.numberOfBidders }}
            </td>
            <td>{{ auction.roundsPlayed }}</td>
            <td>
              <multiselect
                class="inline-multiselect"
                :id="auction.id"
                :value="auction.tags"
                :taggable="true"
                :multiple="true"
                :options="allTags"
                placeholder="Click to add Tag"
                @tag="addTag"
                @select="addTag"
                @remove="removeTag"
              />
            </td>
            <td
              class="text-right"
              v-intro="'To load the auction, you can simply click on the button. To delete the auction, press on the small arrow.'"
              v-intro-step="3"
              v-intro-if="index === 0"
            >
              <b-dropdown right variant="primary" split text="Load" class="m-2" :split-to="{ name: 'auction', params: { id: auction.id } }">
                <b-dropdown-item @click="archive(auction.id)">Archive</b-dropdown-item>
                <b-dropdown-item @click="recreate(auction.id)">Re-create</b-dropdown-item>
                <b-dropdown-item @click="edit(auction.id)">Edit</b-dropdown-item>
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
import api from '@/services/api'
import ClickToEdit from '@/components/utils/click-to-edit.vue'

export default Vue.extend({
  name: 'AuctionListView',
  components: {
    'click-to-edit': ClickToEdit
  },
  data: () => {
    return {
      auctions: [],
      tagOptions: []
    }
  },
  computed: {
    allTags() {
      return [].concat.apply([], this.$data.auctions.map((auction: ApiAuction) => auction.tags)).filter((item, index, array) => {
        return array.indexOf(item) === index
      })
    }
  },
  methods: {
    async recreate(auctionId: string) {
      const { data: auction } = await api().get(`/auctions/${auctionId}`)
      console.log('not implemented yet')
    },
    archive(auctionId: string) {
      auction.dispatchArchiveAuction({ auctionId: auctionId })
    },
    updateAuctionName(newName: string, id: string) {
      api().patch(`/auctions/${id}`, { name: newName })
    },
    addTag(newTag: string, id: string) {
      const auction = this.$data.auctions.find((auction: ApiAuction) => auction.id === id)

      if (auction) {
        auction.tags.push(newTag)
        api().patch(`/auctions/${id}`, { tags: auction.tags })
      }
    },
    removeTag(removedTag: string, id: string) {
      const auction = this.$data.auctions.find((auction: ApiAuction) => auction.id === id)

      if (auction) {
        auction.tags.splice(auction.tags.indexOf(removedTag))
        api().patch(`/auctions/${id}`, { tags: auction.tags })
      }
    }
  },
  async mounted() {
    const { data } = await api().get('/auctions/')
    this.$data.auctions = data
  }
})
</script>

<style lang="scss">
.inline-multiselect {
  .multiselect__tags {
    border: none;
    background: transparent;
  }

  input {
    background: transparent;
  }
}
</style>
