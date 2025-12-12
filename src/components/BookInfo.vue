<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

// computed
const currentSeries = computed(() => store.getters.comicSeries)
const currentBook = computed(() => store.getters.book)
const pageIndex = computed(() => store.getters.getPageIndex(currentSeries.value, currentBook.value))

</script>

<template>
  <div>
    <p>
      {{ currentSeries }}: {{ currentBook }} (page {{ pageIndex + 1 }})
    </p>
  </div>
</template>

<style scoped lang="scss">

</style>
