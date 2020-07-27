import * as objectAccess from './object-access'
import TeddyStore, * as others from './store'

const { has, get, set, sync, computed, setter, getter, createGetters, createState, MissingStoreError } = others

export default TeddyStore
export { objectAccess, has, get, set, sync, computed, setter, getter, createGetters, createState, MissingStoreError }
