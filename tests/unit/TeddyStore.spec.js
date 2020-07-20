import VueCompositionApi, { computed, reactive, watch } from '@vue/composition-api'
import { mount } from '@vue/test-utils'
import Vue from 'vue'
import TeddyStore from '../../src/index'
import flushPromises from 'flush-promises'
Vue.use(VueCompositionApi)

// const localVue = createLocalVue()
// localVue.use(VueCompositionApi)

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
          const { state } = TeddyStore.createState({ pages: [{ title: 'Test' }] })
          return state
        },
      },
    })
    expect(wrapper.vm.state.value.pages[0].title).toMatch('Test')
  })

  it('[createState(<state>)] should provide a computed { _state } as a ref()', () => {
    const wrapper = mount({
      template: `<div></div>`,
      computed: {
        state() {
          const { _state } = TeddyStore.createState({ pages: [{ title: 'Test' }] })
          _state.value.pages[0].title = 'NewName'
          return _state
        },
      },
    })
    expect(wrapper.vm.state.value.pages[0].title).toMatch('NewName')
  })

  it(`[add(<name>, <store>)] should provide a computed { state } as a computed value for a module uppon`, () => {
    Vue.use(
      store.add('pages', {
        state: {
          pages: [{ title: 'Once uppon a time' }],
        },
      })
    )

    const wrapper = mount({
      template: `<div></div>`,
    })

    expect(wrapper.vm.$teddy.stores.pages.state.pages[0].title).toMatch('Once uppon a time')
  })

  it(`[add(<name>, <store>)] should provide a computed { _state } as a computed value for a module`, () => {
    Vue.use(
      store.add('pages', {
        state: {
          pages: [{ title: 'Once uppon a time' }],
        },
      })
    )

    const wrapper = mount({
      template: `<div></div>`,
    })
    wrapper.vm.$teddy.stores.pages._state.pages[0].title = 'New title'
    expect(wrapper.vm.$teddy.stores.pages._state.pages[0].title).toMatch('New title')
  })

  it(`[add(<name>, <store>)] should register the watchers array`, async () => {
    const state = reactive({
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
              state.watched += 1
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

    wrapper.vm.$teddy.stores.pages._state.pages[0].title = 'Other title'
    await flushPromises()

    expect(wrapper.vm.$teddy.stores.pages.state.watched).toEqual(2)
  })

  it(`[add(<name>, <store>)] should register a general watcher object`, async () => {
    const state = reactive({
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
    wrapper.vm.$teddy.stores.pages._state.pages[0].title = 'Other title'
    await flushPromises()

    expect(hit).toEqual(true)
  })

  it(`[add(<name>, <store>)] should register a general watcher function`, async () => {
    const state = reactive({
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
    wrapper.vm.$teddy.stores.pages._state.pages[0].title = 'Other title'
    await flushPromises()

    expect(hit).toEqual(true)
  })

  it(`[add(<name>, <store>)] should register a watcher on several paths`, async () => {
    const state = reactive({
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
    wrapper.vm.$teddy.stores.pages._state.pages[0].title = 'Other title'
    await flushPromises()
    wrapper.vm.$teddy.stores.pages._state.pages[0].subline = 'Other subline'
    await flushPromises()

    expect(hit).toEqual(2)
  })

  it(`[static compute(<name>, <path>)] should provide a computed property to get/set a simple value `, () => {
    Vue.use(
      store.add('pages', {
        state: {
          pages: [{ title: 'Once uppon a time' }],
        },
      })
    )

    const wrapper = mount({
      template: `<div></div>`,
      computed: {
        pages0: TeddyStore.compute('pages', 'pages.0'),
      },
    })

    wrapper.vm.pages0 = { title: 'New title' }

    expect(wrapper.vm.pages0.title).toMatch('New title')
    expect(wrapper.vm.$teddy.stores.pages.state.pages[0].title).toMatch('New title')
  })

  it(`[compute(<name>, <path>)] should provide a computed property to get/set a simple value`, () => {
    Vue.use(
      store.add('pages', {
        state: {
          pages: [{ title: 'Once uppon a time' }],
        },
      })
    )

    const wrapper = mount({
      template: `<div></div>`,
      computed: {
        pages0: store.compute('pages', 'pages.0'),
      },
    })

    wrapper.vm.pages0 = { title: 'New title' }

    expect(wrapper.vm.pages0.title).toMatch('New title')
    expect(wrapper.vm.$teddy.stores.pages.state.pages[0].title).toMatch('New title')
  })

  it(`[static get(<name>, <path>)] should provide a getter for a simple value`, () => {
    Vue.use(
      store.add('pages', {
        state: {
          pages: [{ title: 'Once uppon a time' }],
        },
      })
    )

    const wrapper = mount({
      template: `<div></div>`,
      computed: {
        pages0: TeddyStore.get('pages', 'pages.0'),
      },
    })
    expect(wrapper.vm.pages0.title).toMatch('Once uppon a time')
    expect(wrapper.vm.$teddy.stores.pages.state.pages[0].title).toMatch('Once uppon a time')
  })

  it(`[get(<name>, <path>)] should provide a getter for a simple value`, () => {
    Vue.use(
      store.add('pages', {
        state: {
          pages: [{ title: 'Once uppon a time' }],
        },
      })
    )

    const wrapper = mount({
      template: `<div></div>`,
      computed: {
        pages0: store.get('pages', 'pages.0'),
      },
    })
    expect(wrapper.vm.pages0.title).toMatch('Once uppon a time')
    expect(wrapper.vm.$teddy.stores.pages.state.pages[0].title).toMatch('Once uppon a time')
  })

  it(`[static set(<name>, <path>)] should provide a setter for a simple value`, () => {
    Vue.use(
      store.add('pages', {
        state: {
          pages: [{ title: 'Once uppon a time' }],
        },
      })
    )

    const wrapper = mount({
      template: `<div></div>`,
      computed: {
        pages0: {
          get() {
            return this.$teddy.stores.pages.state.pages[0]
          },
          set: TeddyStore.set('pages', 'pages.0'),
        },
      },
    })
    wrapper.vm.pages0 = { title: 'Brand new title' }
    expect(wrapper.vm.pages0.title).toEqual('Brand new title')
    expect(wrapper.vm.$teddy.stores.pages.state.pages[0].title).toEqual('Brand new title')
  })

  it(`[set(<name>, <path>)] should provide a setter for a simple value`, () => {
    Vue.use(
      store.add('pages', {
        state: {
          pages: [{ title: 'Once uppon a time' }],
        },
      })
    )

    const wrapper = mount({
      template: `<div></div>`,
      computed: {
        pages0: {
          get() {
            return this.$teddy.stores.pages.state.pages[0]
          },
          set: store.set('pages', 'pages.0'),
        },
      },
    })
    wrapper.vm.pages0 = { title: 'Brand new title' }
    expect(wrapper.vm.pages0.title).toEqual('Brand new title')
    expect(wrapper.vm.$teddy.stores.pages.state.pages[0].title).toEqual('Brand new title')
  })

  it(`[use(<plugin>)] should allow watching mutations via a plugin`, () => {
    Vue.use(
      store
        .add('pages', {
          state: {
            pages: [{ title: 'Once uppon a time' }],
          },
        })
        .use({
          handle({ name, store }) {
            watch(
              store._state,
              (newState) => {
                if (name === 'pages') {
                  store._state.pages[0].title = newState.pages[0].title.toUpperCase()
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

    expect(wrapper.vm.$teddy.stores.pages.state.pages[0].title).toMatch('ONCE UPPON A TIME')
  })

  it(`should display a state property in template`, () => {
    Vue.use(
      store.add('user', {
        state: {
          firstName: 'Teddy',
          lastName: 'Bear',
        },
      })
    )

    const wrapper = mount({
      template: `<div>{{$teddy.stores.user.state.firstName}}</div>`,
    })
    expect(wrapper.text()).toEqual('Teddy')
  })

  it(`should display a computed property (defined in methods) in template`, async () => {
    const state = reactive({
      firstName: 'Teddy',
      lastName: 'Bear',
    })

    Vue.use(
      store.add('user', {
        state,
        methods: {
          get fullName() {
            return computed(() => state.firstName + ' ' + state.lastName)
          },
        },
      })
    )

    const wrapper = mount({
      template: `<div>{{$teddy.stores.user.fullName}}</div>`,
      beforeMount() {
        this.$teddy.stores.user._state.firstName = 'Ted'
      },
    })
    await flushPromises()
    expect(wrapper.text()).toEqual('Ted Bear')
  })
})
