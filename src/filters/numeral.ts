import numeral from 'numeral'
import Vue from 'vue'
import BigNumber from 'bignumber.js'

Vue.filter('formatNumber', function(value: any): string {
  if (BigNumber.isBigNumber(value)) {
    return value.toFormat({
      decimalSeparator: '.',
      groupSeparator: ',',
      groupSize: 3,
      secondaryGroupSize: 2
    })
  }
  // if null, output '-'
  if (value === null) {
    return '-'
  }

  return numeral(parseFloat(value)).format('0,00.[00]')
})
