<template>
  <span class="badge badge-secondary">
    <span v-for="good in unifiedGoods" :key="good.id">{{ good.name }}</span>
  </span>
</template>

<script lang="ts">
import Vue from 'vue'
import { Popover } from 'element-ui'
import auction, { ApiGood } from '../../store/modules/auction'

const GoodBadgeComponent = Vue.extend({
  name: 'GoodBadge',
  props: ['ids'],
  computed: {
    unifiedGoods(): ApiGood[] {
      return (this.$props.ids || [])
        .map((id: string) => auction.goodById()(id))
        .sort((goodA: ApiGood, goodB: ApiGood) => {
          if (goodA.name < goodB.name) {
            return -1
          }
          if (goodA.name > goodB.name) {
            return 1
          }
          return 0
        })
    }
  }
})

export default GoodBadgeComponent
export { GoodBadgeComponent }
</script>

<style scoped lang="scss">
@import '../../custom.scss';
</style>
