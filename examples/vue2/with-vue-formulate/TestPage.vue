<template>
  <div>
    <FormulateForm v-if="!rerender" class="w-full mb-10" v-model="products" :schema="productsSchema.items" />
    <FormulateForm class="w-full mb-10" v-model="productsSchema.items[0]" :schema="schemaSchema" />
  </div>
</template>

<script>
import { sync } from "../../../src";
export default {
  computed: {
    productsSchema: sync("products.schema"),
    products: sync("products.list"),
  },
  data: () => ({
    rerender: false,
    schemaSchema: [{
      type: "group",
      repeatable: true,
      label: "Schema Fields",
      addLabel: "+ Add a field",
      name: "children",
      children: [{
        type: "text",
        name: "name",
        label: "Field"
      },
      {
        type: "text",
        name: "validation",
        label: "Validation"
      }]
    }]
  }),
  watch: {
    productsSchema: {
      handler(){
        this.rerender = true
          this.$nextTick(() => {
          // Add the component back in
          this.rerender = false;
        });
      },
      deep: true
    }
  }
};
</script>