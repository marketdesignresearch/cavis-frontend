<template>
  <span class="badge badge-secondary">
    <span v-if="unifiedBundleEntries.length === 0">{}</span>
    <span v-for="(entry, index) in unifiedBundleEntries" :key="index">
      <span v-if="hasMultiGoods">{{ entry.amount }}x </span>
      <span>{{ entry.good.name }}</span>
      <span v-if="hasMultiGoods && index < unifiedBundleEntries.length - 1">, </span>
    </span>
  </span>
</template>

<script lang="ts">
import Vue from 'vue'
import { Popover } from 'element-ui'
import auction, { ApiGood, BundleEntry } from '../../store/modules/auction'

const GoodBadgeComponent = Vue.extend({
  name: 'GoodBadge',
  props: ['ids'],
  computed: {
    unifiedBundleEntries(): BundleEntry[] {
      return (this.$props.ids || [])
        .map((idAmountPair: any) => {
          if (typeof idAmountPair === 'object') {
            return { good: auction.goodById()(idAmountPair.good), amount: idAmountPair.amount }
          } else if (typeof idAmountPair === 'string') {
            return { good: auction.goodById()(idAmountPair), amount: 1 }
          }
        })
        .sort((entryA: BundleEntry, entryB: BundleEntry) => {
          if (entryA.good.name < entryB.good.name) {
            return -1
          }
          if (entryA.good.name > entryB.good.name) {
            return 1
          }
          return 0
        })
    },
    hasMultiGoods(): boolean {
      return this.unifiedBundleEntries.some(entry => entry.amount > 1)
    }
  }
})

export default GoodBadgeComponent
export { GoodBadgeComponent }
</script>

<style scoped lang="scss">
@import '../../custom.scss';
span {
  font-family: monospace;
  font-size: 1.3em;
}
</style>
