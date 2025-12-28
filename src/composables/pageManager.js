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

  const loadPages = async () => {
    loadedSeries = store.getters.comicSeries
    loadedBook = store.getters.book
    loadedPages = await libraryLoader.getPagesFromBookDirectory(loadedSeries, loadedBook)
  }

  const getPage = (index) => {
    if (!loadedPages[index]) return null
    return loadedPages[index]
  }

  const getPageCount = () => {
    return loadedPages.length
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
    return currentPageNumber === getPageCount()
  }

  const goToPage = async (pageNumber) => {
    if (pageNumber < 1) {
      pageNumber = 1
      addWarningMessage('First page reached')
    }
    const maxPage = getPageCount()
    if (pageNumber > maxPage) {
      pageNumber = maxPage
      addWarningMessage('Last page reached')
    }
    const pageIndex = pageNumber - 1
    await store.dispatch('selectPageIndex', pageIndex)
  }

  instance = {
    loadPages,
    getPage,
    getPageCount,
    getCurrentPage,
    isCurrentPageIsFirst,
    isCurrentPageIsLast,
    goToPage
  }
  return instance
}
