<template>
  <form>
    <b-tabs content-class="mt-3" v-model="selectedTab" small>
        <b-tab :title="schema.title" v-for="(schema, index) in schemas" :key="schema.title">
            <vue-form-generator :schema="schema" :model="model" :options="formOptions" @validated="validateDefault($event, index)"></vue-form-generator>
        </b-tab>
        <b-tab title="CCA Configuration" v-if="model.auctionType === ApiAuctionType.CCA">
            <vue-form-generator :schema="ccaSchema" :model="model" :options="formOptions" @validated="validation.cca = $event"></vue-form-generator>
        </b-tab>
        <b-tab title="PVM Configuration" v-if="model.auctionType === ApiAuctionType.PVM">
            <vue-form-generator :schema="pvmSchema" :model="model" :options="formOptions" @validated="validation.pvm = $event"></vue-form-generator>
        </b-tab>

        <div class="text-right">
            <button class="btn btn-primary" v-if="selectedTab > 0"  @click.prevent="selectedTab--">Previous</button>
            <button class="btn btn-primary ml-1" v-if="selectedTab < schemasLength - 1" @click.prevent="selectedTab++">Next</button>
            <button class="btn btn-success ml-1" v-if="selectedTab === schemasLength - 1" @click.prevent="submit">Create</button>
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
      schemasLength(): number {
          if ((this.model as any).auctionType === ApiAuctionType.PVM || (this.model as any).auctionType === ApiAuctionType.CCA) {
              return this.schemas.length + 1
          }
          return this.schemas.length
      },
      allFormsValid(): boolean {
          const defaultValidation = (this.validation.default as boolean[]).reduce((previous: boolean, val: boolean) => previous && val)
          console.log(defaultValidation)
          if ((this.model as any).auctionType === ApiAuctionType.PVM) {
            return defaultValidation && this.validation.pvm
          } else if ((this.model as any).auctionType === ApiAuctionType.CCA) {
            return defaultValidation && this.validation.cca
          }
          return defaultValidation
      }
  },
  mounted() {
    const model = Object.assign({}, ...this.schemas.map(schema => {
        return VueFormGenerator.schema.createDefaultObject(schema, this.$props.modelValue || {})
    }), VueFormGenerator.schema.createDefaultObject(this.ccaSchema, this.$props.modelValue || {}), VueFormGenerator.schema.createDefaultObject(this.pvmSchema, this.$props.modelValue || {}))

    this.$data.model = model
  },
  methods: {
      validateDefault(isValid: boolean, index: number) {
          this.$data.validation[index] = isValid
      },
      log(event: any) {
          console.log(event)
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
      model: {},
      validation: {
          default: [],
          cca: false,
          pvm: false
      },
      ccaSchema: {
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
                values: [
                    { name: 'VCG', id: ApiAuctionPaymentRule.VCG },
                    { name: 'CCG', id: ApiAuctionPaymentRule.CCG }
                ]
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
                values: [
                    { name: 'VCG', id: ApiAuctionPaymentRule.VCG },
                    { name: 'CCG', id: ApiAuctionPaymentRule.CCG }
                ]
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
      schemas: [
        {
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
                { name: 'GSVM', id: 'gsvm' }
                ],
                validator: VueFormGenerator.validators.required
            }]
        }, {
            title: 'Goods / Bidders',
            fields: [
                {
                type: 'input',
                inputType: 'number',
                label: '# of Goods',
                model: 'numberOfGoods',
                default: 3,
                disabled: (model: any): boolean => {
                if (model.domainType && model.domainType.indexOf('gsvm') !== -1) {
                    model.numberOfGoods = 18
                    return true
                } else if (model.auctionType && model.auctionType.indexOf('SINGLE_ITEM') !== -1) {
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
                disabled: (model: any): boolean => {
                if (model.domainType && model.domainType.indexOf('gsvm') !== -1) {
                    model.numberOfBidders = 7
                    return true
                }
                return false
                },
                min: 0,
                max: 20,
                validator: [VueFormGenerator.validators.required, VueFormGenerator.validators.integer]
            }]
        }, {
            title: 'Bidding and Strategy',
            fields: [
            {
                type: 'input',
                inputType: 'number',
                label: 'Min Value of Bidder',
                model: 'bidder.min',
                default: 0,
                validator: [VueFormGenerator.validators.required]
            },
            {
                type: 'input',
                inputType: 'number',
                label: 'Max Value of Bidder',
                model: 'bidder.max',
                default: 1000,
                validator: [VueFormGenerator.validators.required]
            },
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
        {
            title: 'Advanced Configuration',
            fields: [
                {
                    type: 'input',
                    inputType: 'number',
                    label: 'Maximum Amount of Bids',
                    model: 'maxBids',
                    default: 10,
                    validator: [VueFormGenerator.validators.required]
                },
                {
                    type: 'input',
                    inputType: 'number',
                    label: 'Timelimit for Demand Queries',
                    model: 'demandQueryTimeLimit',
                    default: 5,
                    validator: [VueFormGenerator.validators.required]
                }
            ]
        }
      ],
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
