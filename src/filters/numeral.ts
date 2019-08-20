import numeral from 'numeral'
import Vue from 'vue'

Vue.filter('formatNumber', function(value: any): string {
  // if null, output '-'
  if (value === null) {
    return '-'
  }

  return numeral(parseFloat(value)).format('0,00.[00]')
})
