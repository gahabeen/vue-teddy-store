<template>
  <div class="w-full max-w-screen-lg mx-auto my-20 flex-col items-center justify-center">
    <div class="flex flex-col items-center justify-center w-full mb-10">
      <a href="http://vueteddystore.com" target="_blank" class="text-sm text-green-500 font-semibold hover:underline"> <img src="./logo-only-300.png"></a>
        <a href="https://github.com/gahabeen/vue-teddy-store/" target="_blank" class="text-sm text-green-500 font-semibold hover:underline">Github</a>
        <a href="http://vueteddystore.com" target="_blank" class="text-sm text-green-500 font-semibold hover:underline">Documentation website</a>
      <div class="text-lg font-semibold text-gray-700">{{name}}</div>
    </div>
    <div class="flex flex-row items-start justify-start w-full">
      <div class="w-1/2 mr-10">
        <div class="text-green-600 font-semibold mb-3">Teddy's stores</div>
        <vue-json-pretty :data="stores" />
      </div>
      <div class="w-1/2 flex flex-col items-center justify-center p-3">
        <component class="w-full" :is="component" />
      </div>
    </div>
    
  </div>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty'
import "tailwindcss/dist/tailwind.min.css";
export default {
  props: ['component', 'name'],
  components: { VueJsonPretty },
  computed: {
    stores(){
      const self = this
      return Object.keys(self.$teddy.stores).reduce((acc, key) => {
        acc[key] = self.$teddy.stores[key].state
        return acc
      }, {})
    }
  }
};
</script>