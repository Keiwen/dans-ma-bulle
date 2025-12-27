import { ref } from 'vue'

let instance = null

export function useFlashMessages () {
  if (instance) return instance // always return instance if exist

  const flashMessages = ref([])

  const addMessage = (messageObject) => {
    flashMessages.value.push(messageObject)
  }

  const addSuccessMessage = (content, messageTitle = '', toPersistOnce = false) => {
    addMessage({ type: 'success', message: content, title: messageTitle, persistOnce: toPersistOnce })
  }

  const addInfoMessage = (content, messageTitle = '', toPersistOnce = false) => {
    addMessage({ type: 'info', message: content, title: messageTitle, persistOnce: toPersistOnce })
  }

  const addWarningMessage = (content, messageTitle = '', toPersistOnce = false) => {
    addMessage({ type: 'warning', message: content, title: messageTitle, persistOnce: toPersistOnce })
  }

  const addErrorMessage = (content, messageTitle = '', toPersistOnce = false) => {
    addMessage({ type: 'error', message: content, title: messageTitle, persistOnce: toPersistOnce })
  }

  const clearMessage = (index) => {
    flashMessages.value.splice(index, 1)
  }

  const clearAllMessages = () => {
    const persisted = []
    for (const message of flashMessages.value) {
      if (message.persistOnce) {
        message.persistOnce = false
        persisted.push(message)
      }
    }
    flashMessages.value = persisted
  }

  instance = { flashMessages, addSuccessMessage, addInfoMessage, addWarningMessage, addErrorMessage, clearMessage, clearAllMessages }
  return instance
}
