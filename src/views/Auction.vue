<template>
  <div
    class="grow"
    v-intro="
      'Great! You have entered the auction room. Imagine this view as the room with a big table, where the auctioneer sits on top and the bidders sit around this table. The goods to be auctioned off are placed on the table.'
    "
  >
    <div class="container">
      <Auctioneer v-if="activeAuction" :auction="activeAuction" />
    </div>

    <div class="auction-view">
      <div class="container">
        <div class="row">
          <div class="col">
            <div class="d-flex pt-4">
              <div v-intro="'This, together with the right-hand side, visualizes the bidders that take part in the auction.'">
                <span v-for="(bidderId, index) in leftSideBidders" :key="bidderId" @click="selectBidder(bidderId)">
                  <AuctionBidder
                    class="align-self-start"
                    :auctionId="auctionId"
                    :bidderId="bidderId"
                    v-intro="
                      'You can hover over the bidder to get more information, and click to interact (e.g., to bid for goods). Each round, it is calculated what the best bids would be given the bidder\'s strategy. Once this calculation has completed, a green circle appears around the bidder.'
                    "
                    v-intro-if="index === 0"
                  />
                </span>
              </div>

              <div class="flex-row text-center flex-grow-1 mx-2">
                <div
                  class="goods-container justify-content-center"
                  :class="{ selected: selectedBidder }"
                  v-intro="'This represents the table on which the goods are placed that are auctioned off.'"
                >
                  <div class="goods-title">
                    <span>Goods</span>
                  </div>

                  <pvm-inferred-values
                    class="pvm-box"
                    v-intro="
                      'In PVM, you can see additional information about the selection, namely what value a bidder reported for the selected bundle and what the auctioneer\'s learning algorithm would infer as the selected bidder\'s value for the selected bundle.'
                    "
                    v-if="isPVM && auctioneerVisible"
                    :auctionId="auctionId"
                  />

                  <span v-for="(goodId, index) in goods" :key="goodId" @click="selectGood(goodId)">
                    <AuctionGood
                      v-intro="
                        'Each good is selectable. This is a central part of the user\'s interaction with the tool: Much of the other interactions depend on the bundle that is selected on the table.<br><br>\
                        For example, when also selecting a bidder, you will see this bidder\'s valuation for the selected bundle, and will be able to enter a bid for it. Inside an unselected good, you will in this case also see \
                        the marginal value of this bidder for adding this good to the selection.<br>\
                        For complex value functions of a bidder, this kind of interaction is a convenient way to explore a bidder\'s value function.'
                      "
                      v-intro-if="index === 0"
                      class="align-self-center d-inline-flex"
                      :goodId="goodId"
                      :auctionId="auctionId"
                    />
                  </span>

                  <b-modal id="modal-price-development" title="Price Development">
                    <price-development-chart :rounds="apiRounds" :goodIds="selectedGoods" />
                  </b-modal>
                  <b-modal id="modal-over-demand" title="Over-Demand">
                    <over-demand-chart :rounds="apiRounds" :goodIds="selectedGoods" />
                  </b-modal>

                  <div class="pb-3 mt-4">
                    <span v-if="selectedGoods.length > 0">
                      <button class="btn btn-outline-secondary btn-sm mx-1" @click="deselect">Deselect All</button>
                      <button
                        v-if="isCCA"
                        class="btn btn-outline-success btn-sm mx-1"
                        v-b-modal.modal-price-development
                        v-intro="'This brings you to the publicly available information about past prices of the selected goods.'"
                      >
                        Price Development
                      </button>
                      <button
                        v-if="isCCA"
                        class="btn btn-outline-success btn-sm mx-1"
                        v-b-modal.modal-over-demand
                        v-intro="'Similarly, here you find the public information about past over-demand of the selected goods.'"
                      >
                        Over-Demand History
                      </button>
                    </span>
                  </div>

                  <div
                    class="goods-bidder"
                    v-if="selectedBidder"
                    v-intro="
                      'Here, you see the selected bidder\'s value for the selected bundle. It is also where you can enter/change a bid for the selected bundle.'
                    "
                  >
                    <div class="row">
                      <div class="col d-flex align-items-center">
                        <bidder-circle :bidder="selectedBidder" class="float-right selected" />
                      </div>

                      <div class="col d-flex flex-column justify-content-center">
                        <div class="small"><b>Selected Bundle:</b></div>
                        <good-badge :ids="selectedGoods" />
                      </div>

                      <div class="col d-flex flex-column justify-content-center">
                        <div class="small"><b>Value:</b></div>
                        {{ valueForGoods | formatNumber }}
                      </div>
                    </div>
                    <div class="row justify-content-center">
                      <div class="col-8 d-flex justify-content-center pt-2">
                        <component :is="'component-bid-' + auctionType" :auctionId="auctionId" />
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

    <div class="grow bg-light auction-status-padding">
      <div
        class="container bottom-container"
        v-intro="
          'This area becomes particularly interesting when a bidder is selected (if you do not have a bidder selected currently, we suggest to restart the tutorial later with a bidder selected to get more information about this part of the tool).'
        "
      >
        <div class="text-center" v-if="!selectedBidder">
          <h4 class="text-muted">select bidder to view details</h4>
        </div>
        <BidderControl :auctionId="auctionId" />
      </div>
    </div>

    <AuctionStatusBar :auctionId="auctionId" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { IAuctionGood } from '@/components/auction/Good.vue'
