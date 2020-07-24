import VueCompositionApi, { computed, ref, watch } from '@vue/composition-api'
import { mount, createLocalVue } from '@vue/test-utils'
import Vue from 'vue'
import TeddyStore from '../../src/index'
import flushPromises from 'flush-promises'

Vue.use(VueCompositionApi)

// const store = new TeddyStore()
// localVue.use(store)

describe('TeddyStore.js', () => {
  it('should install the store under global variable $teddy', async () => {
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

  it('[createState(<state>)] should provide a computed { state } as a computed value', async () => {
    const localVue = createLocalVue()

    const store = new TeddyStore()
    localVue.use(store)

    const wrapper = mount(
      {
        template: `<div></div>`,
        computed: {
          state() {
            return TeddyStore.createState({ pages: [{ title: 'Test' }] })
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
            const state = TeddyStore.createState({ pages: [{ title: 'Test' }] })
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

    const state = {
      pages: [{ title: 'Once uppon a time' }],
    }

    const getters = {
      pageTitles: () => state.pages.map((page) => page.title),
    }

    localVue.use(store.add('pages', { state, getters }))

    const wrapper = mount(
      { template: `<div></div>` },
      {
        localVue,
      }
    )

    await flushPromises()

    wrapper.vm.$teddy.set('pages', 'pages.0.title', 'Once another time')
    await flushPromises()

    expect(wrapper.vm.$teddy.stores.pages.pageTitles.value).toEqual(['Once another time'])
  })

  it('[createGetters(<getters>)] should make sure getters are computed properties (when they are)', async () => {
    const localVue = createLocalVue()

    const store = new TeddyStore()

    const state = {
      pages: [{ title: 'Once uppon a time' }],
    }

    const getters = {
      pageTitles: computed(() => state.pages.map((page) => page.title)),
    }

    localVue.use(store.add('pages', { state, getters }))

    const wrapper = mount(
      { template: `<div></div>` },
      {
        localVue,
      }
    )

    await flushPromises()

    wrapper.vm.$teddy.set('pages', 'pages.0.title', 'Once another time')
    await flushPromises()

    expect(wrapper.vm.$teddy.stores.pages.pageTitles.value).toEqual(['Once another time'])
  })

  it(`[add(<name>, <store>)] should provide a computed { state } as a computed value for a module`, async () => {
    const localVue = createLocalVue()

    const store = new TeddyStore()

    localVue.use(
      store.add('pages', {
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

    expect(wrapper.vm.$teddy.stores.pages.state.value.pages[0].title).toMatch('Once uppon a time')
  })

  it(`[add(<name>, <store>)] should provide a computed { state } as a computed value for a module`, async () => {
    const localVue = createLocalVue()

    const store = new TeddyStore()

    localVue.use(
      store.add('pages', {
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

    wrapper.vm.$teddy.stores.pages.state.value.pages[0].title = 'New title'
    await flushPromises()

    expect(wrapper.vm.$teddy.stores.pages.state.value.pages[0].title).toMatch('New title')
  })

  it(`[add(<name>, <store>)] should register the watchers array`, async () => {
    const localVue = createLocalVue()

    const store = new TeddyStore()

    const state = ref({
      pages: [{ title: 'Once uppon a time' }],
      watched: 0,
    })

    localVue.use(
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

    const wrapper = mount(
      {
        template: `<div></div>`,
      },
      {
        localVue,
      }
    )
    await flushPromises()

    wrapper.vm.$teddy.stores.pages.state.value.pages[0].title = 'Other title'
    await flushPromises()

    expect(wrapper.vm.$teddy.stores.pages.state.value.watched).toEqual(2)
  })

  it(`[add(<name>, <store>)] should register a general watcher object`, async () => {
    const localVue = createLocalVue()

    const store = new TeddyStore()

    const state = ref({
      pages: [{ title: 'Once uppon a time' }],
    })

    let hit = false

    localVue.use(
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

    const wrapper = mount(
      {
        template: `<div></div>`,
      },
      {
        localVue,
      }
    )
    await flushPromises()

    wrapper.vm.$teddy.stores.pages.state.value.pages[0].title = 'Other title'
    await flushPromises()

    expect(hit).toEqual(true)
  })

  it(`[add(<name>, <store>)] should register a general watcher function`, async () => {
    const localVue = createLocalVue()

    const store = new TeddyStore()

    const state = ref({
      pages: [{ title: 'Once uppon a time' }],
    })

    let hit = false

    localVue.use(
      store.add('pages', {
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

    wrapper.vm.$teddy.stores.pages.state.value.pages[0].title = 'Other title'
    await flushPromises()

    expect(hit).toEqual(true)
  })

  it(`[add(<name>, <store>)] should register a watcher on several paths`, async () => {
    const localVue = createLocalVue()

    const store = new TeddyStore()

    const state = ref({
      pages: [{ title: 'Once uppon a time', subline: 'It was a time where...' }],
    })

    let hit = 0

    localVue.use(
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

    const wrapper = mount(
      {
        template: `<div></div>`,
      },
      {
        localVue,
      }
    )
    await flushPromises()

    wrapper.vm.$teddy.stores.pages.state.value.pages[0].title = 'Other title'
    await flushPromises()

    wrapper.vm.$teddy.stores.pages.state.value.pages[0].subline = 'Other subline'
    await flushPromises()

    expect(hit).toEqual(2)
  })

  it(`[static sync(<name>, <path>)] should provide a computed property to get/set a simple value `, async () => {
    const localVue = createLocalVue()

    const store = new TeddyStore()

    const state = {
      pages: [{ title: 'Once uppon a time' }],
    }

    localVue.use(store.add('pages', { state }))

    const wrapper = mount(
      {
        template: `<div></div>`,
        setup(_, { root }) {
          const pages0 = computed(TeddyStore.sync('pages', 'pages.0', root))
          return { pages0 }
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
    expect(wrapper.vm.$teddy.stores.pages.state.value.pages[0].title).toMatch('New title')
  })

  it(`[sync(<name>, <path>)] should provide a computed property to get/set a simple value`, async () => {
    const localVue = createLocalVue()

    const store = new TeddyStore()

    localVue.use(
      store.add('pages', {
        state: ref({
          pages: [{ title: 'Once uppon a time' }],
        }),
      })
    )

    const wrapper = mount(
      {
        template: `<div></div>`,
        setup() {
          let pages0 = computed(store.sync('pages', 'pages.0'))
          return { pages0 }
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
    expect(wrapper.vm.$teddy.stores.pages.state.value.pages[0].title).toMatch('New title')
  })

  it(`[sync(<name>, <path>)] should provide a computed property to get/set a value with a variable`, async () => {
    const localVue = createLocalVue()

    const store = new TeddyStore()

    localVue.use(
      store.add('agents', {
        state: ref({
          agents: [{ name: 'Joe', title: 'seller' }],
        }),
      })
    )

    const wrapper = mount(
      {
        template: `<div></div>`,
        data: () => ({ name: 'Joe' }),
        computed: {
          pages0: store.sync('agents', `agents.name={name}`),
        },
      },
      {
        localVue,
      }
    )
    await flushPromises()

    wrapper.vm.pages0.title = 'craftsman'
    await flushPromises()

    expect(wrapper.vm.$teddy.stores.agents.state.value.agents[0].title).toMatch('craftsman')
  })

  it(`[static get(<name>, <path>)] should get a value at path`, () => {
    const localVue = createLocalVue()

    const store = new TeddyStore()

    localVue.use(
      store.add('pages', {
        state: ref({
          pages: [{ title: 'Once uppon a time' }],
        }),
      })
    )

    mount(
      {
        template: `<div></div>`,
        setup(_, { root }) {
          expect(TeddyStore.get('pages', 'pages.0.title', root)).toMatch('Once uppon a time')
        },
      },
      {
        localVue,
      }
    )
  })

  it(`[get(<name>, <path>)] should get a value at path`, () => {
    const localVue = createLocalVue()

    const store = new TeddyStore()

    localVue.use(
      store.add('pages', {
        state: ref({
          pages: [{ title: 'Once uppon a time' }],
        }),
      })
    )

    mount(
      {
        template: `<div></div>`,
        setup() {
          expect(store.get('pages', 'pages.0.title')).toMatch('Once uppon a time')
        },
      },
      {
        localVue,
      }
    )
  })

  it(`[static set(<name>, <path>)] should set a value at path`, async () => {
    const localVue = createLocalVue()

    const store = new TeddyStore()

    localVue.use(
      store.add('pages', {
        state: ref({
          pages: [{ title: 'Once uppon a time' }],
        }),
      })
    )

    const wrapper = mount(
      {
        template: `<div></div>`,
        setup(_, { root }) {
          TeddyStore.set('pages', 'pages.0.title', 'Another title', root)
        },
      },
      {
        localVue,
      }
    )
    await flushPromises()

    expect(wrapper.vm.$teddy.stores.pages.state.value.pages[0].title).toMatch('Another title')
  })

  it(`[set(<name>, <path>)] should set a value at path`, async () => {
    const localVue = createLocalVue()

    const store = new TeddyStore()

    localVue.use(
      store.add('pages', {
        state: ref({
          pages: [{ title: 'Once uppon a time' }],
        }),
      })
    )

    const wrapper = mount(
      {
        template: `<div></div>`,
        setup() {
          store.set('pages', 'pages.0.title', 'Another title')
        },
      },
      {
        localVue,
      }
    )
    await flushPromises()

    expect(wrapper.vm.$teddy.stores.pages.state.value.pages[0].title).toMatch('Another title')
  })

  it(`[static getter(<name>, <path>)] should provide a getter for a simple value`, async () => {
    const localVue = createLocalVue()

    const store = new TeddyStore()

    localVue.use(
      store.add('pages', {
        state: ref({
          pages: [{ title: 'Once uppon a time' }],
        }),
      })
    )

    const wrapper = mount(
      {
        template: `<div></div>`,
        setup(_, { root }) {
          let pages0 = computed(TeddyStore.getter('pages', 'pages.0', root))
          return { pages0 }
        },
      },
      {
        localVue,
      }
    )
    await flushPromises()

    expect(wrapper.vm.pages0.title).toMatch('Once uppon a time')
    expect(wrapper.vm.$teddy.stores.pages.state.value.pages[0].title).toMatch('Once uppon a time')
  })

  it(`[getter(<name>, <path>)] should provide a getter for a simple value`, async () => {
    const localVue = createLocalVue()

    const store = new TeddyStore()

    const state = ref({
      pages: [{ title: 'Once uppon a time' }],
    })

    localVue.use(
      store.add('pages', {
        state,
      })
    )

    const wrapper = mount(
      {
        template: `<div></div>`,
        setup() {
          let pages0 = computed(store.getter('pages', 'pages.0'))
          return { pages0 }
        },
      },
      {
        localVue,
      }
    )
    await flushPromises()

    expect(wrapper.vm.pages0.title).toMatch('Once uppon a time')
    expect(wrapper.vm.$teddy.stores.pages.state.value.pages[0].title).toMatch('Once uppon a time')
  })

  it(`[static setter(<name>, <path>)] should provide a setter for a simple value`, async () => {
    const localVue = createLocalVue()

    const store = new TeddyStore()

    localVue.use(
      store.add('pages', {
        state: ref({
          pages: [{ title: 'Once uppon a time' }],
        }),
      })
    )

    const wrapper = mount(
      {
        template: `<div></div>`,
        setup(_, { root }) {
          const pages0 = computed({
            get() {
              return root.$teddy.stores.pages.state.value.pages[0]
            },
            set: store.setter('pages', 'pages.0', root),
          })
          return { pages0 }
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
    expect(wrapper.vm.$teddy.stores.pages.state.value.pages[0].title).toEqual('Brand new title')
  })

  it(`[set(<name>, <path>)] should provide a setter for a simple value`, async () => {
    const localVue = createLocalVue()

    const store = new TeddyStore()

    const state = ref({
      pages: [{ title: 'Once uppon a time' }],
    })

    localVue.use(store.add('pages', { state }))

    const wrapper = mount(
      {
        template: `<div></div>`,
        setup() {
          let pages0 = computed({
            get() {
              return store.stores.pages.state.value.pages[0]
            },
            set: store.setter('pages', 'pages.0'),
          })
          return { pages0 }
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
    expect(wrapper.vm.$teddy.stores.pages.state.value.pages[0].title).toEqual('Brand new title')
  })

  it(`[use(<plugin>)] should allow watching mutations via a plugin`, async () => {
    const localVue = createLocalVue()

    const store = new TeddyStore()

    localVue.use(
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

    const wrapper = mount(
      {
        template: `<div></div>`,
      },
      {
        localVue,
      }
    )
    await flushPromises()

    expect(wrapper.vm.$teddy.stores.pages.state.value.pages[0].title).toMatch('ONCE UPPON A TIME')
  })

  it(`should display a state property in template`, async () => {
    const localVue = createLocalVue()

    const store = new TeddyStore()

    localVue.use(
      store.add('user', {
        state: ref({
          firstName: 'Teddy',
          lastName: 'Bear',
        }),
      })
    )

    const wrapper = mount(
      {
        template: `<div>{{$teddy.stores.user.state.value.firstName}}</div>`,
      },
      {
        localVue,
      }
    )
    await flushPromises()

    expect(wrapper.text()).toEqual('Teddy')
  })

  // it(`should display a computed property (defined in methods) in template`, async () => {
  //   const state = ref({
  //     firstName: 'Teddy',
  //     lastName: 'Bear',
  //   })

  //   localVue.use(
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
  //
  //   expect(wrapper.text()).toEqual('Ted Bear')
  // })

  it(`should have its stores also availabe as root properties`, async () => {
    const localVue = createLocalVue()

    const store = new TeddyStore()

    localVue.use(
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

    const wrapper = mount(
      { template: `<div></div>` },
      {
        localVue,
      }
    )
    await flushPromises()

    expect(wrapper.vm.$teddy.user).toEqual(wrapper.vm.$teddy.stores.user)
    expect(wrapper.vm.$teddy.auth).toEqual(wrapper.vm.$teddy.stores.auth)
  })
})
