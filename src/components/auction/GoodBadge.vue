<template>
  <span class="badge badge-secondary">
    <span v-for="good in unifiedGoods" :key="good.id">{{ good.id }}</span>
  </span>
</template>

<script lang="ts">
import Vue from 'vue'
import { Popover } from 'element-ui'
import { ApiGood } from '../../store/modules/auction'

const GoodBadgeComponent = Vue.extend({
  name: 'GoodBadge',
  props: ['goods'],
  computed: {
    unifiedGoods(): ApiGood[] {
      let goods = []

      if (Array.isArray(this.$props.goods) && this.$props.goods.length > 0 && typeof this.$props.goods[0] === 'object') {
        goods = this.$props.goods
      } else {
        goods = this.$props.goods.map((good: string) => {
          return {
            id: good
          }
        })
      }

      return goods.sort((goodA: ApiGood, goodB: ApiGood) => {
        if (goodA.id < goodB.id) {
          return -1
        }
        if (goodA.id > goodB.id) {
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
