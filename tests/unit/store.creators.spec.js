import TeddyStore, { createState } from '@/index'
import VueCompositionApi, { computed } from '@vue/composition-api'
import { createLocalVue, mount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vue from 'vue'
import { nanoid } from 'nanoid'

Vue.use(VueCompositionApi)

describe('Store, Creators [Common]', () => {
  it('[createState(<state>)] should provide a computed { state } as a computed value', async () => {
    const localVue = createLocalVue()
    const store = new TeddyStore()
    localVue.use(store)

    const wrapper = mount(
      {
        template: `<div></div>`,
        computed: {
          state() {
            return createState({ pages: [{ title: 'Test' }] })
          },
        },
      },
      {
        localVue,
      }
    )

    await flushPromises()
    expect(wrapper.vm.state.value.pages[0].title).toMatch('Test')
  })

  it('[createState(<state>)] should provide a computed { state } as a ref()', async () => {
    const localVue = createLocalVue()
    const store = new TeddyStore()
    localVue.use(store)

    const wrapper = mount(
      {
        template: `<div></div>`,
        computed: {
          state() {
            const state = createState({ pages: [{ title: 'Test' }] })
            state.value.pages[0].title = 'NewName'
            return state
          },
        },
      },
      {
        localVue,
      }
    )

    await flushPromises()
    expect(wrapper.vm.state.value.pages[0].title).toMatch('NewName')
  })

  it('[createGetters(<getters>)] should make sure getters are computed properties (when they arnt)', async () => {
    const localVue = createLocalVue()
    const store = new TeddyStore()
    const storeName = nanoid()

    const state = {
      pages: [{ title: 'Once uppon a time' }],
    }

    const getters = {
      pageTitles: () => state.pages.map((page) => page.title),
    }

    localVue.use(store.add(storeName, { state, getters }))

    const wrapper = mount(
      { template: `<div></div>` },
      {
        localVue,
      }
    )

    await flushPromises()

    wrapper.vm.$teddy.set(storeName + '.pages.0.title', 'Once another time')
    await flushPromises()

    expect(wrapper.vm.$teddy.stores[storeName].pageTitles.value).toEqual(['Once another time'])
  })

  it('[createGetters(<getters>)] should make sure getters are computed properties (when they are)', async () => {
    const localVue = createLocalVue()
    const store = new TeddyStore()
    const storeName = nanoid()

    const state = {
      pages: [{ title: 'Once uppon a time' }],
    }

    const getters = {
      pageTitles: computed(() => state.pages.map((page) => page.title)),
    }

    localVue.use(store.add(storeName, { state, getters }))

    const wrapper = mount(
      { template: `<div></div>` },
      {
        localVue,
      }
    )

    await flushPromises()

    wrapper.vm.$teddy.set(storeName + '.pages.0.title', 'Once another time')
    await flushPromises()

    expect(wrapper.vm.$teddy.stores[storeName].pageTitles.value).toEqual(['Once another time'])
  })
})
