<template>
  <form>
    <b-tabs content-class="mt-3" v-model="selectedTab" small>
      <b-tab v-for="schema in filteredSchemas" :key="schema.title" :title="schema.title">
        <vue-form-generator
          :schema="schema"
          :model="model"
          :options="formOptions"
          @validated="schema.validation = $event"
        ></vue-form-generator>
      </b-tab>
      <div class="text-right">
        <button class="btn btn-primary" v-if="selectedTab > 0" @click.prevent="selectedTab--">Previous</button>
        <button class="btn btn-primary ml-1" v-if="selectedTab < filteredSchemas.length - 1" @click.prevent="selectedTab++">Next</button>
        <button class="btn btn-success ml-1" v-if="selectedTab === filteredSchemas.length - 1" @click.prevent="submit">Create</button>
      </div>
    </b-tabs>
  </form>
</template>

<script lang="ts">
import Vue from 'vue'
import VueFormGenerator from 'vue-form-generator'
import { ApiBidderStrategy, ApiAuctionType, ApiAuctionPaymentRule } from '../../../store/modules/auction'

export default Vue.extend({
  components: {
    'vue-form-generator': VueFormGenerator.component
  },
  computed: {
    ApiAuctionType() {
      return ApiAuctionType
    },
    filteredSchemas(): any {
      return Object.keys(this.schemas)
        .filter(schema => this.showSchema(schema))
        .map(key => (this.schemas as any)[key])
    },
    allFormsValid(): boolean {
      return Object.keys(this.schemas)
        .map((key: any) => (this.schemas as any)[key].validation)
        .reduce((previous, current) => {
          return previous && current
        })
    }
  },
  mounted() {
    const model = Object.assign(
      {},
      ...Object.values(this.schemas).map(schema => VueFormGenerator.schema.createDefaultObject(schema, this.$props.modelValue || {}))
    )

    this.$data.model = model
  },
  methods: {
    showSchema(schemaName: string): boolean {
      if (!this.model) return false

      switch (schemaName) {
        case 'defaultDomainSchema':
          return (this.model as any).domainType.indexOf('gsvm') === -1 && (this.model as any).domainType.indexOf('lsvm') === -1
        case 'gsvmSchema':
          return (this.model as any).domainType.indexOf('gsvm') !== -1
        case 'lsvmSchema':
          return (this.model as any).domainType.indexOf('lsvm') !== -1
        case 'ccaSchema':
          return (this.model as any).auctionType === ApiAuctionType.CCA
        case 'pvmSchema':
          return (this.model as any).auctionType === ApiAuctionType.PVM
        default:
          return true
      }
    },
    submit() {
      this.$emit('createAuction', Object.assign({}, this.$data.model))
    }
  },
  props: ['modelValue'],
  name: 'AuctionSetup',
  data() {
    return {
      selectedTab: 0,
      model: null,
      schemas: {
        auctionSchema: {
          validation: false,
          title: 'Auction Configuration',
          fields: [
            {
              type: 'select',
              label: 'Auction',
              model: 'auctionType',
              default: ApiAuctionType.SINGLE_ITEM_FIRST_PRICE,
              values: [
                { name: 'Single-Item First Price Auction', id: ApiAuctionType.SINGLE_ITEM_FIRST_PRICE },
                { name: 'Single-Item Second Price Auction', id: ApiAuctionType.SINGLE_ITEM_SECOND_PRICE },
                { name: 'Sequential First Price Auction', id: ApiAuctionType.SEQUENTIAL_FIRST_PRICE },
                { name: 'Sequential Second Price Auction', id: ApiAuctionType.SEQUENTIAL_SECOND_PRICE },
                { name: 'Simultaneous First Price Auction', id: ApiAuctionType.SIMULTANEOUS_FIRST_PRICE },
                { name: 'Simultaneous Second Price Auction', id: ApiAuctionType.SIMULTANEOUS_SECOND_PRICE },
                { name: 'VCG Auction', id: ApiAuctionType.VCG },
                { name: 'Combinatorial Clock Auction (CCA)', id: ApiAuctionType.CCA },
                { name: 'PVM Auction', id: ApiAuctionType.PVM }
              ],
              validator: VueFormGenerator.validators.required
            },
            {
              type: 'select',
              label: 'Domain',
              model: 'domainType',
              default: 'unitDemandValue',
              values: [
                { name: 'Unit Demand Value', id: 'unitDemandValue' },
                { name: 'Additive Value', id: 'additiveValue' },
                { name: 'GSVM', id: 'gsvm' },
                { name: 'LSVM', id: 'lsvm' }
              ],
              validator: VueFormGenerator.validators.required
            }
          ]
        },
        defaultDomainSchema: {
          validation: false,
          title: 'Bidders / Goods',
          fields: [
            {
              type: 'input',
              inputType: 'number',
              label: '# of Goods',
              model: 'numberOfGoods',
              default: 3,
              disabled: (model: any) => {
                if (model.auctionType && model.auctionType.indexOf('SINGLE_ITEM') !== -1) {
                  model.numberOfGoods = 1
                  return true
                }
                return false
              },
              min: 0,
              max: 20,
              validator: [VueFormGenerator.validators.required, VueFormGenerator.validators.integer]
            },
            {
              type: 'input',
              inputType: 'number',
              label: '# of Bidders',
              model: 'numberOfBidders',
              default: 3,
              min: 0,
              max: 20,
              validator: [VueFormGenerator.validators.required, VueFormGenerator.validators.integer]
            },
            {
              type: 'input',
              inputType: 'number',
              label: 'Min Value of Bidders',
              model: 'bidder.min',
              default: 0,
              validator: [VueFormGenerator.validators.required]
            },
            {
              type: 'input',
              inputType: 'number',
              label: 'Max Value of Bidders',
              model: 'bidder.max',
              default: 1000,
              validator: [VueFormGenerator.validators.required]
            }
          ]
        },
        gsvmSchema: {
          validation: false,
          title: 'GSVM Configuration',
          fields: [
            {
              type: 'input',
              inputType: 'number',
              label: '# of National GSVM Bidders',
              model: 'gsvmConfig.numberOfNationalBidders',
              default: 1
            },
            {
              type: 'input',
              inputType: 'number',
              label: '# of Regional GSVM Bidders',
              model: 'gsvmConfig.numberOfRegionalBidders',
              default: 6
            }
          ]
        },
        lsvmSchema: {
          validation: false,
          title: 'LSVM Configuration',
          fields: [
            {
              type: 'input',
              inputType: 'number',
              label: '# of National LSVM Bidders',
              model: 'lsvmConfig.numberOfNationalBidders',
              default: 1
            },
            {
              type: 'input',
              inputType: 'number',
              label: '# of Regional LSVM Bidders',
              model: 'lsvmConfig.numberOfRegionalBidders',
              default: 5
            }
          ]
        },
        strategySchema: {
          validation: false,
          title: 'Bidding Strategy',
          fields: [
            {
              type: 'select',
              label: 'Default Bidder Strategy',
              model: 'defaultStrategy',
              default: ApiBidderStrategy.TRUTHFUL,
              values: [{ name: 'Truthful', id: ApiBidderStrategy.TRUTHFUL }],
              required: true,
              validator: VueFormGenerator.validators.required
            }
          ]
        },
        ccaSchema: {
          validation: false,
          title: 'CCA Configuration',
          fields: [
            {
              type: 'input',
              inputType: 'number',
              label: '# of Supplementary Bids',
              model: 'ccaConfig.supplementaryBids',
              default: 10
            },
            {
              type: 'input',
              inputType: 'text',
              label: 'Price Updates',
              model: 'ccaConfig.priceUpdate',
              default: 0.1
            },
            {
              type: 'input',
              inputType: 'number',
              label: 'Initial Price Update if Price equals 0',
              model: 'ccaConfig.initialPriceUpdateIfPriceEqualsZero',
              default: 1
            },
            {
              type: 'select',
              label: 'Payment Rule',
              model: 'ccaConfig.paymentRule',
              default: ApiAuctionPaymentRule.VCG,
              values: [{ name: 'VCG', id: ApiAuctionPaymentRule.VCG }, { name: 'CCG', id: ApiAuctionPaymentRule.CCG }]
            },
            {
              type: 'input',
              inputType: 'number',
              label: 'Maximum number of Rounds',
              model: 'ccaConfig.maxRounds',
              default: 100
            }
          ]
        },
        pvmSchema: {
          title: 'PVM Configuration',
          validation: false,
          fields: [
            {
              type: 'input',
              inputType: 'number',
              label: 'Maximum # of Rounds',
              model: 'pvmConfig.maxRounds',
              default: 100,
              validator: [VueFormGenerator.validators.required]
            },
            {
              type: 'select',
              label: 'Payment Rule',
              model: 'pvmConfig.paymentRule',
              default: ApiAuctionPaymentRule.VCG,
              values: [{ name: 'VCG', id: ApiAuctionPaymentRule.VCG }, { name: 'CCG', id: ApiAuctionPaymentRule.CCG }]
            },
            {
              type: 'input',
              inputType: 'number',
              label: 'Maximum number of Rounds',
              model: 'pvmConfig.maxRounds',
              default: 100
            }
          ]
        },
        advancedSchema: {
          title: 'Advanced Configuration',
          validation: false,
          fields: [
            {
              type: 'input',
              inputType: 'number',
              label: 'Maximum amount of bids per bidder & round',
              model: 'maxBids',
              default: 10,
              validator: [VueFormGenerator.validators.required]
            },
            {
              type: 'input',
              inputType: 'number',
              label: 'Timelimit for Demand Queries (in seconds)',
              model: 'demandQueryTimeLimit',
              default: 5,
              validator: [VueFormGenerator.validators.required]
            }
          ]
        }
      },
      formOptions: {
        validateAfterLoad: true,
        validateAfterChanged: true,
        validateAsync: true
      }
    }
  }
})
</script>

<style scoped lang="scss">
@import '../../../custom.scss';
</style>
