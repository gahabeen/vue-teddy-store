import { makeGetters, setState, setGetters } from '@/index'
import VueCompositionApi from '@vue/composition-api'
import flushPromises from 'flush-promises'
import { nanoid } from 'nanoid'
import Vue from 'vue'

Vue.use(VueCompositionApi)

Vue.config.productionTip = false
Vue.config.devtools = false

describe('methods - getters', () => {
  it('makeGetters() should create standalone getters based on functions', async () => {
    const space = nanoid()
    const name = nanoid()
    const getters = makeGetters(
      { space, name },
      {
        addition: () => 1 + 1,
      }
    )
    expect(getters.addition.value).toBe(2)
  })

  it('makeGetters() should create getters depending on state based on functions', async () => {
    const space = nanoid()
    const name = nanoid()
    const state = {
      firstName: 'Teddy',
      lastName: 'Bear',
    }
    setState({ space, name }, state)
    const fullName = (_state) => _state.firstName + ' ' + _state.lastName
    const getters = makeGetters(
      { space, name },
      {
        fullName: ({ state }) => fullName(state),
      }
    )
    expect(getters.fullName.value).toBe(fullName(state))
  })

  it('makeGetters() should create getters depending on inputs', async () => {
    const space = nanoid()
    const name = nanoid()
    const state = {
      age: 18,
    }
    setState({ space, name }, state)

    const getters = makeGetters(
      { space, name },
      {
        ageLimit: ({ state }, { gap }) => state.age + gap,
      }
    )
    expect(getters.ageLimit({ gap: 3 }).value).toBe(state.age + 3)
  })

  it('setGetters() should set standalone getters based on functions', async () => {
    const space = nanoid()
    const name = nanoid()
    const store = setGetters(
      { space, name },
      {
        addition: () => 1 + 1,
      }
    )
    expect(store.getters.addition.value).toBe(2)
  })

  it('setGetters() should set getters depending on state based on functions', async () => {
    const space = nanoid()
    const name = nanoid()
    const state = {
      firstName: 'Teddy',
      lastName: 'Bear',
    }
    setState({ space, name }, state)
    const fullName = (_state) => _state.firstName + ' ' + _state.lastName
    const store = setGetters(
      { space, name },
      {
        fullName: ({ state }) => fullName(state),
      }
    )
    expect(store.getters.fullName.value).toBe(fullName(state))
  })

  it('setGetters() should set getters in cache when based on parameters', async () => {
    const space = nanoid()
    const name = nanoid()
    const state = {
      items: {
        1: 'on',
        2: 'two',
      },
    }
    setState({ space, name }, state)
    const store = setGetters(
      { space, name },
      {
        item: ({ state }, { id }) => state[id],
      }
    )

    store.getters.item({ id: 1 })
    store.getters.item({ id: 2 })
    store.getters.item({ id: 1 })
    store.getters.item({ id: 1 })
    store.getters.item({ id: 2 })
    store.getters.item({ id: 2 })
    await flushPromises()
    expect(Object.keys(store.getters).length).toBe(3)
  })

  it('setGetters() should set getters in cache when based on several parameters', async () => {
    const space = nanoid()
    const name = nanoid()
    const state = {
      items: [
        {
          id: 1,
          name: 'one',
        },
        {
          id: 2,
          name: 'two',
        },
      ],
    }
    setState({ space, name }, state)
    const store = setGetters(
      { space, name },
      {
        item: ({ state }, { id, name }) => state.items.find((item) => item.id === id && item.name === name),
      }
    )

    store.getters.item({ id: 1, name: 'one' })
    store.getters.item({ id: 2, name: 'two' })
    store.getters.item({ id: 1, name: 'one' })
    store.getters.item({ id: 1, name: 'one' })
    store.getters.item({ id: 1, name: 'one' })
    store.getters.item({ id: 2, name: 'two' })
    await flushPromises()
    expect(Object.keys(store.getters).length).toBe(3)
  })
})
