<template>
  <div class="auction-steps">
    <div class="container">
      <div class="progress">
        <div class="progress-bar" :class="{ 'bg-light text-dark': currentStep < 0, 'bg-primary': currentStep < 0,'bg-success': currentStep > 0 }" role="progressbar" style="width: 33.333333%">Setup</div>
        <div class="progress-bar" :class="{ 'bg-light text-dark': currentStep < 1, 'bg-primary': currentStep < 1,'bg-success': currentStep > 1 }" role="progressbar" style="width: 33.333333%">Auction</div>
        <div class="progress-bar" :class="{ 'bg-light text-dark': currentStep < 2, 'bg-primary': currentStep < 2,'bg-success': currentStep > 2 }" role="progressbar" style="width: 33.333333%">Result</div>
      </div>
    </div>
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
</style>
