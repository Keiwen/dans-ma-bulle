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
    Page {{ pageIndex + 1 }}
  </div>
</template>

<style scoped lang="scss">

</style>
