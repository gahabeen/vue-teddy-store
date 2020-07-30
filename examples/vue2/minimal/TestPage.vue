<template>
  <div class="w-full">
    <!-- firstName: {{firstName}} -->
     Base: <input v-model="profile.firstName" />
     Base doc: <input v-model="profile.documents[0].name" />
    <Deep1  />
    <Deep2  />
  </div>
</template>

<script>
import Deep1 from "./Deep1";
import Deep2 from "./Deep2";
import { sync } from "../../../src";

export default {
  components: { Deep1, Deep2 },
  computed: {
    firstName: sync("$.user", "profile.firstName"),
    profile: sync("$.user", "profile")
  },
};
</script>