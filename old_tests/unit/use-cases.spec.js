import { setStore, useStore } from '@/index'
import { mount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import { nanoid } from 'nanoid'

describe('use cases - ', () => {
  it(`should be able to use $route params in mounted()`, async () => {
    const space = nanoid()
    const name = nanoid()

    setStore(
      { space, name },
      {
        state: {
          products: [{ name: 'berries' }],
        },
      }
    )

    const { has } = useStore({ space, name })

    mount(
      {
        template: `<div></div>`,
        mounted() {
          expect(has(`products.{$route.params.index}.name`, this)).toBe(true)
        },
      },
      {
        mocks: {
          $route: {
            params: {
              index: 0,
            },
          },
        },
      }
    )
  })

  it(`should be able to use $route params in template`, async () => {
    const space = nanoid()
    const name = nanoid()

    setStore(
      { space, name },
      {
        state: {
          products: [{ name: 'berries' }],
        },
      }
    )

    const wrapper = mount(
      {
        template: `<div>{{"" + $teddy.has('${space}.${name}', 'products.{$route.params.index}.name', this)}}</div>`,
        // template: `<div>{{"" + $teddy.has({space:'${space}', name:'${name}'}, 'products.{$route.params.index}.name', this)}}</div>`,
      },
      {
        mocks: {
          $route: {
            params: {
              index: 0,
            },
          },
        },
      }
    )
    await flushPromises()
    expect(wrapper.text()).toBe('true')
  })
})
