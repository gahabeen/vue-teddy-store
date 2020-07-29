import { install as installTeddy } from '@/index'
import VueCompositionApi from '@vue/composition-api'
import { createLocalVue, mount } from '@vue/test-utils'
import Vue from 'vue'

Vue.use(VueCompositionApi)

describe('methods - installation [vue 2]', () => {
  it('install() should create a Vue.prototype.$teddy', async () => {
    const localVue = createLocalVue()
    localVue.use(installTeddy)

    mount(
      {
        template: '<div></div>',
        mounted() {
          expect(this).toHaveProperty('$teddy')
        },
      },
      {
        localVue,
      }
    )
  })

  it('install() should make available { Teddies } store within the Vue.prototype.$teddy', async () => {
    const localVue = createLocalVue()
    localVue.use(installTeddy)

    mount(
      {
        template: '<div></div>',
        mounted() {
          expect(this.$teddy.Teddies.value).toHaveProperty('spaces')
        },
      },
      {
        localVue,
      }
    )
  })

  /**
   * TODO:
   */
})
