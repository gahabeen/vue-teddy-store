import { setStore, useTeddyStore, install } from '@/index'
import { createLocalVue, mount } from '@vue/test-utils'
import VueCompositionApi from '@vue/composition-api'
import flushPromises from 'flush-promises'
import { nanoid } from 'nanoid'
import Vue from 'vue'

Vue.use(VueCompositionApi)

describe('use cases - ', () => {
  it(`should be able to use $route params in mounted()`, async () => {
    const localVue = createLocalVue()
    localVue.use(install)

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

    const { has } = useTeddyStore(space, name)

    mount(
      {
        template: `<div></div>`,
        mounted() {
          expect(has(`products.{$route.params.index}.name`, this)).toBe(true)
        },
      },
      {
        localVue,
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
    const localVue = createLocalVue()
    localVue.use(install)

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
        localVue,
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

  // it(`should be able to use $route params in template`, async () => {
  //   const localVue = createLocalVue()
  //   localVue.use(install)

  //   const space = nanoid()
  //   const name = nanoid()

  //   setStore(
  //     { space, name },
  //     {
  //       state: {
  //         products: [{ name: 'berries' }],
  //       },
  //     }
  //   )

  //   const wrapper = mount(
  //     {
  //       template: `<div>{{"" + $teddy.has('${space}.${name}', 'products.{$route.params.index}.name', this)}}</div>`,
  //       // template: `<div>{{"" + $teddy.has({space:'${space}', name:'${name}'}, 'products.{$route.params.index}.name', this)}}</div>`,
  //     },
  //     {
  //       localVue,
  //       mocks: {
  //         $route: {
  //           params: {
  //             index: 0,
  //           },
  //         },
  //       },
  //     }
  //   )
  //   await flushPromises()
  //   expect(wrapper.text()).toBe('true')
  // })
})
