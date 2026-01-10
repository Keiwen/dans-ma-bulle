<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import { usePageManager } from '@/composables/pageManager'

const store = useStore()
const { pageCount, goToPage } = usePageManager()

const pageNumber = ref(0)
let timeout

// computed
const pageIndex = computed(() => store.getters.getCurrentPageIndex())

const checkChange = () => {
  clearTimeout(timeout)
  timeout = setTimeout(() => {
    changePage()
  }, 800) // after 800 ms without any action, auto-validation
}

const changePage = async () => {
  await goToPage(pageNumber.value)
}

// watch
watch(pageIndex, async (newValue) => {
  pageNumber.value = newValue + 1
})

onMounted(async () => {
  pageNumber.value = pageIndex.value + 1
})
</script>

<template>
  <div>
    <span class="helper">Page</span><br/>
    <input
      v-model="pageNumber"
      type="number"
      pattern="[0-9]*"
      inputmode="numeric"
      @keyup.enter="changePage"
      @blur="changePage"
      @input="checkChange"
    />&nbsp;/&nbsp;{{ pageCount }}
  </div>
</template>

<style scoped lang="scss">

</style>
