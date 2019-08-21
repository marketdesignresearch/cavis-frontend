<template>
  <div>
    <div class="container">
      <h1>Setup an Auction</h1>

      <hr />

      <div class="row">
        <div class="col">
          <AuctionSetup @createAuction="createAuction" :modelValue="modelValue" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import AuctionSetup from '@/components/auction/Setup.vue'
import auction, {
  ApiAuctionType,
  ApiAuction,
  ApiBid,
  ApiAuctionCreateDTO,
  ApiDomainType,
  ApiBidderStrategy
} from '../store/modules/auction'

export default Vue.extend({
  name: 'AuctionSetupView',
  components: {
    AuctionSetup: () => import('@/components/auction/setup/AuctionDefaultConfiguration.vue')
  },
  computed: {
    modelValue(): any {
      const value = this.historicDomains.find((obj: any) => obj.id === this.$route.query.domain)
      return value ? value.value : {}
    }
  },
  methods: {
    async createAuction(model: any) {
      // mock creation using store
      const auctionObj: ApiAuctionCreateDTO = {
        domain: {
          type: model.domainType,
          bidders: [],
          goods: []
        },
        auctionType: model.auctionType,
        maxBids: model.maxBids,
        demandQueryTimeLimit: model.demandQueryTimeLimit
      }

      if (model.auctionType === ApiAuctionType.CCA) {
        auctionObj.ccaConfig = model.ccaConfig
      }

      if (model.auctionType === ApiAuctionType.PVM) {
        auctionObj.pvmConfig = model.pvmConfig
      }

      for (let i = 0; i < model.numberOfBidders; i++) {
        auctionObj.domain.bidders.push({
          name: `${i + 1}`,
          defaultStrategy: model.defaultStrategy,
          min: model.bidder.min,
          max: model.bidder.max
        })
      }

      const alphabet = [
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
        'L',
        'M',
        'N',
        'O',
        'P',
        'Q',
        'R',
        'S',
        'T',
        'U',
        'V',
        'W',
        'X',
        'Y',
        'Z'
      ]

      for (let i = 0; i < model.numberOfGoods; i++) {
        auctionObj.domain.goods.push({ name: alphabet[i], quantity: 1, dummyGood: false, isSelected: false })
      }

      const { id } = await auction.dispatchCreateAuction({ auctionCreateDTO: auctionObj })
      this.$router.push({ name: 'auction', params: { id: id } })
    }
  },
  data() {
    return {
      historicDomains: [
        {
          id: 'custom',
          value: {},
          title: 'Custom',
          description: 'Build a custom auction instance, selecting your domain, mechanism and advanced parameters.'
        },
        {
          id: 'new-zealand-1990',
          value: {
            numberOfBidders: 6,
            numberOfGoods: 5,
            domainType: 'unitDemandValue',
            auctionType: ApiAuctionType.SIMULTANEOUS_SECOND_PRICE,
            defaultStrategy: ApiBidderStrategy.TRUTHFUL,
            bidder: {
              min: 0,
              max: 100000
            }
          },
          title: 'New Zealand (1990)',
          description: ''
        },
        {
          id: 'swiss-march-2000',
          value: {
            numberOfBidders: 6,
            numberOfGoods: 2,
            domainType: 'unitDemandValue',
            auctionType: ApiAuctionType.SEQUENTIAL_SECOND_PRICE,
            defaultStrategy: ApiBidderStrategy.TRUTHFUL,
            bidder: {
              min: 100000,
              max: 1000000
            }
          },
          title: 'Swiss Wireless-Local-Loop Auction (March 2000)'
        },
        {
          id: 'swiss-december-2000',
          value: {
            numberOfBidders: 4,
            numberOfGoods: 4,
            domainType: 'unitDemandValue',
            auctionType: ApiAuctionType.SIMULTANEOUS_SECOND_PRICE,
            defaultStrategy: ApiBidderStrategy.TRUTHFUL,
            bidder: {
              min: 100000,
              max: 1000000
            }
          },
          title: 'Swiss UMTS Auction (December 2000)'
        }
      ]
    }
  }
})
</script>

<style scoped lang="scss">
@import '../custom.scss';

.content {
  display: flex;
  min-height: 80vh;
  flex-direction: column;
}

.card:hover {
  @extend .shadow;
}
</style>
