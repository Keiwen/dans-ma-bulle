<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

// computed
const currentSeries = computed(() => store.getters.comicSeries)
const currentBook = computed(() => store.getters.book)
const pageIndex = computed(() => store.getters.getPageIndex(currentSeries.value, currentBook.value))

const toLeftPage = async () => {
  await previousPage()
}

const toRightPage = async () => {
  await nextPage()
}

const previousPage = async () => {
  if (pageIndex.value <= 0) return
  await store.dispatch('selectPageIndex', pageIndex.value - 1)
}

const nextPage = async () => {
  await store.dispatch('selectPageIndex', pageIndex.value + 1)
}

</script>

<template>
  <div class="page-controller">
    <div class="page-controller-zone left-zone" @click="toLeftPage">&laquo;</div>
    <div class="info-zone"></div>
    <div class="page-controller-zone right-zone" @click="toRightPage">&raquo;</div>
  </div>
</template>

<style scoped lang="scss">

</style>
