<template>
  <div class="row" v-if="bidder">
      <div class="col">
          <div class="table-responsive">
            <table class="table table-hover table-striped">
                <thead>
                    <tr>
                        <th>Good</th>
                        <th>Value</th>
                        <th>Bid</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(goodSet, index) in goodCombinations" :key="'set' + index">
                        <td><span v-for="good in goodSet" :key="good.id">{{ good.id }}</span></td>
                        <td>{{ valueForGood(goodSet) }}</td>
                        <td>{{ bidForGood(goodSet) }}</td>
                        <td><button class="btn btn-sm btn-warning" @click="removeBid(goodSet)">X</button></td>
                    </tr>
                </tbody>
            </table>
          </div>
      </div>
      <div class="col">
          <button class="btn btn-primary mx-2" @click="autoBid">Autobid</button>
          {{ bidder.value.bundleValues }}
      </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import auction, { ApiAuctionType, ApiBidder, ApiBid, ApiGood } from '../../store/modules/auction'
import BidderService from '../../services/bidder'

const powerSet = function(l: any) {
    // TODO: ensure l is actually array-like, and return null if not
    return (function ps(list): any {
        if (list.length === 0) {
            return [[]];
        }
        const head = list.pop();
        const tailPS = ps(list);
        return tailPS.concat(tailPS.map((e: any) => { return [head].concat(e); }));
    })(l.slice());
}

export default Vue.extend({
  name: 'BidderControl',
  props: ['bidder', 'goods', 'auctionId'],
  computed: {
    goodCombinations () {
        if (!this.$props.auctionId) return []

        const goods = auction.goodsById()(this.$props.auctionId)
        const currentAuction = auction.auctionById()(this.$props.auctionId)

        // check if we have bundle-bids
        if (currentAuction.auction.mechanismType === ApiAuctionType.VCG_XOR) {
            return powerSet(goods).filter((goods: []) => goods.length > 0)
        }

        return goods.map(good => [good])
    }
  },
  methods: {
      valueForGood(goods: ApiGood[]) {
          if (this.$props.bidder.value.bundleValues) {
            const ids = goods.map(obj => obj.id).sort().join('')
            const correctValue =  this.$props.bidder.value.bundleValues.find((bid: ApiBid) => bid.bundle.map(val => val.good).sort().join('') === ids)
            return correctValue ? correctValue.amount : null
          }
          return null
      },
      bidForGood(goods: ApiGood[]) {
          if (this.$props.bidder.bids) {
            const ids = goods.map(obj => obj.id).sort().join('')
            const correctBid = this.$props.bidder.bids.find((bid: ApiBid) => {
                return Object.keys((bid.bundle as any)).sort().join('') === ids
            })
            return correctBid ? correctBid.amount : null
          }
          return null
      },
      autoBid() {
          BidderService.autoBid(this.$props.auctionId, this.$props.bidder)
      },
      removeBid(goodSet: ApiGood[]) {
          BidderService.removeBid(this.$props.auctionId, this.$props.bidder, goodSet)
      }
  }
});
</script>

<style scoped lang="scss">
@import '../../custom';


</style>
