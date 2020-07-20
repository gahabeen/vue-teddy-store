<div align="center"> 
  <img alt="Vue Teddy Store"  src="assets/logo.png"> 
  <p>
    <span style="font-weight:bold">Simple reactive store for Vue</span> <br/>
    <span>Can completely replace Vuex, based on Vue build-in features with Vue Composition Api (Vue 3)</span>
  </p>
</div>

<p align="center">
  <a href="https://www.npmjs.com/package/vue-teddy-store"><img alt="npm" src="https://img.shields.io/npm/v/vue-teddy-store"></a>
  <a href="https://www.npmjs.com/package/vue-teddy-store"><img alt="npm" alt="npm bundle size" src="https://img.shields.io/bundlephobia/min/vue-teddy-store"></a>
  <a href="https://www.npmjs.com/package/vue-teddy-store"><img alt="npm" src="https://github.com/gahabeen/vue-teddy-store/workflows/tests/badge.svg"></a>
  <a href="https://www.npmjs.com/package/vue-teddy-store"><img alt="Codecov" src="https://img.shields.io/codecov/c/github/gahabeen/vue-teddy-store"></a>
  <a href="https://github.com/gahabeen/vue-teddy-store"><img alt="npm" src="https://img.shields.io/badge/License-MIT-yellow.svg"></a>
</p>

```bash
yarn add vue-teddy-store
```

```js
/*   store/user.js   */
// create your own store based on the composition api
import { reactive, computed } from '@vue/composition-api'

const state = reactive({
  firstName: 'Teddy',
  lastName: 'Bear',
})

const methods = {
  get fullName() {
    return computed(() => state.firstName + ' ' + state.lastName)
  },
}

export { state, methods }
//*

/*   store/index.js   */
import TeddyStore from 'vue-teddy-store'
import * as user from './user'

const store = new TeddyStore()
store.add('user', user)

export default store
//*

/*   main.js   */
import Vue from 'vue'
import VueCompositionApi from '@vue/composition-api'

import store from './store'

Vue.use(VueCompositionApi)
Vue.use(store)
//*
```

```html
<template>
  <div>{{$teddy.stores.user.state.firstName}}</div>
  <!-- should display "Teddy" -->

  <div>{{$teddy.stores.user.fullName}}</div>
  <!-- should display "Teddy Bear" -->
</template>

<script>
  export default {
    mounted() {
      console.log(this.$teddy.stores.user.fullName) // should display "Teddy Bear" in console
    },
  }
</script>
```

## How-to

When making each of your stores (before you add them to Teddy) you can set 3 things: `state`, `methods` and `watchers`.

```js
import { reactive, computed } from '@vue/composition-api'

const state = reactive({
  firstName: 'Teddy',
  lastName: 'Bear',
})

const methods = {
  get fullName() {
    return computed(() => state.firstName + ' ' + state.lastName)
  },
}

/*
  By default watchers fires on [deep: true] but you can tweak when defining it as an object with an handler function. The same way you would define a watcher in Vue.
*/
const watchers = [
  function(newState, oldState) {
    console.log('user state changed from', oldState, 'to', newState)
  },
  {
    handler(newState, oldState) {
      console.log('user state changed from', oldState, 'to', newState)
    },
    deep: false,
    immediate: true,
  },
]

export { state, methods, watchers }
```

## Plugins

Teddy let's you add plugins onto all or any of the defined stores.  
It actually already comes bundled with 3 plugins: **cache**, **history** and **sync**.

> Careful, when you add your plugin (or activate a build-in one), it's gonna run it on the already provided stores.
> If you want to make sure your plugins get applied on all stores, make sure to add them after your stores' declarations.

```js
//...
const store = new TeddyStore()
store.add("user", user)
store.add("auth", auth)
// other stores declarations...

store.plugin(<plugin>)
store.plugin({
  install(instance) {
    /*
      do whatever you want with Teddy's instance
    */
  },
  handle({ name, store }) {
    /*
      do whatever you want with each store
      you've got their key/name as name and the store itself
      Check out the build in plugins to see how it's been used!
    */
  }
})
```

### Cache

It will attempt to use `localStorage` to keep a cached version of the store.

```js
const store = new TeddyStore()
// don't forget to make your stores declarations first
store.activate('cache')
```

### History

It will add a state history to your stores.

```js
const store = new TeddyStore()
// don't forget to make your stores declarations first
store.activate('history')

for (const previousState of store.state._history) {
  /*
    You can handle history here ;)
  */
}
```

### Sync

It will sync your stores between browser tabs. (Requires `Cache` plugin)

```js
const store = new TeddyStore()
// don't forget to make your stores declarations first
store.activate(['cache', 'sync'])
```

### Make your own plugin, extend your stores

**Teddy** is a minimalist tool to help your manage your stores. If you want more features, it could be that you want to use plugins (or even simply set them with the stores declarations).

While adding a **store** every other attributes than `state`, `_state`, `methods` and `watchers` is merged added to the store too.
