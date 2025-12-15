import { useStore } from 'vuex'
import { useFlashMessages } from '@/composables/flashMessages'
import { useLibraryLoader } from '@/composables/libraryLoader'

export function usePageManager (store) {
  if (!store) store = useStore()
  const libraryLoader = useLibraryLoader()
  const { addWarningMessage } = useFlashMessages()

  const getPageFromBook = (comicSeries, book, index) => {
    const pages = libraryLoader.getPagesFromBook(comicSeries, book)
    if (!pages[index]) return null
    return pages[index]
  }

  const getPageCountOfBook = (comicSeries, book) => {
    const pages = libraryLoader.getPagesFromBook(comicSeries, book)
    return pages.length
  }

  const getCurrentPage = () => {
    return getPageFromBook(store.getters.comicSeries, store.getters.book, store.getters.getCurrentPageIndex())
  }

  const getPageCountOfCurrentBook = () => {
    return getPageCountOfBook(store.getters.comicSeries, store.getters.book)
  }

  const isCurrentPageIsFirst = () => {
    const currentPageNumber = store.getters.getCurrentPageIndex() + 1
    return currentPageNumber === 1
  }

  const isCurrentPageIsLast = () => {
    const currentPageNumber = store.getters.getCurrentPageIndex() + 1
    return currentPageNumber === getPageCountOfCurrentBook()
  }

  const goToPage = async (pageNumber) => {
    if (pageNumber < 1) {
      pageNumber = 1
      addWarningMessage('First page reached')
    }
    const maxPage = getPageCountOfCurrentBook()
    if (pageNumber > maxPage) {
      pageNumber = maxPage
      addWarningMessage('Last page reached')
    }
    const pageIndex = pageNumber - 1
    await store.dispatch('selectPageIndex', pageIndex)
  }

  return {
    getPageFromBook,
    getPageCountOfBook,
    getCurrentPage,
    isCurrentPageIsFirst,
    isCurrentPageIsLast,
    goToPage
  }
}
