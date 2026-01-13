<script setup>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { BOOK_TYPE_IMAGE_FOLDER, BOOK_TYPE_PDF } from '@/constants'
import { useFlashMessages } from '@/composables/flashMessages'
import { useLibraryLoader } from '@/composables/libraryLoader'
import PageReader from '@/components/PageReader'
import PdfReader from '@/components/PDFReader'

const store = useStore()
const { getBookHandle } = useLibraryLoader()
const { addErrorMessage } = useFlashMessages()

const readerType = ref('')

const loadBook = async () => {
  const bookHandle = getBookHandle(store.getters.comicSeries, store.getters.book)
  if (!bookHandle) {
    readerType.value = ''
    addErrorMessage('No book found')
    return
  }
  switch (bookHandle.__bookType) {
    case BOOK_TYPE_IMAGE_FOLDER:
      readerType.value = 'pageReader'
      break
    case BOOK_TYPE_PDF:
      readerType.value = 'pdfReader'
      break
  }
  if (readerType.value === '') {
    addErrorMessage('Unable to read book')
  }
}

onMounted(async () => {
  loadBook()
})

</script>

<template>
  <div>
    <div v-if="readerType === 'pageReader'">
      <page-reader></page-reader>
    </div>
    <div v-if="readerType === 'pdfReader'">
      <pdf-reader></pdf-reader>
    </div>
  </div>
</template>

<style scoped lang="scss">
</style>
