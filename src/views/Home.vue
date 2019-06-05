<template>
  <div class="container">
    Configured API: {{ apiUrl }}
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import api from '@/services/api'

export default Vue.extend({
  computed: {
    apiUrl(): string | undefined {
      return api().defaults.baseURL
    },
  },
  name: 'home'
});
</script>
