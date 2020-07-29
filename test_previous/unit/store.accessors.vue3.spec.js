import TeddyStore from '@/index'
import VueCompositionApi, { computed, ref } from '@vue/composition-api'
import { createLocalVue, mount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import { nanoid } from 'nanoid'
import Vue from 'vue'
Vue.use(VueCompositionApi)

describe('Store, Accessors [Vue 3]', () => {
  it(`[get(path, context?)] should get a value at path`, async () => {
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
      {
        template: `<div></div>`,
        setup() {
          return { title: store.get(storeName + '.pages.0.title') }
        },
      },
      {
        localVue,
      }
    )

    await flushPromises()
    expect(wrapper.vm.title).toMatch('Once uppon a time')
  })

  it(`[exported get(path, context?)] should get a value at path`, async () => {
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

    const { get } = store.export()

    const wrapper = mount(
      {
        template: `<div></div>`,
        setup() {
          return { title: get(storeName + '.pages.0.title') }
        },
      },
      {
        localVue,
      }
    )

    await flushPromises()
    expect(wrapper.vm.title).toMatch('Once uppon a time')
  })

  // it(`[globally exported get(path, context?)] should get a value at path`, async () => {
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

  //   const wrapper = mount(
  //     {
  //       template: `<div></div>`,
  //       setup() {
  //         return { title: get(storeName + '.pages.0.title') }
  //       },
  //     },
  //     {
  //       localVue,
  //     }
  //   )

  //   await flushPromises()
  //   expect(wrapper.vm.title).toMatch('Once uppon a time')
  // })

  it(`[set(path, context?)] should set a value at path`, async () => {
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
      {
        template: `<div></div>`,
        setup() {
          store.set(storeName + '.pages.0.title', 'Another title')
        },
      },
      {
        localVue,
      }
    )
    await flushPromises()

    expect(wrapper.vm.$teddy.stores[storeName].state.pages[0].title).toMatch('Another title')
  })

  it(`[exported set(path, context?)] should set a value at path`, async () => {
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

    const { set } = store.export()

    const wrapper = mount(
      {
        template: `<div></div>`,
        setup() {
          set(storeName + '.pages.0.title', 'Another title')
        },
      },
      {
        localVue,
      }
    )
    await flushPromises()

    expect(wrapper.vm.$teddy.stores[storeName].state.pages[0].title).toMatch('Another title')
  })

  // it(`[globally exported set(path, context?)] should set a value at path`, async () => {
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

  //   const wrapper = mount(
  //     {
  //       template: `<div></div>`,
  //       setup() {
  //         set(storeName + '.pages.0.title', 'Another title')
  //       },
  //     },
  //     {
  //       localVue,
  //     }
  //   )
  //   await flushPromises()

  //   expect(wrapper.vm.$teddy.stores[storeName].state.pages[0].title).toMatch('Another title')
  // })

  it(`[getter(path, context?)] should provide a getter for a simple value`, async () => {
    const localVue = createLocalVue()
    const store = new TeddyStore()
    const storeName = nanoid()

    const state = ref({
      pages: [{ title: 'Once uppon a time' }],
    })

    localVue.use(
      store.add(storeName, {
        state,
      })
    )

    const wrapper = mount(
      {
        template: `<div></div>`,
        setup() {
          return { pages0: computed(store.getter(storeName + '.pages.0')) }
        },
      },
      {
        localVue,
      }
    )
    await flushPromises()

    expect(wrapper.vm.pages0.title).toMatch('Once uppon a time')
    expect(wrapper.vm.$teddy.stores[storeName].state.pages[0].title).toMatch('Once uppon a time')
  })

  it(`[exported getter(path, context?)] should provide a getter for a simple value`, async () => {
    const localVue = createLocalVue()
    const store = new TeddyStore()
    const storeName = nanoid()

    const state = ref({
      pages: [{ title: 'Once uppon a time' }],
    })

    localVue.use(
      store.add(storeName, {
        state,
      })
    )

    const { getter } = store.export()

    const wrapper = mount(
      {
        template: `<div></div>`,
        setup() {
          return { pages0: computed(getter(storeName + '.pages.0')) }
        },
      },
      {
        localVue,
      }
    )
    await flushPromises()

    expect(wrapper.vm.pages0.title).toMatch('Once uppon a time')
    expect(wrapper.vm.$teddy.stores[storeName].state.pages[0].title).toMatch('Once uppon a time')
  })

  // it(`[globally exported getter(path, context?)] should provide a getter for a simple value`, async () => {
  //   const localVue = createLocalVue()
  //   const store = new TeddyStore()
  //   const storeName = nanoid()

  //   const state = ref({
  //     pages: [{ title: 'Once uppon a time' }],
  //   })

  //   localVue.use(
  //     store.add(storeName, {
  //       state,
  //     })
  //   )

  //   const wrapper = mount(
  //     {
  //       template: `<div></div>`,
  //       setup() {
  //         return { pages0: computed(getter(storeName + '.pages.0')) }
  //       },
  //     },
  //     {
  //       localVue,
  //     }
  //   )
  //   await flushPromises()

  //   expect(wrapper.vm.pages0.title).toMatch('Once uppon a time')
  //   expect(wrapper.vm.$teddy.stores[storeName].state.pages[0].title).toMatch('Once uppon a time')
  // })

  it(`[setter(path, context?)] should provide a setter for a simple value`, async () => {
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
      {
        template: `<div></div>`,
        setup(_, { root: { $teddy } }) {
          return {
            pages0: computed({
              get() {
                return $teddy.stores[storeName].state.pages[0]
              },
              set: store.setter(storeName + '.pages.0'),
            }),
          }
        },
      },
      {
        localVue,
      }
    )
    await flushPromises()

    wrapper.vm.pages0 = { title: 'Brand new title' }
    await flushPromises()

    expect(wrapper.vm.pages0.title).toEqual('Brand new title')
    expect(wrapper.vm.$teddy.stores[storeName].state.pages[0].title).toEqual('Brand new title')
  })

  it(`[exported setter(path, context?)] should provide a setter for a simple value`, async () => {
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

    const { setter } = store.export()

    const wrapper = mount(
      {
        template: `<div></div>`,
        setup(_, { root: { $teddy } }) {
          return {
            pages0: computed({
              get() {
                return $teddy.stores[storeName].state.pages[0]
              },
              set: setter(storeName + '.pages.0'),
            }),
          }
        },
      },
      {
        localVue,
      }
    )
    await flushPromises()

    wrapper.vm.pages0 = { title: 'Brand new title' }
    await flushPromises()

    expect(wrapper.vm.pages0.title).toEqual('Brand new title')
    expect(wrapper.vm.$teddy.stores[storeName].state.pages[0].title).toEqual('Brand new title')
  })

  // it(`[globally exported setter(path, context?)] should provide a setter for a simple value`, async () => {
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

  //   const wrapper = mount(
  //     {
  //       template: `<div></div>`,
  //       setup(_, { root: { $teddy } }) {
  //         return {
  //           pages0: computed({
  //             get() {
  //               return $teddy.stores[storeName].state.pages[0]
  //             },
  //             set: setter(storeName + '.pages.0'),
  //           }),
  //         }
  //       },
  //     },
  //     {
  //       localVue,
  //     }
  //   )
  //   await flushPromises()

  //   wrapper.vm.pages0 = { title: 'Brand new title' }
  //   await flushPromises()

  //   expect(wrapper.vm.pages0.title).toEqual('Brand new title')
  //   expect(wrapper.vm.$teddy.stores[storeName].state.pages[0].title).toEqual('Brand new title')
  // })

  it(`[sync(path, context?)] should provide a computed property to get/set a simple value`, async () => {
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
      {
        template: `<div></div>`,
        setup() {
          return { pages0: computed(store.sync(storeName + '.pages.0')) }
        },
      },
      {
        localVue,
      }
    )
    await flushPromises()

    wrapper.vm.pages0 = { title: 'New title' }
    await flushPromises()

    expect(wrapper.vm.pages0.title).toMatch('New title')
    expect(wrapper.vm.$teddy.stores[storeName].state.pages[0].title).toMatch('New title')
  })

  it(`[exported sync(path, context?)] should provide a computed property to get/set a simple value`, async () => {
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

    const { sync } = store.export()
    const wrapper = mount(
      {
        template: `<div></div>`,
        setup() {
          return { pages0: computed(sync(storeName + '.pages.0')) }
        },
      },
      {
        localVue,
      }
    )
    await flushPromises()

    wrapper.vm.pages0 = { title: 'New title' }
    await flushPromises()

    expect(wrapper.vm.pages0.title).toMatch('New title')
    expect(wrapper.vm.$teddy.stores[storeName].state.pages[0].title).toMatch('New title')
  })

  // it(`[globally exported sync(path, context?)] should provide a computed property to get/set a simple value`, async () => {
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

  //   const wrapper = mount(
  //     {
  //       template: `<div></div>`,
  //       setup() {
  //         return { pages0: computed(sync(storeName + '.pages.0')) }
  //       },
  //     },
  //     {
  //       localVue,
  //     }
  //   )
  //   await flushPromises()

  //   wrapper.vm.pages0 = { title: 'New title' }
  //   await flushPromises()

  //   expect(wrapper.vm.pages0.title).toMatch('New title')
  //   expect(wrapper.vm.$teddy.stores[storeName].state.pages[0].title).toMatch('New title')
  // })

  it(`[sync(path (as array), context?)] should provide an object of computed get/set properties`, async () => {
    const localVue = createLocalVue()
    const store = new TeddyStore()
    const storeName = nanoid()

    const state = {
      pages: [{ title: 'Once uppon a time', score: 3 }],
    }

    localVue.use(
      store.add(storeName, {
        state,
      })
    )

    const wrapper = mount(
      {
        template: `<div></div>`,
        setup() {
          return { ...store.computed(store.sync([`${storeName}.pages.0.title`, `${storeName}.pages.0.score`])) }
        },
      },
      {
        localVue,
      }
    )

    await flushPromises()

    expect(wrapper.vm[`${storeName}.pages.0.title`]).toBe(state.pages[0].title)
    expect(wrapper.vm[`${storeName}.pages.0.score`]).toBe(state.pages[0].score)
  })

  it(`[sync(path (as object), context?)] should provide an object of computed get/set properties`, async () => {
    const localVue = createLocalVue()
    const store = new TeddyStore()
    const storeName = nanoid()

    const state = {
      pages: [{ title: 'Once uppon a time', score: 3 }],
    }

    localVue.use(
      store.add(storeName, {
        state,
      })
    )

    const wrapper = mount(
      {
        template: `<div></div>`,
        setup() {
          return { ...store.computed(store.sync({ title: `${storeName}.pages.0.title`, score: `${storeName}.pages.0.score` })) }
        },
      },
      {
        localVue,
      }
    )

    await flushPromises()

    expect(wrapper.vm.title).toBe(state.pages[0].title)
    expect(wrapper.vm.score).toBe(state.pages[0].score)
  })
})
