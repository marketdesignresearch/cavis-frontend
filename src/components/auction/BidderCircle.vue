<template>
  <div class="shadow-sm bidder text-center">
    {{ name }}
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: ['name']
})
</script>

<style scoped lang="scss">
@import '../../custom';

.bidder {
  cursor: pointer;
  user-select: none;
  background: white;
  padding: 10px;
  padding-top: 25px;
  height: 70px;
  width: 70px;
  border-radius: 35px;
}

.selected {
  border: 3px solid theme-color('success');
  padding-top: 21px;
}

.bidsPlaced {
  background-color: lighten(theme-color('success'), 25%);
}
</style>
