import moment from 'moment'
import Vue from 'vue'

Vue.filter('formatDate', function(value: any): string {
  return moment(value).format('DD.MM.YYYY HH:mm')
})
