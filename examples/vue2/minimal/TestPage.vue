<template>
  <div class="w-full">
    <!-- firstName: {{firstName}} -->
    Base:
    <input v-model="firstName" />
    Base doc:
    <input v-model="profile.documents[0].name" />
    <Deep1 />
    <Deep2 />
    <button @click="trigger">TRIGGER</button>
  </div>
</template>

<script>
// import { watch } from "@vue/composition-api";
import { nanoid } from "nanoid";
import Deep1 from "./Deep1";
import Deep2 from "./Deep2";
import { sync, set, setWatchers } from "../../../src";
// const { store } = useStore("user");

export default {
  components: { Deep1, Deep2 },
  mounted() {
    setWatchers("user", [
      {
        path: "profile.firstName",
        handler(newState, oldState) {
          console.log("profile.firstName", { newState, oldState });
        },
        immediate: true,
      },
    ]);

    // watch(
    //   store.state,
    //   () => {
    //     // console.log("watch", { newState, oldState });
    //   },
    //   {
    //     immediate: true,
    //     deep: true,
    //   }
    // );
  },
  computed: {
    firstName: sync("$.user", "profile.firstName"),
    profile: sync("$.user", "profile"),
  },
  methods: {
    trigger() {
      set("user", "profile.firstName", nanoid());

      // this.firstName =  nanoid()
    },
  },
};
</script>