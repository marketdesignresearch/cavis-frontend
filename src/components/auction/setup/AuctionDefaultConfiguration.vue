<template>
  <form>
    <div class="my-2" v-for="(schema, index) in filteredSchemas" :key="schema.title">
      <b-button class="mb-2" variant="secondary" block href="#" v-b-toggle="'accordion-' + index">
        {{ schema.title }}
        <font-awesome-icon class="when-closed" icon="chevron-down" />
        <font-awesome-icon class="when-opened" icon="chevron-up" />
      </b-button>
      <b-collapse :id="'accordion-' + index" :visible="index !== filteredSchemas.length - 1" role="tabpanel">
        <vue-form-generator
          :schema="schema"
          :model="model"
          :options="formOptions"
          @validated="schema.validation = $event"
        ></vue-form-generator>
      </b-collapse>
    </div>

    <div class="text-right">
      <button class="btn btn-success ml-1" @click.prevent="submit">Create</button>
    </div>
  </form>
</template>

<script lang="ts">
import Vue from 'vue'
import VueFormGenerator from 'vue-form-generator'
import { ApiBidderStrategy, ApiAuctionType, ApiAuctionPaymentRule } from '../../../store/modules/auction'

const helpIconGenerator = (link: string) => {
  return `<a href="${link}" target="_blank">
    <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="info-circle" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline--fa fa-info-circle fa-w-16"><path data-v-01a4068c="" d="M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 110c23.196 0 42 18.804 42 42s-18.804 42-42 42-42-18.804-42-42 18.804-42 42-42zm56 254c0 6.627-5.373 12-12 12h-88c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h12v-64h-12c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h64c6.627 0 12 5.373 12 12v100h12c6.627 0 12 5.373 12 12v24z" class="" fill=""></path></svg>
  </a>`
}

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
        case 'llgDomainSchema':
          return (this.model as any).domainType.indexOf('llg') !== -1
        case 'defaultDomainSchema':
          return (
            (this.model as any).domainType.indexOf('additive') !== -1 ||
            (this.model as any).domainType.indexOf('unitDemand') !== -1 ||
            (this.model as any).domainType.indexOf('synergy') !== -1
          )
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
              default: ApiAuctionType.VCG,
              selectOptions: {
                hideNoneSelectedText: true
              },
              help: helpIconGenerator('http://localhost:1234/docs/#/auction-setup?id=auction-types'),
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
              default: 'additiveValue',
              selectOptions: {
                hideNoneSelectedText: true
              },
              help: helpIconGenerator('http://localhost:1234/docs/#/auction-setup?id=domains'),
              values: [
                { name: 'Unit Demand Value', id: 'unitDemandValue' },
                { name: 'Additive Value', id: 'additiveValue' },
                { name: 'Local-Local-Global (LLG)', id: 'llg' },
                { name: 'Synergy Domain', id: 'synergy' },
                { name: 'GSVM', id: 'gsvm' },
                { name: 'LSVM', id: 'lsvm' }
              ],
              validator: VueFormGenerator.validators.required
            },
            {
              type: 'input',
              inputType: 'text',
              label: 'Name (optional)',
              model: 'name'
            },
            {
              type: 'vueMultiSelect',
              inputType: 'text',
              label: 'Tags (optional)',
              values: [],
              selectOptions: {
                taggable: true,
                multiple: true,
                onNewTag: function(newTag: string, _id: string, options: string[], value: string[]) {
                  options.push(newTag)
                  value.push(newTag)
                }
              },
              default: [],
              model: 'tags'
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
              tooltip: 'This is a tooltip',
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
            },
            {
              type: 'input',
              inputType: 'number',
              label: 'Synergy factor',
              model: 'bidder.synergy',
              default: 0.2,
              step: 0.01,
              visible: (model: any) => model.domainType.indexOf('synergy') !== -1,
              hint:
                'A factor for the synergy among multiple goods. Positive means they are complements, negative means they are subsitute.',
              validator: [VueFormGenerator.validators.required]
            }
          ]
        },
        llgDomainSchema: {
          validation: false,
          title: 'LLG Configuration',
          fields: [
            {
              type: 'checkbox',
              label: 'Interesting Case',
              model: 'llgConfig.interestingCase',
              default: true,
              validator: [VueFormGenerator.validators.required]
            },
            {
              type: 'input',
              inputType: 'number',
              label: 'Maximum Value of Local Bidders',
              model: 'llgConfig.maxLocalValue',
              default: 100,
              validator: [VueFormGenerator.validators.required, VueFormGenerator.validators.integer]
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
              selectOptions: {
                hideNoneSelectedText: true
              },
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
              selectOptions: {
                hideNoneSelectedText: true
              },
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
              label: 'Number of Bids in Initial Round',
              model: 'pvmConfig.initialRoundBids',
              default: 5,
              validator: [VueFormGenerator.validators.required]
            },
            {
              type: 'select',
              label: 'Payment Rule',
              model: 'pvmConfig.paymentRule',
              selectOptions: {
                hideNoneSelectedText: true
              },
              default: ApiAuctionPaymentRule.VCG,
              values: [{ name: 'VCG', id: ApiAuctionPaymentRule.VCG }, { name: 'CCG', id: ApiAuctionPaymentRule.CCG }]
            },
            {
              type: 'input',
              inputType: 'number',
              label: 'Maximum Number of Rounds',
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
              label: 'Maximum number of bids per bidder & round',
              model: 'maxBids',
              default: 10,
              validator: [VueFormGenerator.validators.required]
            },
            {
              type: 'input',
              inputType: 'number',
              label: 'Number of bids reserved for user',
              model: 'manualBids',
              default: 5,
              validator: [VueFormGenerator.validators.required]
            },
            {
              type: 'input',
              inputType: 'number',
              label: 'Timelimit for Demand Queries (in seconds)',
              model: 'demandQueryTimeLimit',
              default: 5,
              validator: [VueFormGenerator.validators.required]
            },
            {
              type: 'input',
              inputType: 'number',
              label: 'Seed',
              model: 'seed'
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

<style lang="scss">
@import '../../../custom.scss';

.collapsed > .when-opened,
:not(.collapsed) > .when-closed {
  display: none;
}

.help {
  .icon {
    display: none;
  }
  div.helpText {
    display: inline-block;
  }
}
</style>
