import { ref } from 'vue'
import { useFlashMessages } from '@/composables/flashMessages'
import { BOOK_TYPE_ZIP } from '@/constants'
import JSZip from 'jszip'

let instance = null

export function useArchiveParser () {
  if (instance) return instance // always return instance if exist

  const { addErrorMessage } = useFlashMessages()
  const archiveFile = ref(null)
  const bookType = ref(null)
  const pageCount = ref(0)
  let pagesList = []

  const loadArchiveFile = async (bookHandle) => {
    if (!bookHandle) {
      addErrorMessage('No book found')
      return
    }

    try {
      archiveFile.value = null
      bookType.value = bookHandle.__bookType
      pageCount.value = 0
      pagesList = []
      const bookFile = await bookHandle.getFile()

      switch (bookType.value) {
        case BOOK_TYPE_ZIP: await loadFileAsZip(bookFile); break
        default:
          addErrorMessage('Unknown archive type ' + bookType.value)
      }
    } catch (e) {
      addErrorMessage('Cannot load archive file')
      console.error(e)
    }
  }

  const loadArchivePage = async (index) => {
    if (index < 0 || index >= pageCount.value) {
      addErrorMessage('No page found')
      return null
    }
    switch (bookType.value) {
      case BOOK_TYPE_ZIP: return await loadPageFromZip(index)
    }
    return null
  }

  const loadFileAsZip = async (bookFile) => {
    try {
      archiveFile.value = await JSZip.loadAsync(bookFile)
      pageCount.value = 0
      archiveFile.value.forEach((relativePath, zipEntry) => {
        // zip entries, mixing dir AND files
        if (!zipEntry.dir) {
          pagesList.push(zipEntry)
          pageCount.value++
        }
      })
    } catch (e) {
      console.error('Failed to load ZIP archive:', e)
    }
  }

  const loadPageFromZip = async (index) => {
    if (!pagesList[index]) return null
    const zipEntry = pagesList[index]
    return await zipEntry.async('blob')
  }

  instance = {
    loadArchiveFile,
    loadArchivePage,
    pageCount
  }
  return instance
}
