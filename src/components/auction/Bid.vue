<template>
  <div>
    <el-input placeholder="Enter your bid" v-model="input"></el-input>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Input } from 'element-ui'

export default Vue.extend({
    components: {
        'el-input': Input
    },
    name: 'AuctionBid'
})
</script>

<style scoped lang="scss">
</style>
