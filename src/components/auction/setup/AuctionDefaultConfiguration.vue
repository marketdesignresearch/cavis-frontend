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

    <div class="text-right py-2">
      <router-link class="btn btn-lg btn-secondary ml-1" to="/" tag="button">Cancel</router-link>
      <button class="btn btn-lg btn-success ml-1" @click.prevent="submit">Create Auction</button>
    </div>
  </form>
</template>

<script lang="ts">
import Vue from 'vue'
import VueFormGenerator from 'vue-form-generator'
import { ApiBidderStrategy, ApiAuctionType, ApiAuctionPaymentRule } from '@/store/modules/auction'
import store from '@/store'

const helpIconGenerator = (link: string | null, helpText?: string) => {
  const returnPreString = `<a href="${link ? link : 'javascript:;'}" ${link ? 'target="_blank"' : ''}>`
  const returnPostString = '</a>'
  const helpTextString = helpText ? `<div class="help-popover">${helpText}</div>` : ''

  return `${returnPreString}
    ${helpTextString}
    <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="info-circle" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="ml-1 svg-inline--fa fa-info-circle fa-w-16"><path data-v-01a4068c="" d="M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 110c23.196 0 42 18.804 42 42s-18.804 42-42 42-42-18.804-42-42 18.804-42 42-42zm56 254c0 6.627-5.373 12-12 12h-88c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h12v-64h-12c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h64c6.627 0 12 5.373 12 12v100h12c6.627 0 12 5.373 12 12v24z" class="" fill=""></path></svg>
  ${returnPostString}`
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
        case 'strategySchema':
          return false
        case 'llgDomainSchema':
          return (this.model as any).domainConfig.type.indexOf('llg') !== -1
        case 'defaultDomainSchema':
          return (
            (this.model as any).domainConfig.type.indexOf('additive') !== -1 ||
            (this.model as any).domainConfig.type.indexOf('unitDemand') !== -1 ||
            (this.model as any).domainConfig.type.indexOf('synergy') !== -1
          )
        case 'gsvmSchema':
          return (this.model as any).domainConfig.type.indexOf('gsvm') !== -1
        case 'lsvmSchema':
          return (this.model as any).domainConfig.type.indexOf('lsvm') !== -1
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
              label: 'Auction Mechanism',
              model: 'auctionType',
              default: ApiAuctionType.VCG,
              selectOptions: {
                hideNoneSelectedText: true
              },
              help: helpIconGenerator(
                'http://cavis.marketdesignresearch.org/docs/#/auction-setup?id=auction-types',
                'Click here to get an overview on the supported Market Mechanisms.'
              ),
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
              model: 'domainConfig.type',
              default: 'additiveValue',
              selectOptions: {
                hideNoneSelectedText: true
              },
              help: helpIconGenerator(
                'http://cavis.marketdesignresearch.org/docs/#/auction-setup?id=domains',
                'A domain consists of specific types and numbers of bidders / goods. Click for an overview on the available domains.'
              ),
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
              model: 'name',
              help: helpIconGenerator(
                null,
                'If you give the auction a name, it will be easier for you to find it in the list of active auctions.'
              )
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
              model: 'tags',
              help: helpIconGenerator(
                null,
                'Tags can help you to categorize your auctions. You can select existing tags or just write a new one.'
              )
            },
            {
              disabled: () => {
                return !store.getters.oidcIsAuthenticated
              },
              type: 'checkbox',
              label: 'Private (only accessible if logged-in)',
              model: 'private',
              default: false,
              help: helpIconGenerator(
                null,
                'Private auctions cannot be seen nor changed by other users, so they are safe for demonstration purposes.'
              )
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
              label: 'Number of Goods',
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
              label: 'Number of Bidders',
              model: 'numberOfBidders',
              default: 3,
              min: 0,
              max: 20,
              validator: [VueFormGenerator.validators.required, VueFormGenerator.validators.integer]
            },
            {
              type: 'input',
              inputType: 'number',
              label: 'Minimal Value of Bidders',
              model: 'domainConfig.minBidder',
              default: 0,
              help: helpIconGenerator(null, "The bidders' values are drawn uniformly between the minimal and maximal value set here."),
              validator: [VueFormGenerator.validators.required]
            },
            {
              type: 'input',
              inputType: 'number',
              label: 'Maximal Value of Bidders',
              model: 'domainConfig.maxBidder',
              default: 1000,
              help: helpIconGenerator(null, "The bidders' values are drawn uniformly between the minimal and maximal value set here."),
              validator: [VueFormGenerator.validators.required]
            },
            {
              type: 'input',
              inputType: 'number',
              label: 'Synergy factor',
              model: 'domainConfig.synergy',
              default: 0.2,
              step: 0.01,
              visible: (model: any) => model.domainConfig.type.indexOf('synergy') !== -1,
              help: helpIconGenerator(
                'http://cavis.marketdesignresearch.org/docs/#/auction-setup?id=synergy-domain',
                'A factor for the synergy among multiple goods. Positive means they are complements, negative means they are substitutes. Click for more information.'
              ),
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
              model: 'domainConfig.interestingCase',
              default: true,
              help: helpIconGenerator(
                'http://cavis.marketdesignresearch.org/docs/#/auction-setup?id=local-local-global-llg-domain',
                'Click here for more information about what an interesting case in LLG is.'
              ),
              validator: [VueFormGenerator.validators.required]
            },
            {
              type: 'input',
              inputType: 'number',
              label: 'Maximum Value of Local Bidders',
              model: 'domainConfig.maxLocalValue',
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
              label: 'Number of National GSVM Bidders',
              model: 'domainConfig.numberOfNationalBidders',
              default: 1
            },
            {
              type: 'input',
              inputType: 'number',
              label: 'Number of Regional GSVM Bidders',
              model: 'domainConfig.numberOfRegionalBidders',
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
              label: 'Number of National LSVM Bidders',
              model: 'domainConfig.numberOfNationalBidders',
              default: 1
            },
            {
              type: 'input',
              inputType: 'number',
              label: 'Number of Regional LSVM Bidders',
              model: 'domainConfig.numberOfRegionalBidders',
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
              help: helpIconGenerator(null, 'Currently, the only supported default strategy is the truthful strategy.'),
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
              label: 'Number of Supplementary Bids',
              model: 'ccaConfig.supplementaryBids',
              default: 10,
              help: helpIconGenerator(
                'http://cavis.marketdesignresearch.org/docs/#/auction-setup?id=combinatorial-clock-auction-cca',
                'Defines how many bids bidders can submit in the last round right after the clock phase. Click for more information.'
              )
            },
            {
              type: 'input',
              inputType: 'text',
              label: 'Price Updates',
              model: 'ccaConfig.priceUpdate',
              default: 0.1,
              help: helpIconGenerator(
                'http://cavis.marketdesignresearch.org/docs/#/auction-setup?id=combinatorial-clock-auction-cca',
                'If you set this to e.g. 0.1, the prices of over-demanded items will be raised by 10%. Click for more information.'
              )
            },
            {
              type: 'input',
              inputType: 'number',
              label: 'Initial Price Update if Price equals 0',
              model: 'ccaConfig.initialPriceUpdateIfPriceEqualsZero',
              default: 1,
              help: helpIconGenerator(
                'http://cavis.marketdesignresearch.org/docs/#/auction-setup?id=combinatorial-clock-auction-cca',
                "Since we're updating the prices relatively, a zero-price would never be raised. In this case, this setting defines what the initial price update will be instead. Click for more information."
              )
            },
            {
              type: 'select',
              label: 'Payment Rule',
              model: 'ccaConfig.paymentRule',
              selectOptions: {
                hideNoneSelectedText: true
              },
              default: ApiAuctionPaymentRule.VCG,
              values: [{ name: 'VCG', id: ApiAuctionPaymentRule.VCG }, { name: 'CCG', id: ApiAuctionPaymentRule.CCG }],
              help: helpIconGenerator(
                'http://cavis.marketdesignresearch.org/docs/#/auction-setup?id=combinatorial-clock-auction-cca',
                'Defines how the prices will be determined based on the collected bids.'
              )
            },
            {
              type: 'input',
              inputType: 'number',
              label: 'Maximum number of Rounds',
              model: 'ccaConfig.maxRounds',
              default: 100,
              help: helpIconGenerator(
                'http://cavis.marketdesignresearch.org/docs/#/auction-setup?id=combinatorial-clock-auction-cca',
                'In theory, CCA could go on for a long time. With this setting, you can limit the duration to a certain number of rounds.'
              )
            }
          ]
        },
        pvmSchema: {
          title: 'PVM Configuration',
          validation: false,
          fields: [
            {
              type: 'select',
              label: 'Payment Rule',
              model: 'pvmConfig.paymentRule',
              selectOptions: {
                hideNoneSelectedText: true
              },
              default: ApiAuctionPaymentRule.VCG,
              values: [{ name: 'VCG', id: ApiAuctionPaymentRule.VCG }, { name: 'CCG', id: ApiAuctionPaymentRule.CCG }],
              help: helpIconGenerator(
                'http://cavis.marketdesignresearch.org/docs/#/auction-setup?id=pvm-auction',
                'Defines how the prices will be determined based on the collected bids.'
              )
            },
            {
              type: 'input',
              inputType: 'number',
              label: 'Maximum Number of Rounds',
              model: 'pvmConfig.maxRounds',
              default: 100,
              help: helpIconGenerator(
                'http://cavis.marketdesignresearch.org/docs/#/auction-setup?id=pvm-auction',
                'In theory, PVM could go on for a long time. With this setting, you can limit the duration to a certain number of rounds.'
              )
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
              default: 20,
              validator: [VueFormGenerator.validators.required],
              help: helpIconGenerator(
                null,
                'Setting this may be part of the auction rules, and a lower number will also result in faster determination of bid propositions.'
              )
            },
            {
              type: 'input',
              inputType: 'number',
              label: 'Number of bids reserved for user',
              model: 'manualBids',
              default: 5,
              validator: [VueFormGenerator.validators.required],
              help: helpIconGenerator(
                null,
                'You can prevent us to propose the maximum number of bids, such that you can manually add some bids in each round without having to delete a proposed bid first.'
              )
            },
            // TODO: This currently does not do anything due to the pool filling mode in GSVM / LSVM... Leaving it out for now
            //{
            //  type: 'input',
            //  inputType: 'number',
            //  label: 'Timelimit for Demand Queries (in seconds)',
            //  model: 'demandQueryTimeLimit',
            //  default: 5,
            //  validator: [VueFormGenerator.validators.required]
            //},
            {
              type: 'input',
              inputType: 'number',
              label: 'Seed (optional)',
              model: 'seed',
              help: helpIconGenerator(
                null,
                'There are always some distributions involved when creating a domain. With this setting, you can fix the seed to create identical domains and, e.g., compare auction mechanisms.'
              )
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
