<script setup>
import { computed, watch } from 'vue'
import { useStore } from 'vuex'

import { useActiveDocument } from '@embedpdf/plugin-document-manager/vue'
import { useScroll } from '@embedpdf/plugin-scroll/vue'

const props = defineProps({
  documentId: { type: String },
  isLoaded: { type: Boolean }
})
const store = useStore()
const emit = defineEmits(['loaded-document'])

const { activeDocument } = useActiveDocument()
const { provides: scroll, state } = useScroll(() => props.documentId)

const pageIndex = computed(() => store.getters.getCurrentPageIndex())

watch(() => props.isLoaded, (newValue) => {
  if (newValue) {
    emit('loaded-document', activeDocument.value)
    const pageNumber = pageIndex.value
    // next tick is not enough
    setTimeout(() => {
      scroll.value?.scrollToPage({ pageNumber })
    }, 500)
  }
})
watch(() => state.value.currentPage, async (newValue) => {
  // page changed inside PDF viewer
  if (newValue && newValue !== pageIndex.value + 1) {
    await store.dispatch('selectPageIndex', newValue - 1)
  }
})
watch(() => pageIndex.value, async (newValue) => {
  // page changed outside PDF viewer
  if (newValue && newValue !== state.value.currentPage - 1) {
    const pageNumber = newValue
    scroll.value?.scrollToPage({ pageNumber })
  }
})

</script>

<template>
  <div>
  </div>
</template>

<style scoped lang="scss">
</style>
