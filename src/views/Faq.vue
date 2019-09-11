<template>
  <div class="container">
    <markdown file="faq.md" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import auction from '../store/modules/auction'

export default Vue.extend({
  components: {
    markdown: () => import('@/components/markdown.vue')
  }
})
</script>

<style scoped lang="scss"></style>
