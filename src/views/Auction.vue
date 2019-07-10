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
    const bundleValues = await auction.dispatchPropose({
      auctionId: this.$route.params.id,
      bidderIds: auction.biddersById()(this.$route.params.id)
    })

    bundleValues.forEach(bundleValue => {
      const apiBid: ApiBid = {
        amount: bundleValue.amount!,
        bidderId: bundleValue.bidderId!,
        bundle: bundleValue.bundle
      }
      auction.commitUpdateBidder({ bidderId: bundleValue.bidderId!, bid: apiBid })
    })
  },
  methods: {
    selectGood(goodId: string) {
      selection.commitSelectGood({ goodId: goodId })
    },
    selectBidder(bidderId: string) {
      selection.commitSelectBidder({ bidderId: bidderId })
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
          return value.value
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
