import numeral from 'numeral'
import Vue from 'vue'

Vue.filter('formatNumber', function(value: any): string {
  return numeral(value).format('0,00')
})
