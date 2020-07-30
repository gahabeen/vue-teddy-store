<template>
  <div class="w-full">
    Deep1: <input v-model="firstName" />
    Deep1 doc: <input v-model="firstDocName" />
  </div>
</template>

<script>
import { sync } from "../../../src";
export default {
  computed: {
    firstName: sync("$.user", "profile.firstName"),
    firstDocName: sync("$.user", "profile.documents.0.name"),
  },
};
</script>