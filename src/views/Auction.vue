<template>
  <div class="grow">
    <div class="container">
      <Auctioneer v-if="activeAuction" :auction="activeAuction" />
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
                <div class="goods-container justify-content-center" :class="{ selected: selectedBidder }">
                  <div class="goods-title"><span>Goods</span></div>

                  <span v-for="goodId in goods" :key="goodId" @click="selectGood(goodId)">
                    <AuctionGood class="align-self-center d-inline-flex" :goodId="goodId" :auctionId="auctionId" />
                  </span>

                  <div class="pb-3">
                    <button v-if="selectedGoods.length > 0" class="btn btn-outline-secondary btn-sm mt-4" @click="deselect">Deselect All</button>
                  </div>

                  <div class="goods-bidder" v-if="selectedBidder">
                    <div class="row">
                      <div class="col d-flex align-items-center">
                        <bidder-circle :name="selectedBidder.name" class="float-right selected" />
                      </div>

                      <div class="col d-flex align-items-center justify-content-start">
                        <good-badge :ids="selectedGoods" />
                      </div>

                      <div class="col d-flex align-items-center justify-content-start">
                        Value: {{ valueForGoods | formatNumber }}
                      </div>
                    </div>
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
import Auctioneer from '@/components/auction/Auctioneer.vue'
import BidderControl from '@/components/auction/BidderControl.vue'
import auction, { ApiAuctionType, ApiGood, ApiAuction, ApiBidder, ApiBid, ApiBundleEntry, ApiBundleValue, ApiBundleEntryWrapper } from '../store/modules/auction'
import GoodBadgeComponent from '@/components/auction/GoodBadge.vue'
import selection, { SelectionState } from '../store/modules/selection'
import { mapGetters, mapState } from 'vuex'
import BidderCircleVue from '@/components/auction/BidderCircle.vue'

export default Vue.extend({
  components: {
    AuctionGood: AuctionGoodComponent,
    AuctionBidder: AuctionBidder,
    AuctionSetup: AuctionSetup,
    Auctioneer: Auctioneer,
    BidderControl: BidderControl,
    'good-badge': GoodBadgeComponent,
    'bidder-circle': BidderCircleVue
  },
  data() {
    return {
      bidsPlaced: false
    }
  },
  async mounted() {
    // unselect everything
    selection.commitUnselectAll()

    await auction.dispatchGetAuction({ auctionId: this.$route.params.id })
    const bids: ApiBid[] = await auction.dispatchPropose({
      auctionId: this.$route.params.id,
      bidderIds: auction.biddersById()(this.$route.params.id)
    })

    bids.forEach(bid => {
      auction.commitUpdateBidder({ bidderId: bid.bidderId!, bid: bid })
    })
  },
  methods: {
    selectGood(goodId: string) {
      selection.commitSelectGood({ goodId: goodId })
    },
    selectBidder(bidderId: string) {
      selection.commitSelectBidder({ bidderId: bidderId })
    },
    deselect() {
      selection.commitUnselectGoods()
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
        const selectedBundle = selection.selectedBundle()
        const value: ApiBundleValue | null | undefined = auction.valueForBundle()(this.$route.params.id, selectedBidder, selectedBundle)

        if (value) {
          return value.value
        }

        auction.dispatchValueQuery({
          auctionId: this.$route.params.id,
          bidderIds: [selectedBidder],
          bundles: [selectedBundle]
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
@import '../custom.scss';

.bottom-container {
  padding-top: 20px;
  padding-bottom: 15px;
  min-height: 10vh;
}

.goods-container {
  .goods-title {
    position: relative;
    text-align: center;
    top: -15px;
    
    span {
      font-weight: bolder;
      background: $body-bg;
      border-radius: 10px;
      padding: 5px;
    }
  }

  .goods-bidder {
    display: inline-block;
    width: 66.66%;

    position: relative;
    height: 70px;
    bottom: -35px;

    border-radius: 35px;

    background: white;
  }

  margin: 0 50px;

  border-color: darken($body-bg, 10%);
  border-width: 3px;
  border-style: solid;
  border-radius: 50px;

  &.selected {
    // background-color: white;
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
