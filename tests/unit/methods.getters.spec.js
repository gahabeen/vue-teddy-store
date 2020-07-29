import { makeGetters, setState, setGetters } from '@/index'
import VueCompositionApi from '@vue/composition-api'
import { nanoid } from 'nanoid'
import Vue from 'vue'

Vue.use(VueCompositionApi)

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
})
