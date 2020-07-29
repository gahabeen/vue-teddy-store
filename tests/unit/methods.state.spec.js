import { Teddies, setState, makeState } from '@/index'
import VueCompositionApi, { ref } from '@vue/composition-api'
import { nanoid } from 'nanoid'

import Vue from 'vue'
Vue.use(VueCompositionApi)

describe('methods - state', () => {
  it('makeState() should set provide a reactive (ref) state on raw object', async () => {
    const _state = makeState(null, {
      firstName: 'Teddy',
    })
    _state.value.firstName = 'Joe'
    expect(_state.value.firstName).toBe('Joe')
  })

  it('makeState() should simply use the given reactive (ref) state', async () => {
    const baseState = ref({
      firstName: 'Teddy',
    })
    const _state = makeState(null, baseState)
    _state.value.firstName = 'Joe'
    expect(baseState.value.firstName).toBe('Joe')
  })

  it('setState() should set a reactive state for space/store', async () => {
    const space = nanoid()
    const name = nanoid()
    setState(
      { space, name },
      {
        firstName: 'Teddy',
      }
    )
    expect(Teddies.value.spaces[space].stores[name].state.firstName).toBe('Teddy')
  })

  it('setState() should pass on a reactive state for space/store', async () => {
    const space = nanoid()
    const name = nanoid()
    setState(
      { space, name },
      ref({
        firstName: 'Teddy',
      })
    )
    expect(Teddies.value.spaces[space].stores[name].state.firstName).toBe('Teddy')
  })
})
