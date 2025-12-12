<script setup>
import { computed, ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useLibraryLoader } from '@/composables/libraryLoader'
import { useFlashMessages } from '@/composables/flashMessages'

const store = useStore()
const { getPageFromBook } = useLibraryLoader()
const { addErrorMessage } = useFlashMessages()

const pageSrc = ref(null)

// computed
const currentSeries = computed(() => store.getters.comicSeries)
const currentBook = computed(() => store.getters.book)
const pageIndex = computed(() => store.getters.getPageIndex(currentSeries.value, currentBook.value))

const loadPage = async () => {
  const pageHandle = getPageFromBook(currentSeries.value, currentBook.value, pageIndex.value)
  if (!pageHandle) {
    addErrorMessage('No page found')
    return
  }

  try {
    const imageFile = await pageHandle.getFile()
    // clean previous value
    if (pageSrc.value) {
      URL.revokeObjectURL(pageSrc.value)
    }
    pageSrc.value = URL.createObjectURL(imageFile)
  } catch (e) {
    addErrorMessage('Cannot load image file')
    console.error(e)
  }
}

const previousPage = async () => {
  if (pageIndex.value <= 0) return
  await store.dispatch('selectPageIndex', pageIndex.value - 1)
  loadPage()
}

const nextPage = async () => {
  await store.dispatch('selectPageIndex', pageIndex.value + 1)
  loadPage()
}

onMounted(async () => {
  loadPage()
})
</script>

<template>
  <div class="page-reader">
    <img :src="pageSrc" :alt="'Page ' + (pageIndex+1)" width="100%" />
    <div class="page-control-zone previous-page-zone" @click="previousPage">Previous</div>
    <div class="page-control-zone next-page-zone" @click="nextPage">Next</div>
  </div>
</template>

<style scoped lang="scss">

</style>
