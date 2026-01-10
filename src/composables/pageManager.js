import { ref } from 'vue'
import { useStore } from 'vuex'
import { useFlashMessages } from '@/composables/flashMessages'
import { useLibraryLoader } from '@/composables/libraryLoader'

let instance = null

export function usePageManager (store) {
  if (instance) return instance // always return instance if exist

  if (!store) store = useStore()
  const libraryLoader = useLibraryLoader()
  const { addWarningMessage } = useFlashMessages()
  let loadedSeries = ''
  let loadedBook = ''
  let loadedPages = []
  const pageCount = ref(0)

  const loadPages = async () => {
    loadedPages = []
    loadedSeries = store.getters.comicSeries
    loadedBook = store.getters.book
    loadedPages = await libraryLoader.getPagesFromBookDirectory(loadedSeries, loadedBook)
    pageCount.value = loadedPages.length
  }

  const getPage = (index) => {
    if (!loadedPages[index]) return null
    return loadedPages[index]
  }

  const getCurrentPage = () => {
    return getPage(store.getters.getCurrentPageIndex())
  }

  const isCurrentPageIsFirst = () => {
    const currentPageNumber = store.getters.getCurrentPageIndex() + 1
    return currentPageNumber === 1
  }

  const isCurrentPageIsLast = () => {
    const currentPageNumber = store.getters.getCurrentPageIndex() + 1
    return currentPageNumber === pageCount.value
  }

  const goToPage = async (pageNumber) => {
    if (pageNumber < 1) {
      pageNumber = 1
      addWarningMessage('First page reached')
    }
    if (pageNumber > pageCount.value) {
      pageNumber = pageCount.value
      addWarningMessage('Last page reached')
    }
    const pageIndex = pageNumber - 1
    await store.dispatch('selectPageIndex', pageIndex)
    // flag book as completed if last page reached
    if (pageNumber === pageCount.value) {
      await store.dispatch('flagBookCompletion', true)
    }
    // unflag if moved to first page if need to restart it
    if (pageNumber === 1) {
      await store.dispatch('flagBookCompletion', false)
    }
  }

  instance = {
    pageCount,
    loadPages,
    getPage,
    getCurrentPage,
    isCurrentPageIsFirst,
    isCurrentPageIsLast,
    goToPage
  }
  return instance
}
