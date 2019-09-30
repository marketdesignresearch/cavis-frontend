<template>
  <div class="marked" v-html="compiledMarkdown"></div>
</template>

<script lang="ts">
import Vue from 'vue'
import marked from 'marked'
import axios from 'axios'

const axiosClient = axios.create()

export default Vue.extend({
  props: ['file'],
  data() {
    return {
      content: ''
    }
  },
  async mounted() {
    const { data: faqMarkdown } = await axiosClient.get(
      `https://raw.githubusercontent.com/marketdesignresearch/cavis-docs/master/${this.$props.file}`
    )
    this.$data.content = faqMarkdown
  },
  computed: {
    compiledMarkdown: function() {
      if (this.$data.content) {
        return marked(this.$data.content)
      }
    }
  }
})
</script>

<style lang="scss">
@import '../custom';

.marked {
  h1 {
    font-size: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }

  h2 {
    font-size: 1.5rem;
    padding: 1rem 0;
  }
}
</style>
