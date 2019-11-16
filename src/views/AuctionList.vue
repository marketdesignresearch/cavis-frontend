<template>
  <div class="container">
    <h2>
      Auctions
      <router-link
        tag="button"
        class="btn btn-secondary btn-sm float-right"
        :to="{ name: 'auction-archive' }"
        v-intro="
          'This will bring you to the non-active, archived auctions. Note that currently, auctions in a SATS domain are not stored, thus not recoverable once you\'re archiving them!'
        "
      >
        Archive <font-awesome-icon icon="archive" />
      </router-link>
      <button
        class="btn btn-primary btn-sm float-right mr-1"
        :disabled="selectedAuctions.length < 2"
        @click="compare(selectedAuctions)"
        v-intro="
          'After selecting at least two comparable auctions (with the same domain settings incl. the seed), you can click here to compare the results of these auctions.'
        "
      >
        {{ selectedAuctions.length < 2 ? 'Select auctions to compare' : `Compare ${selectedAuctions.length} auctions` }}
      </button>
    </h2>
    <hr />

    <div class="table-responsive" v-intro="'Here you have an overview over the currently active auctions.'">
      <table class="table table-bordered table-striped table-bidder">
        <thead>
          <tr>
            <th scope="col" @click="sortBy('number')" class="parentHover">
              # <sort-marker :sortable="sort" :property="'number'"></sort-marker>
            </th>
            <th scope="col" @click="sortBy('private')" class="parentHover" v-if="oidcIsAuthenticated">
              Private <sort-marker :sortable="sort" :property="'private'"></sort-marker>
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
            <th scope="col"># Goods and Bidders</th>
            <th scope="col"># Played Rounds</th>
            <th scope="col">Tags</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(auction, index) in sortedAuctions" :key="auction.id">
            <td>
              <b-form-checkbox v-model="selectedAuctions" :key="auction.id" :value="auction.id" />
            </td>
            <td v-if="oidcIsAuthenticated">
              <b-form-checkbox v-model="auction.private" @change="togglePrivate(auction)" />
            </td>
            <td>
              <click-to-edit
                :value="auction.name"
                @input="updateAuctionName($event, auction.id)"
                v-intro="'You can change the name of an auction directly by clicking on it'"
                v-intro-if="index === 0"
              />
            </td>
            <td>{{ auction.createdAt | formatDate }}</td>
            <td>{{ auction.auctionType }}</td>
            <td>{{ auction.domain }}</td>
            <td>{{ auction.seed }}</td>
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
                v-intro="'You can also add custom tags to an auction to distinguish them.'"
                v-intro-if="index === 0"
              />
            </td>
            <td class="text-right">
              <b-dropdown
                right
                size="sm"
                variant="primary"
                split
                text="Load"
                class="m-2"
                :split-to="{ name: 'auction', params: { id: auction.id } }"
                v-intro="
                  'To load the auction, you can simply click on the button. Clicking on the arrow gives you the option to archive or duplicate an auction.<br><br>\
              Archiving will remove the auction from the server. If it\'s not a SATS-domain auction, you can later recover it from the archive.<br><br>\
              Duplicating will take you to the setup screen with pre-filled settings to start an auction in the exact same domain.'
                "
                v-intro-if="index === 0"
              >
                <b-dropdown-item @click="archive(auction.id)">Archive</b-dropdown-item>
                <b-dropdown-item @click="recreate(auction.id)">Duplicate</b-dropdown-item>
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
import { configToModelJSON } from '@/services/auctionModel'
import { mapGetters } from 'vuex'

export default Vue.extend({
  name: 'AuctionListView',
  components: {
    'click-to-edit': () => import('@/components/utils/click-to-edit.vue'),
    'sort-marker': () => import('@/components/utils/sort-marker.vue')
  },
  data: () => {
    return {
      auctions: [] as ApiAuction[],
      tagOptions: [],
      selectedAuctions: [] as string[],
      sort: {
        sortBy: 'createdAt',
        sortASC: false
      }
    }
  },
  computed: {
    ...mapGetters(['oidcIsAuthenticated']),
    allTags() {
      return [].concat.apply([], this.$data.auctions.map((auction: ApiAuction) => auction.tags)).filter((item, index, array) => {
        return array.indexOf(item) === index
      })
    },
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
    togglePrivate(auction: ApiAuction) {
      auction.private = !auction.private
      api.patch(`/auctions/${auction.id}`, { private: auction.private })
    },
    sortBy(property: string) {
      this.sort.sortASC = !this.sort.sortASC
      this.sort.sortBy = property
    },
    async recreate(auctionId: string) {
      const { data: auction } = await api.get(`/auctions/${auctionId}`)
      this.$router.push({ name: 'auction-customize', query: { auctionConfig: configToModelJSON(auction) } })
    },
    async compare(selectedAuctions: string[]) {
      const comparedAuctions = this.auctions.filter(auction => selectedAuctions.indexOf(auction.id!) !== -1)
      const baseSeed = comparedAuctions[0].seed

      let seedsMatch = true

      comparedAuctions.forEach(auction => {
        if (auction.seed !== baseSeed) {
          seedsMatch = false
        }
      })

      if (!seedsMatch) {
        this.$bvModal.msgBoxOk(
          'Your selected auctions have non-matching seeds, therefore non-matching bidders. You cannot compare these.',
          {
            title: 'Warning'
          }
        )
      } else {
        this.$router.push({ name: 'auction-result', query: { auctions: selectedAuctions } })
      }
    },
    archive(auctionId: string) {
      auction.dispatchArchiveAuction({ auctionId: auctionId })
      this.$data.auctions.splice(this.$data.auctions.findIndex((auction: ApiAuction) => auction.id === auctionId), 1)
    },
    updateAuctionName(newName: string, id: string) {
      api.patch(`/auctions/${id}`, { name: newName })
    },
    addTag(newTag: string, id: string) {
      const auction = this.$data.auctions.find((auction: ApiAuction) => auction.id === id)

      if (auction) {
        auction.tags.push(newTag)
        api.patch(`/auctions/${id}`, { tags: auction.tags })
      }
    },
    removeTag(removedTag: string, id: string) {
      const auction = this.$data.auctions.find((auction: ApiAuction) => auction.id === id)

      if (auction) {
        auction.tags.splice(auction.tags.indexOf(removedTag))
        api.patch(`/auctions/${id}`, { tags: auction.tags })
      }
    }
  },
  async mounted() {
    const { data } = await api.get('/auctions/')
    this.$data.auctions = data
    // if (!this.$cookies.isKey('auctionListIntro')) {
    //   setTimeout(
    //     () =>
    //       this.$intro()
    //         .setOptions({ showStepNumbers: false, skipLabel: 'End' })
    //         .start(),
    //     1000
    //   )
    //   this.$cookies.set('auctionListIntro', true)
    // }
  }
})
</script>

<style lang="scss">
@import '../custom.scss';

.inline-multiselect {
  .multiselect__tags {
    border: none;
    background: transparent;
  }

  .multiselect__tag-icon:focus,
  .multiselect__tag-icon:hover {
    background: darken(theme-color('primary'), 10%);
  }

  .multiselect__tag {
    background: theme-color('primary');
  }

  .multiselect__option--highlight {
    background: theme-color('primary');

    &::after {
      background: theme-color('primary');
    }
  }

  input {
    background: transparent;
  }
}
</style>
