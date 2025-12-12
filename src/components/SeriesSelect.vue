<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useStore } from 'vuex'
import { useLibraryLoader } from '@/composables/libraryLoader'

const store = useStore()
const { getSeriesList } = useLibraryLoader()

// data
const selectedSeries = ref('')

// computed
const allSeries = computed(() => getSeriesList())

// watch
watch(selectedSeries, async (newValue) => {
  if (!newValue || newValue === store.getters.comicSeries) return
  store.dispatch('selectComicSeries', newValue)
})

onMounted(async () => {
  selectedSeries.value = store.getters.comicSeries
})
</script>

<template>
  <div>
    <label for="seriesSelect">Series:</label>
    <select id="seriesSelect" v-model="selectedSeries" :class="selectedSeries ? '' : 'empty-select'">
      <option value="" class="placeholder" disabled selected hidden>Select series...</option>
      <option v-for="singleSeries in allSeries" :key="singleSeries" :value="singleSeries">
        {{ singleSeries }}
      </option>
    </select>
  </div>
</template>

<style scoped lang="scss">

</style>
