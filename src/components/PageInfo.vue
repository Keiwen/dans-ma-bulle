<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useLibraryLoader } from '@/composables/libraryLoader'

const store = useStore()
const { getPageCountOfBook } = useLibraryLoader()

const pageNumber = ref(0)
let timeout

// computed
const currentSeries = computed(() => store.getters.comicSeries)
const currentBook = computed(() => store.getters.book)
const pageIndex = computed(() => store.getters.getPageIndex(currentSeries.value, currentBook.value))
const pageCount = computed(() => getPageCountOfBook(currentSeries.value, currentBook.value))

const checkGoTo = () => {
  clearTimeout(timeout)
  timeout = setTimeout(() => {
    goToPage()
  }, 800) // after 800 ms without any action, auto-validation
}

const goToPage = async () => {
  await store.dispatch('selectPageIndex', pageNumber.value - 1)
}

// watch
watch(pageIndex, async (newValue) => {
  pageNumber.value = newValue + 1
})

onMounted(async () => {
  pageNumber.value = pageIndex.value + 1
})
</script>

<template>
  <div>
    <span class="helper">Page</span><br/>
    <input
      v-model="pageNumber"
      type="number"
      pattern="[0-9]*"
      inputmode="numeric"
      @keyup.enter="goToPage"
      @blur="goToPage"
      @input="checkGoTo"
    />&nbsp;/&nbsp;{{ pageCount }}
  </div>
</template>

<style scoped lang="scss">

</style>
