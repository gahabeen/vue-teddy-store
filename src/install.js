import * as output from './output'

export const install = (VueInstance) => {
  VueInstance.prototype.$teddy = output
}
