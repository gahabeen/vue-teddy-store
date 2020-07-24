import VueCompositionApi, { computed, ref, watch } from '@vue/composition-api'
import { mount } from '@vue/test-utils'
import Vue from 'vue'
import TeddyStore from '../../src/index'
import flushPromises from 'flush-promises'

Vue.use(VueCompositionApi)

const store = new TeddyStore()
Vue.use(store)

describe('TeddyStore.js', () => {
  it('should install the store under global variable $teddy', () => {
    const wrapper = mount({
      template: `<div></div>`,
    })

    expect(wrapper.vm.$teddy).toBeInstanceOf(TeddyStore)
  })

  it('[createState(<state>)] should provide a computed { state } as a computed value', () => {
    const wrapper = mount({
      template: `<div></div>`,
      computed: {
        state() {
          return TeddyStore.createState({ pages: [{ title: 'Test' }] })
        },
      },
    })
    expect(wrapper.vm.state.value.pages[0].title).toMatch('Test')
  })

  it('[createState(<state>)] should provide a computed { state } as a ref()', () => {
    const wrapper = mount({
      template: `<div></div>`,
      computed: {
        state() {
          const state = TeddyStore.createState({ pages: [{ title: 'Test' }] })
          state.value.pages[0].title = 'NewName'
          return state
        },
      },
    })
    expect(wrapper.vm.state.value.pages[0].title).toMatch('NewName')
  })

  it('[createGetters(<getters>)] should make sure getters are computed properties (when they arnt)', () => {
    const state = {
      pages: [{ title: 'Once uppon a time' }],
    }

    const getters = {
      pageTitles: () => state.pages.map((page) => page.title),
    }

    Vue.use(store.add('pages', { state, getters }))

    const wrapper = mount({
      template: `<div></div>`,
    })

    wrapper.vm.$teddy.set('pages', 'pages.0.title', 'Once another time')
    expect(wrapper.vm.$teddy.stores.pages.pageTitles.value).toEqual(['Once another time'])
  })

  it('[createGetters(<getters>)] should make sure getters are computed properties (when they are)', () => {
    const state = {
      pages: [{ title: 'Once uppon a time' }],
    }

    const getters = {
      pageTitles: computed(() => state.pages.map((page) => page.title)),
    }

    Vue.use(store.add('pages', { state, getters }))

    const wrapper = mount({
      template: `<div></div>`,
    })

    wrapper.vm.$teddy.set('pages', 'pages.0.title', 'Once another time')
    expect(wrapper.vm.$teddy.stores.pages.pageTitles.value).toEqual(['Once another time'])
  })

  it(`[add(<name>, <store>)] should provide a computed { state } as a computed value for a module`, async () => {
    Vue.use(
      store.add('pages', {
        state: ref({
          pages: [{ title: 'Once uppon a time' }],
        }),
      })
    )

    const wrapper = mount({
      template: `<div></div>`,
    })

    expect(wrapper.vm.$teddy.stores.pages.state.value.pages[0].title).toMatch('Once uppon a time')
  })

  it(`[add(<name>, <store>)] should provide a computed { state } as a computed value for a module`, async () => {
    Vue.use(
      store.add('pages', {
        state: ref({
          pages: [{ title: 'Once uppon a time' }],
        }),
      })
    )

    const wrapper = mount({
      template: `<div></div>`,
    })

    await flushPromises()
    wrapper.vm.$teddy.stores.pages.state.value.pages[0].title = 'New title'
    expect(wrapper.vm.$teddy.stores.pages.state.value.pages[0].title).toMatch('New title')
  })

  it(`[add(<name>, <store>)] should register the watchers array`, async () => {
    const state = ref({
      pages: [{ title: 'Once uppon a time' }],
      watched: 0,
    })

    Vue.use(
      store.add('pages', {
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

    const wrapper = mount({
      template: `<div></div>`,
    })

    wrapper.vm.$teddy.stores.pages.state.value.pages[0].title = 'Other title'
    await flushPromises()

    expect(wrapper.vm.$teddy.stores.pages.state.value.watched).toEqual(2)
  })

  it(`[add(<name>, <store>)] should register a general watcher object`, async () => {
    const state = ref({
      pages: [{ title: 'Once uppon a time' }],
    })

    let hit = false

    Vue.use(
      store.add('pages', {
        state,
        watcher: {
          handler() {
            hit = true
          },
          deep: true,
        },
      })
    )

    const wrapper = mount({
      template: `<div></div>`,
    })
    await flushPromises()
    wrapper.vm.$teddy.stores.pages.state.value.pages[0].title = 'Other title'
    await flushPromises()

    expect(hit).toEqual(true)
  })

  it(`[add(<name>, <store>)] should register a general watcher function`, async () => {
    const state = ref({
      pages: [{ title: 'Once uppon a time' }],
    })

    let hit = false

    Vue.use(
      store.add('pages', {
        state,
        watcher() {
          hit = true
        },
      })
    )

    const wrapper = mount({
      template: `<div></div>`,
    })
    await flushPromises()
    wrapper.vm.$teddy.stores.pages.state.value.pages[0].title = 'Other title'
    await flushPromises()

    expect(hit).toEqual(true)
  })

  it(`[add(<name>, <store>)] should register a watcher on several paths`, async () => {
    const state = ref({
      pages: [{ title: 'Once uppon a time', subline: 'It was a time where...' }],
    })

    let hit = 0

    Vue.use(
      store.add('pages', {
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

    const wrapper = mount({
      template: `<div></div>`,
    })
    await flushPromises()
    wrapper.vm.$teddy.stores.pages.state.value.pages[0].title = 'Other title'
    await flushPromises()
    wrapper.vm.$teddy.stores.pages.state.value.pages[0].subline = 'Other subline'
    await flushPromises()

    expect(hit).toEqual(2)
  })

  it(`[static sync(<name>, <path>)] should provide a computed property to get/set a simple value `, () => {
    const state = ref({
      pages: [{ title: 'Once uppon a time' }],
    })

    Vue.use(store.add('pages', { state }))

    const wrapper = mount({
      template: `<div></div>`,
      setup(_, { root }) {
        const pages0 = computed(TeddyStore.sync('pages', 'pages.0', root))
        return { pages0 }
      },
    })

    wrapper.vm.pages0 = { title: 'New title' }

    expect(wrapper.vm.pages0.title).toMatch('New title')
    expect(wrapper.vm.$teddy.stores.pages.state.value.pages[0].title).toMatch('New title')
  })

  it(`[sync(<name>, <path>)] should provide a computed property to get/set a simple value`, async () => {
    Vue.use(
      store.add('pages', {
        state: ref({
          pages: [{ title: 'Once uppon a time' }],
        }),
      })
    )

    await flushPromises()

    const wrapper = mount({
      template: `<div></div>`,
      setup() {
        let pages0 = computed(store.sync('pages', 'pages.0'))
        return { pages0 }
      },
    })

    wrapper.vm.pages0 = { title: 'New title' }
    expect(wrapper.vm.pages0.title).toMatch('New title')
    expect(wrapper.vm.$teddy.stores.pages.state.value.pages[0].title).toMatch('New title')
  })

  it(`[sync(<name>, <path>)] should provide a computed property to get/set a value with a variable`, async () => {
    Vue.use(
      store.add('agents', {
        state: ref({
          agents: [{ name: 'Joe', title: 'seller' }],
        }),
      })
    )

    const wrapper = mount({
      template: `<div></div>`,
      data: () => ({ name: 'Joe' }),
      computed: {
        pages0: store.sync('agents', `agents.name={name}`),
      },
    })

    wrapper.vm.pages0.title = 'craftsman'
    expect(wrapper.vm.$teddy.stores.agents.state.value.agents[0].title).toMatch('craftsman')
  })

  it(`[static get(<name>, <path>)] should get a value at path`, () => {
    Vue.use(
      store.add('pages', {
        state: ref({
          pages: [{ title: 'Once uppon a time' }],
        }),
      })
    )

    mount({
      template: `<div></div>`,
      setup(_, { root }) {
        expect(TeddyStore.get('pages', 'pages.0.title', root)).toMatch('Once uppon a time')
      },
    })
  })

  it(`[get(<name>, <path>)] should get a value at path`, () => {
    Vue.use(
      store.add('pages', {
        state: ref({
          pages: [{ title: 'Once uppon a time' }],
        }),
      })
    )

    mount({
      template: `<div></div>`,
      setup() {
        expect(store.get('pages', 'pages.0.title')).toMatch('Once uppon a time')
      },
    })
  })

  it(`[static set(<name>, <path>)] should set a value at path`, () => {
    Vue.use(
      store.add('pages', {
        state: ref({
          pages: [{ title: 'Once uppon a time' }],
        }),
      })
    )

    const wrapper = mount({
      template: `<div></div>`,
      setup(_, { root }) {
        TeddyStore.set('pages', 'pages.0.title', 'Another title', root)
      },
    })

    expect(wrapper.vm.$teddy.stores.pages.state.value.pages[0].title).toMatch('Another title')
  })

  it(`[set(<name>, <path>)] should set a value at path`, () => {
    Vue.use(
      store.add('pages', {
        state: ref({
          pages: [{ title: 'Once uppon a time' }],
        }),
      })
    )

    const wrapper = mount({
      template: `<div></div>`,
      setup() {
        store.set('pages', 'pages.0.title', 'Another title')
      },
    })

    expect(wrapper.vm.$teddy.stores.pages.state.value.pages[0].title).toMatch('Another title')
  })

  it(`[static getter(<name>, <path>)] should provide a getter for a simple value`, () => {
    Vue.use(
      store.add('pages', {
        state: ref({
          pages: [{ title: 'Once uppon a time' }],
        }),
      })
    )

    const wrapper = mount({
      template: `<div></div>`,
      setup(_, { root }) {
        let pages0 = computed(TeddyStore.getter('pages', 'pages.0', root))
        return { pages0 }
      },
    })

    expect(wrapper.vm.pages0.title).toMatch('Once uppon a time')
    expect(wrapper.vm.$teddy.stores.pages.state.value.pages[0].title).toMatch('Once uppon a time')
  })

  it(`[getter(<name>, <path>)] should provide a getter for a simple value`, async () => {
    const state = ref({
      pages: [{ title: 'Once uppon a time' }],
    })

    Vue.use(
      store.add('pages', {
        state,
      })
    )

    const wrapper = mount({
      template: `<div></div>`,
      setup() {
        let pages0 = computed(store.getter('pages', 'pages.0'))
        return { pages0 }
      },
    })

    await flushPromises()
    expect(wrapper.vm.pages0.title).toMatch('Once uppon a time')
    expect(wrapper.vm.$teddy.stores.pages.state.value.pages[0].title).toMatch('Once uppon a time')
  })

  it(`[static setter(<name>, <path>)] should provide a setter for a simple value`, () => {
    Vue.use(
      store.add('pages', {
        state: ref({
          pages: [{ title: 'Once uppon a time' }],
        }),
      })
    )

    const wrapper = mount({
      template: `<div></div>`,
      setup(_, { root }) {
        const pages0 = computed({
          get() {
            return this.$teddy.stores.pages.state.value.pages[0]
          },
          set: TeddyStore.setter('pages', 'pages.0', root),
        })
        return { pages0 }
      },
    })
    wrapper.vm.pages0 = { title: 'Brand new title' }
    expect(wrapper.vm.pages0.title).toEqual('Brand new title')
    expect(wrapper.vm.$teddy.stores.pages.state.value.pages[0].title).toEqual('Brand new title')
  })

  it(`[set(<name>, <path>)] should provide a setter for a simple value`, async () => {
    const state = ref({
      pages: [{ title: 'Once uppon a time' }],
    })

    Vue.use(store.add('pages', { state }))

    await flushPromises()

    const wrapper = mount({
      template: `<div></div>`,
      setup() {
        let pages0 = computed({
          get() {
            return store.stores.pages.state.value.pages[0]
          },
          // set(value) {
          //   store.stores.pages.state.value.pages[0] = value
          // },
          set: store.setter('pages', 'pages.0'),
        })
        return { pages0 }
      },
    })

    wrapper.vm.pages0 = { title: 'Brand new title' }
    expect(wrapper.vm.pages0.title).toEqual('Brand new title')
    expect(wrapper.vm.$teddy.stores.pages.state.value.pages[0].title).toEqual('Brand new title')
  })

  it(`[use(<plugin>)] should allow watching mutations via a plugin`, () => {
    Vue.use(
      store
        .add('pages', {
          state: ref({
            pages: [{ title: 'Once uppon a time' }],
          }),
        })
        .use({
          handle({ name, store }) {
            watch(
              store.state,
              (newState) => {
                if (name === 'pages') {
                  store.state.value.pages[0].title = newState.pages[0].title.toUpperCase()
                }
              },
              { immediate: true, deep: true }
            )
          },
        })
    )

    const wrapper = mount({
      template: `<div></div>`,
    })

    expect(wrapper.vm.$teddy.stores.pages.state.value.pages[0].title).toMatch('ONCE UPPON A TIME')
  })

  it(`should display a state property in template`, () => {
    Vue.use(
      store.add('user', {
        state: ref({
          firstName: 'Teddy',
          lastName: 'Bear',
        }),
      })
    )

    const wrapper = mount({
      template: `<div>{{$teddy.stores.user.state.value.firstName}}</div>`,
    })
    expect(wrapper.text()).toEqual('Teddy')
  })

  // it(`should display a computed property (defined in methods) in template`, async () => {
  //   const state = ref({
  //     firstName: 'Teddy',
  //     lastName: 'Bear',
  //   })

  //   Vue.use(
  //     store.add('user', {
  //       state,
  //       actions: {
  //         get fullName() {
  //           return computed(() => state.value.firstName + ' ' + state.value.lastName)
  //         },
  //       },
  //     })
  //   )

  //   const wrapper = mount({
  //     template: `<div>{{$teddy.stores.user.fullName.value}}</div>`,
  //     beforeMount() {
  //       this.$teddy.stores.user.state.value.firstName = 'Ted'
  //     },
  //   })
  //   await flushPromises()
  //   expect(wrapper.text()).toEqual('Ted Bear')
  // })

  it(`should have its stores also availabe as root properties`, async () => {
    Vue.use(
      store
        .add('user', {
          state: {
            firstName: 'Teddy',
            lastName: 'Bear',
          },
        })
        .add('auth', {
          state: {
            token: '123',
          },
        })
    )

    const wrapper = mount({
      template: `<div></div>`,
    })
    await flushPromises()
    expect(wrapper.vm.$teddy.user).toEqual(wrapper.vm.$teddy.stores.user)
    expect(wrapper.vm.$teddy.auth).toEqual(wrapper.vm.$teddy.stores.auth)
  })
})
