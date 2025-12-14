<script setup>
import { computed, ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useLibraryLoader } from '@/composables/libraryLoader'
import { useFlashMessages } from '@/composables/flashMessages'
import PageController from '@/components/PageController'

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
onMounted(async () => {
  loadPage()
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
