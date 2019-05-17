<template>
  <form>
      <vue-form-generator :schema="schema" :model="model" :options="formOptions"></vue-form-generator>
  </form>
</template>

<script lang="ts">
import Vue from 'vue'
import { Input } from 'element-ui'
import VueFormGenerator from 'vue-form-generator'

export default Vue.extend({
    components: {
        'el-input': Input,
        "vue-form-generator": VueFormGenerator.component
    },
    mounted () {
      this.$data.model = VueFormGenerator.schema.createDefaultObject(this.schema, {
        mechanismType: 'SINGLE_ITEM_FIRST_PRICE',
        bidderType: 'XOR_BIDDER'
      });
    },
    name: 'AuctionSetup',
    data () {
      return {
        model: {},
        schema: {
          fields: [
             {
              type: 'select',
              label: 'Mechanism Type',
              model: 'mechanismType',
              default: 'SINGLE_ITEM_FIRST_PRICE',
              values: [
                { name: 'Single-Item First Price Auction', id: 'SINGLE_ITEM_FIRST_PRICE' },
                { name: 'Single-Item Second Price Auction', id: 'SINGLE_ITEM_SECOND_PRICE' },
                { name: 'VCG Auction', id: 'VCG_XOR' }
              ],
              validator: VueFormGenerator.validators.required
            },
            {
              type: 'select',
              label: 'Bidder Type',
              model: 'bidderType',
              default: 'XOR_BIDDER',
              values: [
                { name: 'XOR Bidder', id: 'XOR_BIDDER' }
              ],
              validator: VueFormGenerator.validators.required
            },
            {
              type: 'input',
              inputType: 'number',
              label: '# of Goods',
              model: 'numberOfGoods',
              default: 1,
              disabled: (model: any): boolean => {
                return model.mechanismType !== 'VCG_XOR'
              },
              min: 0,
              max: (model: any): number => {
                if (model.mechanismType !== 'VCG_XOR') {
                  return 50
                }
                return 1
              },
              validator: [VueFormGenerator.validators.required]
            },
            {
              type: 'input',
              inputType: 'number',
              label: '# of Bidders',
              model: 'numberOfBidders',
              default: 3,
              min: 0,
              max: 50,
              validator: [VueFormGenerator.validators.required]
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
</style>
