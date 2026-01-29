import { ref } from 'vue'
import { PAGE_EXTENSIONS_SUPPORTED, BOOK_TYPE_IMAGE_FOLDER, BOOK_EXTENSIONS_SUPPORTED, BOOK_TYPE_PDF, BOOK_TYPE_ZIP } from '@/constants'
import { useStore } from 'vuex'
import { useFlashMessages } from '@/composables/flashMessages'
import { useStorageInstance } from '@/composables/storageInstance'

let instance = null

// NOTE ABOUT HANDLE ISSUE
// Around 2026-01-28, there was update in chrome mobile browser to reinforce security
// since then, handles should be retrieved almost every time we need it.
// The way we used to store it is not working anymore as handle object is invalidated
// therefore, we are working with names and retrieve handler again and again.
// Current code is a mix between the old way and the new, to fix our issue without reworking everything

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
      for await (const [name, entry] of libraryHandle.value.entries()) {
        if (entry.kind === 'directory') {
          // HANDLE ISSUE: store name only here. If you store handle, later this handle will be invalidated
          list.push(name)
        }
      }
    } catch (e) {
      addErrorMessage('An error occurred on comic series listing', '', true)
      console.error(e)
    }
    return list
  }

  const listBooksFromSeries = async (seriesHandle) => {
    const list = []
    if (!seriesHandle) return list

    try {
      for await (const [entryName, entry] of seriesHandle.entries()) {
        if (entry.kind === 'directory') {
          // HANDLE ISSUE: store a brand new object here. If you store handle, later this handle will be invalidated
          const bookEntry = {
            name: entryName,
            type: BOOK_TYPE_IMAGE_FOLDER
          }
          list.push(bookEntry)
        } else {
          // get file extension
          const extension = entryName.slice(entryName.lastIndexOf('.'))
          if (BOOK_EXTENSIONS_SUPPORTED.includes(extension)) {
            // HANDLE ISSUE: store a brand new object here. If you store handle, later this handle will be invalidated
            const bookEntry = {
              name: entryName,
              type: 'file'
            }
            switch (extension) {
              case '.pdf': bookEntry.type = BOOK_TYPE_PDF; break
              case '.zip':
              case '.cbz':
                bookEntry.type = BOOK_TYPE_ZIP; break
              default:
                bookEntry.type = 'file'
            }
            list.push(bookEntry)
          } else {
            console.log('File extension not supported for book: ' + seriesHandle.name + '/' + entryName, extension)
          }
        }
      }
      // force alphabetical order
      list.sort((a, b) => a.name.localeCompare(b.name, ['fr', 'en'], { sensitivity: 'base' }))
    } catch (e) {
      addErrorMessage('An error occurred on books listing for comic series ' + seriesHandle.name, '', true)
      console.error(e)
    }
    return list
  }

  const listPagesFromBookDirectory = async (bookHandle) => {
    const list = []
    if (!bookHandle) return list
    if (bookHandle.__bookType !== BOOK_TYPE_IMAGE_FOLDER) return list

    try {
      for await (const [entryName, entry] of bookHandle.entries()) {
        if (entry.kind === 'file') {
          // get file extension
          const extension = entryName.slice(entryName.lastIndexOf('.'))
          if (PAGE_EXTENSIONS_SUPPORTED.includes(extension)) {
            list.push(entryName)
          } else {
            console.log('File extension not supported for page: ' + bookHandle.name + '/' + entryName)
          }
        }
      }
      // force alphabetical order
      list.sort((a, b) => a.localeCompare(b, ['fr', 'en'], { sensitivity: 'base' }))
    } catch (e) {
      addErrorMessage('An error occurred on pages listing for book ' + bookHandle.name, '', true)
      console.error(e)
    }
    return list
  }

  const loadLibrary = async (mainHandle) => {
    isLoading.value = true
    loadedBooksCount.value = 0
    libraryHandle.value = mainHandle
    shelf.value = {}
    const allSeriesNames = await listSeries()
    for (const seriesName of allSeriesNames) {
      // HANDLE ISSUE: we did NOT store the full handle for security reason. Check handle again
      const seriesHandle = await libraryHandle.value.getDirectoryHandle(seriesName)
      const comicSeriesBooks = {}
      const books = await listBooksFromSeries(seriesHandle)
      for (const bookEntry of books) {
        comicSeriesBooks[bookEntry.name] = bookEntry
        loadedBooksCount.value++
      }
      if (books.length) shelf.value[seriesName] = comicSeriesBooks
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

  const getBookHandle = async (comicSeries, book) => {
    if (!shelf.value[comicSeries]) return null
    if (!shelf.value[comicSeries][book]) return null
    const bookInfo = shelf.value[comicSeries][book]
    const seriesHandle = await libraryHandle.value.getDirectoryHandle(comicSeries)
    let bookHandle = {}
    // HANDLE ISSUE: check handle again, but could be directory or file
    if (bookInfo.type === BOOK_TYPE_IMAGE_FOLDER) {
      bookHandle = await seriesHandle.getDirectoryHandle(book)
    } else {
      bookHandle = await seriesHandle.getFileHandle(book)
    }
    // HANDLE ISSUE: adjust attribute again to not break usage after
    bookHandle.__bookType = bookInfo.type
    return bookHandle
  }

  const getPagesFromBookDirectory = async (comicSeries, book) => {
    if (!shelf.value[comicSeries]) return []
    if (!shelf.value[comicSeries][book]) return []
    // HANDLE ISSUE: check handle again
    const bookHandle = await getBookHandle(comicSeries, book)
    return await listPagesFromBookDirectory(bookHandle)
  }

  const getPageHandle = async (comicSeries, book, pageName) => {
    if (!shelf.value[comicSeries]) return null
    if (!shelf.value[comicSeries][book]) return null
    // HANDLE ISSUE: check handle again
    const bookHandle = await getBookHandle(comicSeries, book)
    return await bookHandle.getFileHandle(pageName)
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
    getPageHandle,
    isLoading
  }

  return instance
}
