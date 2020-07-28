import TeddyStore from '@/index'
import VueCompositionApi, { ref } from '@vue/composition-api'
import { createLocalVue, mount } from '@vue/test-utils'
import { nanoid } from 'nanoid'
import Vue from 'vue'
Vue.use(VueCompositionApi)

describe('Store, Use Cases [Common]', () => {
  it(`should be able to check router params`, async () => {
    const localVue = createLocalVue()
    const store = new TeddyStore()
    const storeName = nanoid()

    localVue.use(
      store.add(storeName, {
        state: ref({
          pages: {
            123: { id: 123, name: 'Page 123' },
          },
        }),
      })
    )

    const wrapper = mount(
      {
        template: `<div>{{$teddy.has('${storeName}.pages.{$route.params.id}.name', this)}}</div>`,
        beforeMount() {
          expect(store.has(`${storeName}.pages.{$route.params.id}.name`, this)).toBe(true)
        },
      },
      {
        localVue,
        mocks: {
          $route: {
            params: {
              id: 123,
            },
          },
        },
      }
    )

    expect(wrapper.text()).toBe('true')
  })
})
