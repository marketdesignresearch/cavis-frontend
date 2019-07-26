<script>
export default {
  name: 'sort-marker',
  props: ['sortable', 'property'],
  computed: {
    showAsc() {
      return this.sortable.sortBy === this.property && this.sortable.sortASC
    },
    showDesc() {
      return this.sortable.sortBy === this.property && !this.sortable.sortASC
    }
  }
}
</script>

<template>
  <span class="hover-area">
    <font-awesome-icon class="sort-marker onParentHoverHide" v-if="showAsc" :icon="['fa', 'sort-up']" />
    <font-awesome-icon class="sort-marker onParentHoverHide" v-if="showDesc" :icon="['fa', 'sort-down']" />
    <font-awesome-icon class="sort-marker onParentHoverShow" :icon="['fa', 'sort']" />
  </span>
</template>

<style lang="scss" scoped>
.sort-marker {
  position: absolute;
}
.hover-area {
  float: right;
  position: relative;
  right: 0;
  top: 3px;
}
</style>
