import { makeGetters, setState, setGetters } from '@/index'

import { nanoid } from 'nanoid'







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
})