import GoodsService from '@/services/goods'
import auction, {
  ApiAuctionType,
  ApiGood,
  ApiAuction,
  ApiBidder,
  ApiBid,
  ApiBundleEntry,
  ApiBundleValue,
  ApiBundleEntryWrapper,
  ApiRound
} from '../store/modules/auction'
import GoodBadgeComponent from '@/components/auction/GoodBadge.vue'
import selection, { SelectionState } from '../store/modules/selection'
import { mapGetters, mapState } from 'vuex'
import BigNumber from 'bignumber.js'

export default Vue.extend({
  components: {
    AuctionGood: () => import('@/components/auction/Good.vue'),
    AuctionBidder: () => import('@/components/auction/Bidder.vue'),
    AuctionSetup: () => import('@/components/auction/Setup.vue'),
    Auctioneer: () => import('@/components/auction/Auctioneer.vue'),
    BidderControl: () => import('@/components/auction/BidderControl.vue'),
    AuctionStatusBar: () => import('@/components/auction/AuctionStatusBar.vue'),
    'good-badge': () => import('@/components/auction/GoodBadge.vue'),
    'bidder-circle': () => import('@/components/auction/BidderCircle.vue'),
    'price-development-chart': () => import('@/components/auction/charts/PriceDevelopmentChart.vue'),
    'over-demand-chart': () => import('@/components/auction/charts/OverDemandChart.vue'),
    'pvm-inferred-values': () => import('@/components/auction/bids/PVMInferredValues.vue')
  },
  data() {
    return {
      bidsPlaced: false
    }
  },
  async beforeMount() {
    // unselect everything
    selection.commitUnselectAll()
  },
  async mounted() {
    await auction.dispatchGetAuction({ auctionId: this.$route.params.id })
    const bids: ApiBid[] = await auction.dispatchPropose({
      auctionId: this.$route.params.id,
      bidderIds: auction.biddersById()(this.$route.params.id)
    })

    bids.forEach(bid => {
      auction.commitUpdateBidder({ bidderId: bid.bidderId!, bid: bid })
    })
    if (!this.$cookies.isKey('auctionIntro')) {
      // show introjs
      this.$intro()
        .setOptions({ showStepNumbers: false, skipLabel: 'End' })
        .start()
      this.$cookies.set('auctionIntro', true)
    }
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
    ...mapGetters('gui', ['auctioneerVisible']),
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
    bidForGoods(): BigNumber | null {
      return GoodsService.bidForGood(selection.selectedBundle()!, selection.selectedBidder()!)
    },
    rounds(): number[] {
      return Array.from({ length: auction.auctionById()(this.$route.params.id).auction.rounds.length + 1 }, (v, k) => k)
    },
    apiRounds(): ApiRound[] {
      const currentAuction = auction.auctionById()(this.$route.params.id)
      return currentAuction ? currentAuction.auction.rounds : []
    },
    isCCA(): boolean {
      const currentAuction = auction.auctionById()(this.$route.params.id)
      return currentAuction ? currentAuction.auctionType.startsWith('CCA') : false
    },
    isPVM(): boolean {
      const currentAuction = auction.auctionById()(this.$route.params.id)
      return currentAuction ? currentAuction.auctionType.startsWith('PVM') : false
    },
    auctionType(): string {
      const currentAuction = auction.auctionById()(this.$route.params.id)
      return currentAuction.auctionType
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

.auction-status-padding {
  padding-bottom: 140px;
}

.bottom-container {
  padding-top: 20px;
  padding-bottom: 15px;
}

.pvm-box {
  position: relative;
  top: -15px;
  right: 0px;
}

.goods-container {
  display: inline-block;
  min-width: 800px;

  .goods-title {
    position: relative;
    text-align: center;
    top: -15px;

    span {
      font-weight: bolder;
      background: $light;
      border-radius: 10px;
      padding: 5px;
    }
  }

  .goods-bidder {
    display: inline-block;
    width: 66.66%;

    position: relative;
    bottom: -70px;
    border-radius: 35px;
    background: $light;
  }

  margin: 0 50px;

  border-color: darken($light, 5%);
  border-width: 3px;
  border-style: solid;
  border-radius: 50px;
}

.auction-view {
  min-height: 40vh;
  padding-bottom: 140px;
}

.grow {
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
}
</style>
