<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useLibraryLoader } from '@/composables/libraryLoader'

const store = useStore()
const { getPageCountOfBook } = useLibraryLoader()

// computed
const currentSeries = computed(() => store.getters.comicSeries)
const currentBook = computed(() => store.getters.book)
const pageIndex = computed(() => store.getters.getPageIndex(currentSeries.value, currentBook.value))
const pageCount = computed(() => getPageCountOfBook(currentSeries.value, currentBook.value))

</script>

<template>
  <div>
    <span class="helper">Page</span><br/>
    {{ pageIndex + 1 }}&nbsp;/&nbsp;{{ pageCount }}
  </div>
</template>

<style scoped lang="scss">

</style>
