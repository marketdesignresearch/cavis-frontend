<template>
  <div :style="{ 'background-image': backgroundImage }" class="bidder text-center">
    <span class="badge badge-secondary">{{ bidder.shortDescription }}</span>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: ['bidder'],
  computed: {
    backgroundImage: function () {
      return `url('/avatars/${this.$props.bidder.name}.svg')`
    }
  }
})
</script>

<style scoped lang="scss">
@import '../../custom';

.bidder {
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;

  cursor: pointer;
  user-select: none;
  background-color: white;
  padding: 10px;
  padding-top: 25px;
  height: 70px;
  width: 70px;
  border-radius: 35px;

  .badge {
    position: absolute;
    bottom: -9px;
    left: 0;
  }

  &.selected, &:hover {
    background-color: theme-color('success');
  }
}

.bidsPlaced {
  border: 3px solid theme-color('success');
  padding-top: 21px;
  // background-color: lighten(theme-color('success'), 25%);
}
</style>
