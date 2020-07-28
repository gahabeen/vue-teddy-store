import * as accessors from './accessors'
import TeddyStore, * as others from './store'

const { has, get, set, sync, computed, setter, getter, createGetters, createState, MissingStoreError } = others

export default TeddyStore
export { accessors, has, get, set, sync, computed, setter, getter, createGetters, createState, MissingStoreError }
