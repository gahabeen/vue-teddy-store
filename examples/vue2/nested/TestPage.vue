<template>
  <div class="w-full">
    <div v-for="product in products" :key="product.id">
      <div>
        <input v-model="product.title" />

        <draggrable v-model="product.elements" v-bind="{group: 'elements'}">
          <div v-for="element in product.elements" :key="element.id">
            <div><input v-model="element.type" /></div>
          </div>
        </draggrable>
      </div>
    </div>
  </div>
</template>

<script>
import { sync } from "../../../src";
import Draggrable from "vuedraggable";
export default {
  components: { Draggrable },
  computed: {
    products: sync("$.catalog", "products"),
  },
};
</script>