import { createStore } from 'vuex'
import VuexPersistence from 'vuex-persist'
import { useStorageInstance } from '@/composables/storageInstance'

// create vuex-persist instance
const vuexPersist = new VuexPersistence({
  // option 1: use local storage
  // storage: window.localStorage,
  // key: PERSISTENCE_KEY
  // option 2: use indexedDB. In this case, you have to set async storage
  // Also in router, wait for restoration before each
  // storage: localForage,
  // option 3: use a specific instance for indexedDB
  storage: useStorageInstance().getStorageInstance(),
  asyncStorage: true,
  key: 'store'
})

export default createStore({
  state: {
    library: '',
    comicSeries: '',
    book: '',
    shelf: {},
    theme: 'light'
  },
  getters: {
    comicSeries: (state) => state.comicSeries,
    book: (state) => state.book,
    theme: (state) => state.theme,
    shelf: (state) => state.shelf,
    getBookOnShelf: (state, getters) => (comicSeries, book) => {
      if (!comicSeries) comicSeries = getters.comicSeries
      if (!comicSeries) return null
      if (!book) book = getters.book
      if (!book) return null
      const comicSeriesOnShelf = state.shelf[comicSeries]
      if (!comicSeriesOnShelf) return null
      return comicSeriesOnShelf[book] ?? null
    },
    getPageIndex: (state, getters) => (comicSeries, book) => {
      const bookOnShelf = getters.getBookOnShelf(comicSeries, book)
      if (!bookOnShelf) return 0
      return bookOnShelf.pageIndex ?? 0
    },
    getCurrentPageIndex: (state, getters) => () => {
      return getters.getPageIndex(getters.comicSeries, getters.book)
    }
  },
  mutations: {
    setLibrary (state, library) {
      state.library = library
    },
    setComicSeries (state, comicSeries) {
      state.comicSeries = comicSeries
    },
    setBook (state, book) {
      state.book = book
    },
    setPageIndex (state, index) {
      const book = state.shelf[state.comicSeries][state.book]
      book.pageIndex = index
    },
    setTheme (state, theme) {
      state.theme = theme
    },
    addBookOnShelf (state, comicSeriesAndBook) {
      if (!state.shelf[comicSeriesAndBook.comicSeries]) state.shelf[comicSeriesAndBook.comicSeries] = {}
      state.shelf[comicSeriesAndBook.comicSeries][comicSeriesAndBook.book] = {
        pageIndex: 0
      }
    },
    resetSelection (state) {
      state.comicSeries = ''
      state.book = ''
    }
  },
  actions: {
    selectLibrary ({ state, commit }, library) {
      if (!library) {
        commit('setLibrary', '')
        commit('resetSelection')
      } else if (library !== state.library) {
        commit('setLibrary', library)
        commit('resetSelection')
      }
    },
    selectComicSeries ({ commit }, comicSeries) {
      commit('setBook', '')
      commit('setComicSeries', comicSeries)
    },
    selectBook ({ getters, dispatch, commit }, book) {
      commit('setBook', book)
      const bookOnShelf = getters.getBookOnShelf(getters.comicSeries, book)
      if (!bookOnShelf) dispatch('addBookOnShelf')
    },
    selectPageIndex ({ commit }, index) {
      commit('setPageIndex', index)
    },
    setTheme ({ commit }, theme) {
      commit('setTheme', theme)
    },
    addBookOnShelf ({ getters, commit }, comicSeries, book) {
      if (!comicSeries) comicSeries = getters.comicSeries
      if (!comicSeries) return null
      if (!book) book = getters.book
      if (!book) return null
      commit('addBookOnShelf', { comicSeries: comicSeries, book: book })
    }
  },
  modules: {
  },
  strict: process.env.NODE_ENV !== 'production',
  plugins: [vuexPersist.plugin]
})
