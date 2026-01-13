import { ref } from 'vue'
import { PAGE_EXTENSIONS_SUPPORTED, BOOK_TYPE_IMAGE_FOLDER, BOOK_EXTENSIONS_SUPPORTED, BOOK_TYPE_PDF } from '@/constants'
import { useStore } from 'vuex'
import { useFlashMessages } from '@/composables/flashMessages'
import { useStorageInstance } from '@/composables/storageInstance'

let instance = null

export function useLibraryLoader (store) {
  if (instance) return instance // always return instance if exist

  const libraryHandle = ref(null)
  const shelf = ref({})
  const isLoading = ref(false)
  const loadedBooksCount = ref(0)

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
          entry.__bookType = BOOK_TYPE_IMAGE_FOLDER
          list.push(entry)
        } else {
          // get file extension
          const extension = entry.name.slice(entry.name.lastIndexOf('.'))
          if (BOOK_EXTENSIONS_SUPPORTED.includes(extension)) {
            switch (extension) {
              case '.pdf': entry.__bookType = BOOK_TYPE_PDF; break
              default:
                entry.__bookType = 'file'
            }
            list.push(entry)
          } else {
            console.log('File extension not supported for book: ' + seriesHandle.name + '/' + entry.name, extension)
          }
        }
      }
      // force alphabetical order
      list.sort((a, b) => a.name.localeCompare(b.name, ['fr', 'en'], { sensitivity: 'base' }))
    } catch (e) {
      addErrorMessage('An error occurred on books listing for comic series ' + seriesHandle.name)
      console.error(e)
    }
    return list
  }

  const listPagesFromBookDirectory = async (bookHandle) => {
    const list = []
    if (!bookHandle) return list
    if (bookHandle.__bookType !== BOOK_TYPE_IMAGE_FOLDER) return list

    try {
      for await (const [name, entry] of bookHandle.entries()) {
        if (entry.kind === 'file') {
          // get file extension
          const extension = name.slice(name.lastIndexOf('.'))
          if (PAGE_EXTENSIONS_SUPPORTED.includes(extension)) {
            list.push(entry)
          } else {
            console.log('File extension not supported for page: ' + bookHandle.name + '/' + name)
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
    isLoading.value = true
    loadedBooksCount.value = 0
    libraryHandle.value = mainHandle
    shelf.value = {}
    const allSeries = await listSeries()
    for (const seriesHandle of allSeries) {
      const comicSeriesBooks = {}
      const books = await listBooksFromSeries(seriesHandle)
      for (const bookHandle of books) {
        comicSeriesBooks[bookHandle.name] = bookHandle
        loadedBooksCount.value++
      }
      if (books.length) shelf.value[seriesHandle.name] = comicSeriesBooks
    }
    await store.dispatch('selectLibrary', mainHandle.name)
    await useStorageInstance().setLibraryHandle(mainHandle)
    isLoading.value = false
  }

  const getSeriesList = () => {
    return Object.keys(shelf.value)
  }

  const getBooksFromSeries = (comicSeries) => {
    if (!shelf.value[comicSeries]) return []
    return Object.keys(shelf.value[comicSeries])
  }

  const getBookHandle = (comicSeries, book) => {
    if (!shelf.value[comicSeries]) return null
    if (!shelf.value[comicSeries][book]) return null
    return shelf.value[comicSeries][book]
  }

  const getPagesFromBookDirectory = async (comicSeries, book) => {
    if (!shelf.value[comicSeries]) return []
    if (!shelf.value[comicSeries][book]) return []
    return await listPagesFromBookDirectory(shelf.value[comicSeries][book])
  }

  instance = {
    libraryHandle,
    loadedBooksCount,
    getLibraryHandle,
    shelf,
    loadLibrary,
    getSeriesList,
    getBooksFromSeries,
    getPagesFromBookDirectory,
    getBookHandle,
    isLoading
  }

  return instance
}
