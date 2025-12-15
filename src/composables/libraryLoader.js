import { ref } from 'vue'
import { FILE_EXTENSIONS_SUPPORTED } from '@/constants'
import { useStore } from 'vuex'
import { useFlashMessages } from '@/composables/flashMessages'
import { useStorageInstance } from '@/composables/storageInstance'

const libraryHandle = ref(null)
const shelf = ref({})

export function useLibraryLoader (store) {
  let isLoading = false
  if (!store) store = useStore()
  const { addErrorMessage } = useFlashMessages()

  const getLibraryHandle = async () => {
    if (libraryHandle.value) {
      return libraryHandle.value
    }
    // try to retrieve what was stored
    libraryHandle.value = await useStorageInstance().getLibraryHandle()
    if (libraryHandle.value) {
      // if something was stored, reload library
      await loadLibrary(libraryHandle.value)
    }
    return libraryHandle.value
  }

  const listSeries = async () => {
    const list = []
    if (!libraryHandle.value) return list

    try {
      for await (const [, entry] of libraryHandle.value.entries()) {
        if (entry.kind === 'directory') {
          list.push(entry)
        }
      }
    } catch (e) {
      addErrorMessage('An error occurred on comic series listing')
      console.error(e)
    }
    return list
  }

  const listBooksFromSeries = async (seriesHandle) => {
    const list = []
    if (!seriesHandle) return list

    try {
      for await (const [, entry] of seriesHandle.entries()) {
        if (entry.kind === 'directory') {
          list.push(entry)
        }
      }
    } catch (e) {
      addErrorMessage('An error occurred on books listing for comic series ' + seriesHandle.name)
      console.error(e)
    }
    return list
  }

  const listPagesFromBook = async (bookHandle) => {
    const list = []
    if (!bookHandle) return list

    try {
      for await (const [name, entry] of bookHandle.entries()) {
        if (entry.kind === 'file') {
          // get file extension
          const extension = name.slice(name.lastIndexOf('.'))
          if (FILE_EXTENSIONS_SUPPORTED.includes(extension)) {
            list.push(entry)
          } else {
            console.log('File extension not supported for file ' + bookHandle.name + '/' + name)
          }
        }
      }
      // force alphabetical order
      list.sort((a, b) => a.name.localeCompare(b.name, ['fr', 'en'], { sensitivity: 'base' }))
    } catch (e) {
      addErrorMessage('An error occurred on pages listing for book ' + bookHandle.name)
      console.error(e)
    }
    return list
  }

  const loadLibrary = async (mainHandle) => {
    isLoading = true
    libraryHandle.value = mainHandle
    shelf.value = {}
    const allSeries = await listSeries()
    for (const seriesHandle of allSeries) {
      const comicSeriesBooks = {}
      const books = await listBooksFromSeries(seriesHandle)
      for (const bookHandle of books) {
        comicSeriesBooks[bookHandle.name] = await listPagesFromBook(bookHandle)
      }
      shelf.value[seriesHandle.name] = comicSeriesBooks
    }
    await store.dispatch('selectLibrary', mainHandle.name)
    await useStorageInstance().setLibraryHandle(mainHandle)
    isLoading = false
  }

  const getSeriesList = () => {
    return Object.keys(shelf.value)
  }

  const getBooksFromSeries = (comicSeries) => {
    if (!shelf.value[comicSeries]) return []
    return Object.keys(shelf.value[comicSeries])
  }

  const getPagesFromBook = (comicSeries, book) => {
    if (!shelf.value[comicSeries]) return []
    if (!shelf.value[comicSeries][book]) return []
    return shelf.value[comicSeries][book]
  }

  return {
    libraryHandle,
    getLibraryHandle,
    shelf,
    loadLibrary,
    getSeriesList,
    getBooksFromSeries,
    getPagesFromBook,
    isLoading
  }
}
