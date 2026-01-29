<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { useLibraryLoader } from '@/composables/libraryLoader'
import { useArchiveParser } from '@/composables/ArchiveParser'
import PageController from '@/components/PageController'

import { usePageManager } from '@/composables/pageManager'

const store = useStore()
const { loadFullBook } = usePageManager()
const { loadArchiveFile, loadArchivePage, pageCount } = useArchiveParser()

const pageSrc = ref(null)
const pageIndex = computed(() => store.getters.getCurrentPageIndex())

const loadFile = async () => {
  const bookHandle = await useLibraryLoader().getBookHandle(store.getters.comicSeries, store.getters.book)
  await loadArchiveFile(bookHandle)
  await loadFullBook(pageCount.value)
}

const loadPage = async () => {
  // clean previous value
  if (pageSrc.value) {
    URL.revokeObjectURL(pageSrc.value)
  }
  const blob = await loadArchivePage(pageIndex.value)
  if (blob) {
    pageSrc.value = URL.createObjectURL(blob)
  }
}

// watch
watch(pageIndex, async (newValue) => {
  await loadPage()
})

onMounted(async () => {
  await loadFile()
  await loadPage()
})

</script>

<template>
  <div>
    <div class="page-reader">
      <img :src="pageSrc" :alt="'Page ' + (pageIndex+1)" width="100%" />
      <page-controller></page-controller>
    </div>
  </div>
</template>

<style scoped lang="scss">
</style>
