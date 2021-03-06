<template>
  <form>
    <vue-form-generator :schema="schema" :model="model" :options="formOptions"></vue-form-generator>
  </form>
</template>

<script lang="ts">
import Vue from 'vue'
import VueFormGenerator from 'vue-form-generator'
import { ApiBidderStrategy, ApiAuctionType } from '../../store/modules/auction'

export default Vue.extend({
  components: {
    'vue-form-generator': VueFormGenerator.component
  },
  mounted() {
    this.$data.model = VueFormGenerator.schema.createDefaultObject(this.schema, this.$props.modelValue || {})
  },
  props: ['modelValue'],
  methods: {
    defaultModel: function() {
      this.$data.model = VueFormGenerator.schema.createDefaultObject()
    }
  },
  name: 'AuctionSetup',
  data() {
    return {
      model: {},
      schema: {
        fields: [
          {
            type: 'select',
            label: 'Auction',
            model: 'auctionType',
            default: 'SINGLE_ITEM_FIRST_PRICE',
            values: [
              { name: 'Single-Item First Price Auction', id: ApiAuctionType.SINGLE_ITEM_FIRST_PRICE },
              { name: 'Single-Item Second Price Auction', id: ApiAuctionType.SINGLE_ITEM_SECOND_PRICE },
              { name: 'Sequential First Price Auction', id: ApiAuctionType.SEQUENTIAL_FIRST_PRICE },
              { name: 'Sequential Second Price Auction', id: ApiAuctionType.SEQUENTIAL_SECOND_PRICE },
              { name: 'Simultaneous First Price Auction', id: ApiAuctionType.SIMULTANEOUS_FIRST_PRICE },
              { name: 'Simultaneous Second Price Auction', id: ApiAuctionType.SIMULTANEOUS_SECOND_PRICE },
              { name: 'VCG Auction', id: ApiAuctionType.VCG },
              { name: 'Combinatorial Clock Auction (CCA)', id: ApiAuctionType.CCA },
              { name: 'Linear Regression PVM', id: ApiAuctionType.PVM }
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
          },
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
            validator: [VueFormGenerator.validators.required]
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
            validator: [VueFormGenerator.validators.required]
          },
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
          },
          {
            type: 'submit',
            attributes: {
              input: {
                class: 'btn btn-primary'
              }
            },
            buttonText: 'Create Auction',
            validateBeforeSubmit: true,
            onSubmit: () => {
              this.$emit('createAuction', Object.assign({}, this.$data.model))
            }
          }
        ]
      },
      formOptions: {
        validateAfterChanged: true,
        validateAsync: true
      }
    }
  }
})
</script>

<style scoped lang="scss">
@import '../../custom.scss';
</style>
