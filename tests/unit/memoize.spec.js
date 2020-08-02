import { accessors } from '@/index'
import { getDecorated, get } from '@/memoize'
import VueCompositionApi from '@vue/composition-api'
import flushPromises from 'flush-promises'
import { nanoid } from 'nanoid'
import Vue from 'vue'

Vue.use(VueCompositionApi)

describe('memoize', () => {
  it('getDecorated() should provide a cached value on n+1 calls', async () => {
    const space = nanoid()
    const name = nanoid()
    const obj = { profile: { firstName: 'Teddy ' } }
    const steps = ['profile', 'firstName']
    const fetch1 = getDecorated(space, name)(obj, steps, {}, {}, accessors.get)
    const fetch2 = getDecorated(space, name)(obj, steps, {}, {}, accessors.get)
    const fetch3 = getDecorated(space, name)(obj, steps, {}, {}, accessors.get)
    const fetch4 = get(space, name)(obj, steps, {}, {}, accessors.get)
    expect(fetch1.cache).toBe(false)
    expect(fetch1.value).toBe(obj.profile.firstName)
    expect(fetch2.cache).toBe(true)
    expect(fetch2.value).toBe(obj.profile.firstName)
    expect(fetch3.cache).toBe(true)
    expect(fetch3.value).toBe(obj.profile.firstName)
    expect(fetch4).toBe(obj.profile.firstName)
  })

  it('getDecorated()() should provide a cached value on n+1 calls with change', async () => {
    const space = nanoid()
    const name = nanoid()
    const obj = { profile: { firstName: 'Teddy ' } }
    const steps = ['profile']
    const fetch1 = getDecorated(space, name)(obj, steps, {}, {}, accessors.get)
    const fetch2 = getDecorated(space, name)(obj, steps, {}, {}, accessors.get)
    expect(fetch1.cache).toBe(false)
    expect(fetch1.value).toBe(obj.profile)
    obj.profile.lastName = 'Store'
    await flushPromises()
    expect(fetch2.cache).toBe(true)
    expect(fetch2.value).toBe(obj.profile)
  })
})
