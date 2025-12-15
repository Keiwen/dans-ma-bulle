<script setup>
import { useStore } from 'vuex'
import { computed } from 'vue'

const store = useStore()

// computed
const theme = computed(() => store.getters.theme)

</script>

<template>
  <nav :class="theme === 'light' ? 'menu-light' : 'menu-dark'">
    <div class="nav-item" aria-label="Navigate to settings">
      <router-link to="/settings">Settings</router-link>
    </div>
    <div class="nav-item">
      <router-link to="/book" aria-label="Navigate to book selection">Book</router-link>
    </div>
    <div class="nav-item" aria-label="Navigate to read page">
      <router-link to="/">Read</router-link>
    </div>
  </nav>
</template>

<style scoped>

</style>
