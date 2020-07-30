<template>
  <div class="w-full">
     Deep2: <input v-model="profile.firstName" />
     Deep2 doc: <input v-model="profile.documents[0].name" />
  </div>
</template>

<script>
import { sync } from "../../../src";
export default {
  computed: {
    profile: sync("$.user", "profile"),
  },
};
</script>