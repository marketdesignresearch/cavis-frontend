<template>
  <div :style="{ 'background-image': backgroundImage }" class="bidder text-center">
    <div class="badges justify-content-center">
      <div><span class="badge badge-secondary">{{ bidder.shortDescription }}</span></div>
      <div><span class="badge badge-primary" v-if="showStrategy">{{ strategy }}</span></div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { ApiBidderStrategy } from '../../store/modules/auction';

export default Vue.extend({
  props: ['bidder', 'showStrategy'],
  computed: {
    backgroundImage: function () {
      return `url('/avatars/${this.$props.bidder.name}.svg')`
    },
    strategy: function () {
      switch (this.$props.bidder.strategy) {
        case ApiBidderStrategy.TRUTHFUL:
          return 'Truthful'
        case ApiBidderStrategy.CUSTOM:
          return 'Custom'
      }
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

  .badges {
    position: relative;
    bottom: -30px;
    width: 300px;
    left: -127px;
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
