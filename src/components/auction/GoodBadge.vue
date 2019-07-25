<template>
  <span>
    <span v-if="unifiedBundleEntries.length === 0">{}</span>
    <span class="bundle-card" v-for="(entry, index) in unifiedBundleEntries" :key="index">
      <span v-if="hasMultiGoods">{{ entry.amount }}x </span>
      <span>{{ entry.good.name }}</span>
      <span v-if="hasMultiGoods && index < unifiedBundleEntries.length - 1">, </span>
    </span>
  </span>
</template>

<script lang="ts">
import Vue from 'vue'
import auction, { ApiGood, BundleEntry } from '../../store/modules/auction'

const GoodBadgeComponent = Vue.extend({
  name: 'GoodBadge',
  props: ['ids'],
  computed: {
    unifiedBundleEntries(): BundleEntry[] {
      let mapArray = []
      
      if (this.$props.ids && this.$props.ids.hasOwnProperty('entries')) {
        mapArray = this.$props.ids.entries
      } else if (this.$props.ids) {
        mapArray = this.$props.ids
      }

      return mapArray
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

.bundle-card {
  position: relative;
  background-image: url('../../assets/card-blank.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;

  height: 23px;
  line-height: 23px;
  width: 16px;
  margin-left: 1px;
  margin-right: 1px;
  display: inline-block;
  text-align: center;

  font-family: monospace;
  font-weight: 400;
  font-size: 1.1rem;

  &:first-child {
    margin-left: 0;
  }
}



</style>
