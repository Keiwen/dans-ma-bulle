<script setup>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useFlashMessages } from '@/composables/flashMessages'
import { useLibraryLoader } from '@/composables/libraryLoader'
import PageReader from '@/components/PageReader'

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
  switch (bookHandle.kind) {
    case 'directory':
      readerType.value = 'pageReader'
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
  </div>
</template>

<style scoped lang="scss">
</style>
