<template>
  <div class="w-full">
    <input v-model="firstName" />
    <input v-model="firstName" />
  </div>
</template>

<script>
import { sync } from "../../../src"
export default {
  computed: {
    firstName: sync('user.firstName')
  }
}
</script>