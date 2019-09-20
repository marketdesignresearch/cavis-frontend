<template>
  <div :style="{ 'background-image': backgroundImage }" class="bidder text-center">
    <div class="badges justify-content-center">
      <div>
        <span class="badge badge-secondary">Bidder {{ bidder.name }}</span>
      </div>
      <div>
        <span class="badge badge-primary" v-if="showStrategy">{{ strategy }}</span>
        <span class="badge badge-primary mx-1">{{ bidder.shortDescription }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { ApiBidderStrategy } from '../../store/modules/auction'

export default Vue.extend({
  props: ['bidder', 'showStrategy'],
  computed: {
    backgroundImage: function() {
      if (!(this.$props.bidder.name in ['0', '1', '2', '3', '4', '5', '6', '7'])) {
        const uuid = this.$props.bidder.id
        let i,
          h = 0
        for (i = 0, h = 0; i < uuid.length; i++) h = (Math.imul(31, h) + uuid.charCodeAt(i)) | 0
        const index = Math.abs(h % 8)
        return `url('/avatars/${index}.svg')`
      }
      return `url('/avatars/${this.$props.bidder.name}.svg')`
    },
    strategy: function() {
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
  background-color: darken($body-bg, 5%);
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

  &.selected,
  &:hover {
    background-color: theme-color('success');
  }
}

.bidsPlaced {
  border: 3px solid theme-color('success');
  padding-top: 21px;
}
</style>
