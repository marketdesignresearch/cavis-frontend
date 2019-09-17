<template>
  <div class="hover">
    <input
      type="text"
      v-if="edit"
      :value="valueLocal"
      @blur="
        valueLocal = $event.target.value
        edit = false
        $emit('input', valueLocal)
      "
      @keyup.enter="
        valueLocal = $event.target.value
        edit = false
        $emit('input', valueLocal)
      "
      v-focus=""
    />
    <div v-else="" @click="edit = true">
      <div>{{ valueLocal || '-' }}</div>
    </div>
    <div class="small hint" @click="edit = true">Click to edit</div>
  </div>
</template>

<style lang="scss" scoped>
@import '../../custom';
.hover {
  .hint {
    opacity: 0;
  }
}

.hover:hover {
  .hint {
    opacity: 1;
  }
}
</style>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: ['value'],
  data() {
    return {
      edit: false,
      valueLocal: this.value
    }
  },
  watch: {
    value: function() {
      this.valueLocal = this.value
    }
  },
  directives: {
    focus: {
      inserted(el) {
        el.focus()
      }
    }
  }
})
</script>
