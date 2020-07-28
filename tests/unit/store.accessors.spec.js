import TeddyStore, { MissingStoreError } from '@/index'
import VueCompositionApi, { ref } from '@vue/composition-api'
import { createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import { nanoid } from 'nanoid'
import Vue from 'vue'
Vue.use(VueCompositionApi)

describe('Store, Accessors [Common]', () => {
  it(`[has(path, context?)] should check a path exists`, async () => {
    const localVue = createLocalVue()
    const store = new TeddyStore()

    const storeName = nanoid()

    localVue.use(
      store.add(storeName, {
        state: ref({
          pages: [{ title: 'Once uppon a time' }],
        }),
      })
    )

    await flushPromises()
    expect(store.has(`${storeName}.pages.0.title`)).toBe(true)
  })

  it(`[exported has(path, context?)] should check a path exists`, async () => {
    const localVue = createLocalVue()
    const store = new TeddyStore()

    const storeName = nanoid()

    localVue.use(
      store.add(storeName, {
        state: ref({
          pages: [{ title: 'Once uppon a time' }],
        }),
      })
    )

    const { has } = store.export()

    await flushPromises()
    expect(has(storeName + '.pages.0.title')).toBe(true)
  })

  // it(`[globally exported has(path, context?)] should check a path exists`, async () => {
  //   const localVue = createLocalVue()
  //   const store = new TeddyStore()

  //   const storeName = nanoid()

  //   localVue.use(
  //     store.add(storeName, {
  //       state: ref({
  //         pages: [{ title: 'Once uppon a time' }],
  //       }),
  //     })
  //   )

  //   await flushPromises()
  //   expect(has(storeName + '.pages.0.title')).toBe(true)
  // })

  it(`[has(path, context?)] should return undefined when store doesn't exists`, async () => {
    const store = new TeddyStore()
    expect(() => store.has('pages.pages.0.title')).toThrow(MissingStoreError)
  })

  it(`[get(path, context?)] should return undefined when store doesn't exists`, async () => {
    const store = new TeddyStore()
    expect(() => store.get('pages.pages.0.title')).toThrow(MissingStoreError)
  })

  it(`[set(path, context?)] should return undefined when store doesn't exists`, async () => {
    const store = new TeddyStore()
    expect(() => store.set('pages.pages.0.title')).toThrow(MissingStoreError)
  })
})
