import { useTeddy, getTeddyStore, useTeddyStore, exists } from '@/index'
import VueCompositionApi from '@vue/composition-api'
import { nanoid } from 'nanoid'

import Vue from 'vue'
Vue.use(VueCompositionApi)

describe('methods - use', () => {
  it('useTeddy() should provide a by-default teddy namespaced instance', async () => {
    const name = nanoid()
    const teddy = useTeddy()
    teddy.setStore(name)
    expect(teddy.exists(name)).toBe(true)
  })

  it('useTeddyStore() should provide a by-default namespaced store (by-default namespaced)', async () => {
    getTeddyStore()
    useTeddyStore()
    expect(exists('$', '@')).toBe(true)
  })

  it('useTeddy() should provide a teddy namespaced instance', async () => {
    const space = nanoid()
    getTeddyStore(space)
    useTeddy(space)
    expect(exists(space)).toBe(true)
  })

  it('useTeddyStore() should provide a by-default namespaced store (by-default namespaced)', async () => {
    const space = nanoid()
    const name = nanoid()
    getTeddyStore({ space, name })
    useTeddyStore({ space, name })
    expect(exists({ space, name })).toBe(true)
  })
})
