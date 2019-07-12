<template>
  <form>
    <vue-form-generator :schema="schema" :model="model" :options="formOptions"></vue-form-generator>
  </form>
</template>

<script lang="ts">
import Vue from 'vue'
import { Input } from 'element-ui'
import VueFormGenerator from 'vue-form-generator'
import { ApiBidderStrategy } from '../../store/modules/auction'

export default Vue.extend({
  components: {
    'el-input': Input,
    'vue-form-generator': VueFormGenerator.component
  },
  mounted() {
    this.$data.model = VueFormGenerator.schema.createDefaultObject(this.schema, {
      auctionType: 'VCG_XOR',
      domainType: 'additiveValue'
    })
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
              { name: 'Single-Item First Price Auction', id: 'SINGLE_ITEM_FIRST_PRICE' },
              { name: 'Single-Item Second Price Auction', id: 'SINGLE_ITEM_SECOND_PRICE' },
              { name: 'Sequential First Price Auction', id: 'SEQUENTIAL_FIRST_PRICE' },
              { name: 'Sequential Second Price Auction', id: 'SEQUENTIAL_SECOND_PRICE' },
              { name: 'Simultaneous First Price Auction', id: 'SIMULTANEOUS_FIRST_PRICE' },
              { name: 'Simultaneous Second Price Auction', id: 'SIMULTANEOUS_SECOND_PRICE' },
              { name: 'VCG Auction', id: 'VCG_XOR' },
              { name: 'Combinatorial Clock Auction (CCA)', id: 'CCA_VCG' },
              // { name: 'CCA-CCG Auction', id: 'CCA_CCG' },
              { name: 'PVM Auction', id: 'PVM_VCG' }
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

<style scoped lang="scss"></style>
