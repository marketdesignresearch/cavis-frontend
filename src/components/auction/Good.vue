<template>
  <el-popover
    placement="top-start"
    title="Title"
    width="200"
    trigger="hover"
    :content="good">
    <div class="item" slot="reference">
      
    </div>
  </el-popover>
</template>

<script lang="ts">
import Vue from 'vue';
import { Popover } from 'element-ui'

export interface IAuctionGood {
  name: string
  value: number
}

const AuctionGoodComponent = Vue.extend({
  name: 'AuctionGood',
  components: {
    'el-popover': Popover
  },
  props: ['good']
});

export default AuctionGoodComponent
export { AuctionGoodComponent }
</script>

<style scoped lang="scss">
.item {
  background: black;
  width: 10px;
  height: 10px;
  margin: 5px;
  display: inline-flex;
}
</style>
