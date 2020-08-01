import { accessors } from '@/index'
import { getDecorated, get } from '@/memoize'
import VueCompositionApi from '@vue/composition-api'
import Vue from 'vue'

Vue.use(VueCompositionApi)

describe('memoize', () => {
  it('getDecorated() should provie a cached value on n+1 calls', async () => {
    const obj = { profile: { firstName: 'Teddy ' } }
    const steps = ['profile', 'firstName']
    const fetch1 = getDecorated(obj, steps, null, null, accessors.get)
    const fetch2 = getDecorated(obj, steps, null, null, accessors.get)
    const fetch3 = getDecorated(obj, steps, null, null, accessors.get)
    const fetch4 = get(obj, steps, null, null, accessors.get)
    expect(fetch1.cache).toBe(false)
    expect(fetch1.value).toBe(obj.profile.firstName)
    expect(fetch2.cache).toBe(true)
    expect(fetch2.value).toBe(obj.profile.firstName)
    expect(fetch3.cache).toBe(true)
    expect(fetch3.value).toBe(obj.profile.firstName)
    expect(fetch4).toBe(obj.profile.firstName)
  })
})
