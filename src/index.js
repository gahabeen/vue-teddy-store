import * as accessors from './accessors'
import TeddyStore, { MissingStoreError, Store } from './store'

const { has, get, set, sync, computed, setter, getter, createGetters, createState } = new TeddyStore().export({ store: false, boundTo: '$' })

export default TeddyStore
export { accessors, MissingStoreError, Store, has, get, set, sync, computed, setter, getter, createGetters, createState }
