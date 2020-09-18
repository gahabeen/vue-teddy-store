import { useTeddy, getStore, useStore, exists } from '@/index'

import { nanoid } from 'nanoid'







describe('methods - use', () => {
  it('useTeddy() should provide a by-default teddy namespaced instance', async () => {
    const name = nanoid()
    const teddy = useTeddy()
    teddy.setStore(name)
    expect(teddy.exists(name)).toBe(true)
  })

  it('useStore() should provide a by-default namespaced store (by-default namespaced)', async () => {
    getStore()
    useStore()
    expect(exists('$/@')).toBe(true)
  })

  it('useTeddy() should provide a teddy namespaced instance', async () => {
    const space = nanoid()
    getStore(space)
    useTeddy(space)
    expect(exists(space + "/")).toBe(true)
  })

  it('useStore() should provide a by-default namespaced store (by-default namespaced)', async () => {
    const space = nanoid()
    const name = nanoid()
    getStore({ space, name })
    useStore({ space, name })
    expect(exists({ space, name })).toBe(true)
  })
})
