<template>
  <div class="grow">
    <div class="bg-white">
      <div class="container">
        <Auctioneer v-if="activeAuction" :auction="activeAuction" />
      </div>
    </div>

    <div class="grow auction-view">
      <div class="container">
        <div class="row">
          <div class="col">
            <div class="d-flex pt-4">
              <div>
                <span v-for="bidderId in leftSideBidders" :key="bidderId" @click="selectBidder(bidderId)">
                  <AuctionBidder class="align-self-start" :auctionId="auctionId" :bidderId="bidderId" />
                </span>
              </div>

              <div class="flex-row text-center flex-grow-1 mx-2">
                <div class="goods-container" :class="{ selected: selectedBidder }">
                  <span v-for="goodId in goods" :key="goodId" @click="selectGood(goodId)">
                    <AuctionGood class="align-self-center d-inline-flex" :goodId="goodId" :auctionId="auctionId" />
                  </span>

                  <div class="mt-4" v-if="selectedGoods.length > 0 && selectedBidder">
                    Value of <good-badge :ids="selectedGoods" /> for {{ selectedBidder.name }}:
                    <h2 class="mt-4">
                      {{ valueForGoods | formatNumber }}
                    </h2>
                  </div>
                </div>
              </div>

              <div>
                <span v-for="bidderId in rightSideBidders" :key="bidderId" @click="selectBidder(bidderId)">
                  <AuctionBidder class="align-self-start" :auctionId="auctionId" :bidderId="bidderId" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white">
      <div class="container bottom-container">
        <div class="text-center" v-if="!selectedBidder">
          <h4 class="text-muted">select bidder to view details</h4>
        </div>
        <BidderControl :auctionId="auctionId" />
      </div>
    </div>

    <!--
      <div class="auction-control mb-4">
        Rounds:
        <nav v-if="rounds" class="d-inline-flex">
          <ul class="pagination pagination-sm">
            <li class="page-item" v-for="round in rounds" :key="round" :class="{ 'active': round == rounds.length - 1 }">
              <a class="page-link" href="#" @click="resetRound(round)" v-if="round < rounds.length - 1"> {{ round }}</a>
              <span class="page-link active" v-if="round >= rounds.length - 1"> {{ round }}</span>
            </li>
          </ul>
        </nav>

        <div class="float-right text-right">
          <button class="btn btn-primary mx-2" @click="autoBid">Autobid</button>
          <button class="btn btn-primary mx-2" @click="placeBids">Place Bids & End Round</button>
          <button class="btn btn-success" @click="allocate">Result</button>
        </div>
      </div>
      -->
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { AuctionGoodComponent, IAuctionGood } from '@/components/auction/Good.vue'
import AuctionBidder from '@/components/auction/Bidder.vue'
import AuctionSetup from '@/components/auction/Setup.vue'
import AuctionProgress from '@/components/auction/Progress.vue'
import Auctioneer from '@/components/auction/Auctioneer.vue'
import BidderControl from '@/components/auction/BidderControl.vue'
import auction, { ApiAuctionType, ApiGood, ApiAuction, ApiBidder, ApiBid } from '../store/modules/auction'
import GoodBadgeComponent from '@/components/auction/GoodBadge.vue'
import selection, { SelectionState } from '../store/modules/selection'
import { mapGetters, mapState } from 'vuex'

export default Vue.extend({
  components: {
    AuctionGood: AuctionGoodComponent,
    AuctionBidder: AuctionBidder,
    AuctionSetup: AuctionSetup,
    AuctionProgress: AuctionProgress,
    Auctioneer: Auctioneer,
    BidderControl: BidderControl,
    'good-badge': GoodBadgeComponent
  },
  data() {
    return {
      bidsPlaced: false
    }
  },
  async mounted() {
    await auction.dispatchGetAuction({ auctionId: this.$route.params.id })
    auction.dispatchPropose({ auctionId: this.$route.params.id, bidderIds: auction.biddersById()(this.$route.params.id) })
  },
  methods: {
    selectGood(goodId: string) {
      selection.commitSelectGood({ goodId: goodId })
    },
    selectBidder(bidderId: string) {
      selection.commitSelectBidder({ bidderId: bidderId })
    },
    placeBids() {
      auction.dispatchPlaceBids({ auctionId: this.$route.params.id })
      this.$data.bidsPlaced = true
    },
    autoBid() {
      const bidders = auction
        .biddersById()(this.$route.params.id)
        .map(bidderId => auction.bidderById()(bidderId))

      bidders.forEach(bidder => {
        if (bidder.value && bidder.id) {
          let bundle: any = {}
          bidder.value.bundleValues[0].bundle.forEach(bid => {
            bundle[bid.good] = bid.amount
          })
          auction.commitUpdateBidder({
            bidderId: bidder.id!,
            bid: {
              amount: bidder.value.bundleValues[0].amount,
              bidderId: bidder.id,
              bundle: bundle
            }
          })
        }
      })
    },
    allocate() {
      this.$router.push({ name: 'auction-result', params: { id: this.$route.params.id } })
    }
  },
  computed: {
    ...mapGetters('selection', ['selectedGoods']),
    ...mapState('selection', {
      selectedBidder(state: SelectionState) {
        if (state.selectedBidder) {
          return auction.bidderById()(state.selectedBidder)
        }
        return null
      }
    }),
    valueForGoods(): number {
      const selectedBidder = selection.selectedBidder()

      if (selectedBidder) {
        const value = auction.valueForBundle()(this.$route.params.id, selectedBidder, selection.selectedGoods())

        if (value) {
          return value.amount
        }

        auction.dispatchValueQuery({
          auctionId: this.$route.params.id,
          bidderIds: [selectedBidder],
          goodIds: selection.selectedGoods()
        })
      }

      return 0
    },
    rounds(): number[] {
      return Array.from({ length: auction.auctionById()(this.$route.params.id).auction.rounds.length + 1 }, (v, k) => k)
    },
    leftSideBidders() {
      const bidders = auction.biddersById()(this.$route.params.id)
      const isEven = bidders.length % 2 === 0
      return bidders.slice(0, isEven ? bidders.length / 2 : bidders.length / 2 + 1)
    },
    rightSideBidders() {
      const bidders = auction.biddersById()(this.$route.params.id)
      const isEven = bidders.length % 2 === 0
      return bidders.slice(isEven ? bidders.length / 2 : bidders.length / 2 + 1, bidders.length)
    },
    goods() {
      const goods = auction.goodsById()(this.$route.params.id)
      return goods
    },
    bidders() {
      const bidders = auction.biddersById()(this.$route.params.id)
      return bidders
    },
    activeAuction(): ApiAuction {
      return auction.auctionById()(this.$route.params.id)
    },
    auctionId(): string {
      return this.$route.params.id
    }
  }
})
</script>

<style scoped lang="scss">
.bottom-container {
  padding-top: 20px;
  padding-bottom: 15px;
  min-height: 10vh;
}

.goods-container {
  display: inline-block;
  padding: 15px;
  border-radius: 10px;

  &.selected {
    background-color: white;
  }
}

.auction-view {
  min-height: 60vh;
}

.grow {
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
}
</style>
