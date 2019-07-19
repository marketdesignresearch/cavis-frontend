import jsSHA from 'jssha'
import { ApiBundleEntry } from '@/store/modules/auction'

const hashBundle = function(bundles: ApiBundleEntry[]) {
  const sha256 = new jsSHA('SHA-256', 'TEXT')
  sha256.update(
    Array.from(bundles) // copy array before sorting, to not trigger change-detection
      .map(entry => entry.good + entry.amount)
      .sort()
      .join('')
  )

  return sha256.getHash('HEX')
}

export { hashBundle }
export default hashBundle
