import Vue from 'vue'
import BigNumber from 'bignumber.js'

const numberFormat = {
  decimalSeparator: '.',
  groupSeparator: ',',
  groupSize: 3
}

Vue.filter('formatNumber', function(value: any): string {
  if (BigNumber.isBigNumber(value)) {
    return value.toFormat(2, BigNumber.ROUND_HALF_UP, numberFormat)
  }
  // if null, output '-'
  if (value === null) {
    return '-'
  }

  // if undefined, output ''
  if (value === undefined) {
    return ''
  }

  return new BigNumber(value).toFormat(2, BigNumber.ROUND_HALF_UP, numberFormat)
})
