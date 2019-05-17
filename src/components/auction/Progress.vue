<template>
  <div class="auction-steps">
    <el-steps :active="currentStep" align-center simple>
      <el-step title="Setup" description="Some description"></el-step>
      <el-step title="Auction" description="Some description"></el-step>
      <el-step title="Result" description="Some description"></el-step>
    </el-steps>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Steps, Step } from 'element-ui'

export default Vue.extend({
  name: 'AuctionProgress',
  components: {
    'el-steps': Steps,
    'el-step': Step
  },
  props: ['stage'],
  computed: {
    currentStep () {
      switch (this.$props.stage) {
        case 'setup':
          return 0;
        case 'auction':
          return 1;
        case 'result':
          return 2;
        default:
          return 0;
      }
    }
  }
})
</script>

<style scoped lang="scss">
.auction-steps {
  bottom: 0;
  right: 0;
  left: 0;
  position: absolute;
}
</style>
