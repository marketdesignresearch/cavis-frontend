<template>
  <div>
    <div class="container">
      <h2>Set up an Auction</h2>
      <p>
        This is the configuration screen for an auction. If you have selected a historic auction example, the form is pre-filled to match
        the setting of this auction. You can configure various aspects of an auction. To get more information on the individual options,
        hover over the icon next to its label. Clicking on it will bring you to the corresponding paragraph in the documentation.
      </p>
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
  mounted() {
    //if (!this.$cookies.isKey('setupIntro')) {
    //  // show introjs
    //  setTimeout(
    //    () =>
    //      this.$intro()
    //        .setOptions({ showStepNumbers: false, skipLabel: 'End' })
    //        .start(),
    //    1000
    //  )
    //
    //  this.$cookies.set('setupIntro', true)
    //}
  },
  computed: {
    modelValue(): any {
      // check if a domain is supplied, if yes apply
      if (this.$route.query.domain) {
        const value = this.historicDomains.find((obj: any) => obj.id === this.$route.query.domain)

        if (value) {
          return value.value
        }
      }

      // if a config has been supplied, apply it
      if (typeof this.$route.query.auctionConfig === 'string') {
        return JSON.parse(this.$route.query.auctionConfig)
      }

      return {}
    }
  },
  methods: {
    async createAuction(model: any) {
      // mock creation using store
      const auctionObj: ApiAuctionCreateDTO = {
        domain: {
          type: model.domainConfig.type,
          bidders: [],
          goods: []
        },
        auctionType: model.auctionType,
        name: model.name,
        tags: model.tags,
        private: model.private,
        seed: model.seed,
        auctionConfig: {
          maxBids: model.maxBids,
          manualBids: model.manualBids,
          demandQueryTimeLimit: model.demandQueryTimeLimit
        }
      }

      if (model.auctionType === ApiAuctionType.CCA) {
        auctionObj.auctionConfig.ccaConfig = model.ccaConfig
      }

      if (model.auctionType === ApiAuctionType.PVM) {
        auctionObj.auctionConfig.pvmConfig = model.pvmConfig
      }

      switch (model.domainConfig.type) {
        case 'llg':
          auctionObj.domain.interestingCase = model.domainConfig.interestingCase
          auctionObj.domain.maxLocalValue = model.domainConfig.maxLocalValue
          break
        case 'gsvm':
          auctionObj.domain.numberOfNationalBidders = model.domainConfig.numberOfNationalBidders
          auctionObj.domain.numberOfRegionalBidders = model.domainConfig.numberOfRegionalBidders
          break
        case 'lsvm':
          auctionObj.domain.numberOfNationalBidders = model.domainConfig.numberOfNationalBidders
          auctionObj.domain.numberOfRegionalBidders = model.domainConfig.numberOfRegionalBidders
          break
        case 'synergy':
          auctionObj.domain.synergy = model.domainConfig.synergy
        default:
          for (let i = 0; i < model.numberOfBidders; i++) {
            auctionObj.domain.bidders.push({
              name: `${i + 1}`,
              defaultStrategy: model.defaultStrategy,
              min: model.domainConfig.minBidder,
              max: model.domainConfig.maxBidder
            })
          }
          break
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
            domainConfig: {
              type: 'unitDemandValue',
              minBidder: 100000,
              maxBidder: 1000000
            },
            auctionType: ApiAuctionType.SIMULTANEOUS_SECOND_PRICE,
            defaultStrategy: ApiBidderStrategy.TRUTHFUL
          },
          title: 'New Zealand (1990)',
          description: ''
        },
        {
          id: 'swiss-march-2000',
          value: {
            numberOfBidders: 5,
            numberOfGoods: 2,
            domainConfig: {
              type: 'unitDemandValue',
              minBidder: 100000,
              maxBidder: 1000000
            },
            auctionType: ApiAuctionType.SEQUENTIAL_SECOND_PRICE,
            defaultStrategy: ApiBidderStrategy.TRUTHFUL
          },
          title: 'Swiss Wireless-Local-Loop Auction (March 2000)'
        },
        {
          id: 'swiss-december-2000',
          value: {
            numberOfBidders: 4,
            numberOfGoods: 4,
            domainConfig: {
              type: 'unitDemandValue',
              minBidder: 100000,
              maxBidder: 1000000
            },
            auctionType: ApiAuctionType.SIMULTANEOUS_SECOND_PRICE,
            defaultStrategy: ApiBidderStrategy.TRUTHFUL
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
