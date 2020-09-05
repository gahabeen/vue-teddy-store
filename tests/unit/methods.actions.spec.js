import { makeActions, setState, setActions, run } from '@/index'
import VueCompositionApi from '@vue/composition-api'
import { nanoid } from 'nanoid'
import Vue from 'vue'

Vue.use(VueCompositionApi)

Vue.config.productionTip = false
Vue.config.devtools = false

describe('methods - actions', () => {
  it('makeActions() should create standalone actions based on functions', async () => {
    const space = nanoid()
    const name = nanoid()
    const actions = makeActions(
      { space, name },
      {
        addition: () => 1 + 1,
      }
    )
    expect(actions.addition()).toBe(2)
  })

  it('makeActions() should create actions depending on state based on functions', async () => {
    const space = nanoid()
    const name = nanoid()
    const state = {
      firstName: 'Teddy',
      lastName: 'Bear',
    }
    setState({ space, name }, state)
    const fullName = (_state) => _state.firstName + ' ' + _state.lastName
    const actions = makeActions(
      { space, name },
      {
        fullName: ({ state }) => fullName(state),
      }
    )
    expect(actions.fullName()).toBe(fullName(state))
  })

  it('setActions() should set standalone actions based on functions', async () => {
    const space = nanoid()
    const name = nanoid()
    const store = setActions(
      { space, name },
      {
        addition: () => 1 + 1,
      }
    )
    expect(store.actions.addition()).toBe(2)
  })

  it('setActions() should set actions depending on state based on functions', async () => {
    const space = nanoid()
    const name = nanoid()
    const state = {
      firstName: 'Teddy',
      lastName: 'Bear',
    }
    setState({ space, name }, state)
    const fullName = (_state) => _state.firstName + ' ' + _state.lastName
    const store = setActions(
      { space, name },
      {
        fullName: ({ state }) => fullName(state),
      }
    )
    expect(store.actions.fullName()).toBe(fullName(state))
  })

  it('run() should run the corresponding action with no arguments', async () => {
    const space = nanoid()
    const name = nanoid()
    const state = {
      firstName: 'Teddy',
      lastName: 'Bear',
    }
    setState({ space, name }, state)
    const fullName = (_state) => _state.firstName + ' ' + _state.lastName
    setActions(
      { space, name },
      {
        fullName: ({ state }) => fullName(state),
      }
    )
    expect(run({ space, name }, 'fullName')).toBe(fullName(state))
  })

  it('run() should run the corresponding action with one argument (not an array)', async () => {
    const space = nanoid()
    const name = nanoid()
    const state = {
      firstName: 'Teddy',
      lastName: 'Bear',
    }
    setState({ space, name }, state)
    const fullName = (_state, prefix) => prefix + ' ' + _state.firstName + ' ' + _state.lastName
    setActions(
      { space, name },
      {
        fullName: ({ state }, prefix) => fullName(state, prefix),
      }
    )
    expect(run({ space, name }, 'fullName', 'Mr')).toBe(fullName(state, 'Mr'))
  })
})
