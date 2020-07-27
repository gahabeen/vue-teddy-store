import TeddyStore from '@/index'
import VueCompositionApi, { ref, watch } from '@vue/composition-api'
import { createLocalVue, mount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vue from 'vue'
import { nanoid } from 'nanoid'

Vue.use(VueCompositionApi)

describe('Store, Installation [Common]', () => {
  it('should be available under global variable $teddy', async () => {
    const localVue = createLocalVue()
    const store = new TeddyStore()
    localVue.use(store)

    const wrapper = mount(
      { template: `<div></div>` },
      {
        localVue,
      }
    )

    await flushPromises()
    expect(wrapper.vm.$teddy).toBeInstanceOf(TeddyStore)
  })

  it(`[add(<name>, <store>)] should provide a computed { state } as a computed value for a module`, async () => {
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

    const wrapper = mount(
      { template: `<div></div>` },
      {
        localVue,
      }
    )
    await flushPromises()

    expect(wrapper.vm.$teddy.stores[storeName].state.value.pages[0].title).toMatch('Once uppon a time')
  })

  it(`[add(<name>, <store>)] should provide a computed { state } as a computed value for a module`, async () => {
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

    const wrapper = mount(
      { template: `<div></div>` },
      {
        localVue,
      }
    )
    await flushPromises()

    wrapper.vm.$teddy.stores[storeName].state.value.pages[0].title = 'New title'
    await flushPromises()

    expect(wrapper.vm.$teddy.stores[storeName].state.value.pages[0].title).toMatch('New title')
  })

  it(`[add(<name>, <store>)] should register the watchers array`, async () => {
    const localVue = createLocalVue()
    const store = new TeddyStore()
    const storeName = nanoid()

    const state = ref({
      pages: [{ title: 'Once uppon a time' }],
      watched: 0,
    })

    localVue.use(
      store.add(storeName, {
        state,
        watchers: [
          {
            path: 'pages',
            // handler(newState, oldSate) {
            handler() {
              state.value.watched += 1
            },
            immediate: true,
            deep: true,
          },
        ],
      })
    )

    const wrapper = mount(
      {
        template: `<div></div>`,
      },
      {
        localVue,
      }
    )
    await flushPromises()

    wrapper.vm.$teddy.stores[storeName].state.value.pages[0].title = 'Other title'
    await flushPromises()

    expect(wrapper.vm.$teddy.stores[storeName].state.value.watched).toEqual(2)
  })

  it(`[add(<name>, <store>)] should register a general watcher object`, async () => {
    const localVue = createLocalVue()
    const store = new TeddyStore()
    const storeName = nanoid()

    const state = ref({
      pages: [{ title: 'Once uppon a time' }],
    })

    let hit = false

    localVue.use(
      store.add(storeName, {
        state,
        watcher: {
          handler() {
            hit = true
          },
          deep: true,
        },
      })
    )

    const wrapper = mount(
      {
        template: `<div></div>`,
      },
      {
        localVue,
      }
    )
    await flushPromises()

    wrapper.vm.$teddy.stores[storeName].state.value.pages[0].title = 'Other title'
    await flushPromises()

    expect(hit).toEqual(true)
  })

  it(`[add(<name>, <store>)] should register a general watcher function`, async () => {
    const localVue = createLocalVue()
    const store = new TeddyStore()
    const storeName = nanoid()

    const state = ref({
      pages: [{ title: 'Once uppon a time' }],
    })

    let hit = false

    localVue.use(
      store.add(storeName, {
        state,
        watcher() {
          hit = true
        },
      })
    )

    const wrapper = mount(
      {
        template: `<div></div>`,
      },
      {
        localVue,
      }
    )
    await flushPromises()

    wrapper.vm.$teddy.stores[storeName].state.value.pages[0].title = 'Other title'
    await flushPromises()

    expect(hit).toEqual(true)
  })

  it(`[add(<name>, <store>)] should register a watcher on several paths`, async () => {
    const localVue = createLocalVue()
    const store = new TeddyStore()
    const storeName = nanoid()

    const state = ref({
      pages: [{ title: 'Once uppon a time', subline: 'It was a time where...' }],
    })

    let hit = 0

    localVue.use(
      store.add(storeName, {
        state,
        watchers: [
          {
            paths: ['pages.0.title', 'pages.0.subline'],
            handler([title, subline], [oldTitle, oldSubline]) {
              if (title !== oldTitle) hit += 1
              if (subline !== oldSubline) hit += 1
            },
            deep: true,
          },
        ],
      })
    )

    const wrapper = mount(
      {
        template: `<div></div>`,
      },
      {
        localVue,
      }
    )
    await flushPromises()

    wrapper.vm.$teddy.stores[storeName].state.value.pages[0].title = 'Other title'
    await flushPromises()

    wrapper.vm.$teddy.stores[storeName].state.value.pages[0].subline = 'Other subline'
    await flushPromises()

    expect(hit).toEqual(2)
  })

  it(`[use(<plugin>)] should allow watching mutations via a plugin`, async () => {
    const localVue = createLocalVue()
    const store = new TeddyStore()
    const storeName = nanoid()

    localVue.use(
      store
        .add(storeName, {
          state: ref({
            pages: [{ title: 'Once uppon a time' }],
          }),
        })
        .use({
          handle({ name, store }) {
            watch(
              store.state,
              (newState) => {
                if (name === storeName) {
                  store.state.value.pages[0].title = newState.pages[0].title.toUpperCase()
                }
              },
              { immediate: true, deep: true }
            )
          },
        })
    )

    const wrapper = mount(
      {
        template: `<div></div>`,
      },
      {
        localVue,
      }
    )
    await flushPromises()

    expect(wrapper.vm.$teddy.stores[storeName].state.value.pages[0].title).toMatch('ONCE UPPON A TIME')
  })

  it(`should have its stores also availabe as root properties`, async () => {
    const localVue = createLocalVue()
    const store = new TeddyStore()
    const storeNames = [nanoid(), nanoid()]

    localVue.use(
      store
        .add(storeNames[0], {
          state: {
            firstName: 'Teddy',
            lastName: 'Bear',
          },
        })
        .add(storeNames[1], {
          state: {
            token: '123',
          },
        })
    )

    const wrapper = mount(
      { template: `<div></div>` },
      {
        localVue,
      }
    )
    await flushPromises()

    expect(wrapper.vm.$teddy[storeNames[0]]).toEqual(wrapper.vm.$teddy.stores[storeNames[0]])
    expect(wrapper.vm.$teddy[storeNames[1]]).toEqual(wrapper.vm.$teddy.stores[storeNames[1]])
  })
})
