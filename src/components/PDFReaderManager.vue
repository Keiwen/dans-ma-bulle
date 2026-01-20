<script setup>
import { watch } from 'vue'

import { useActiveDocument } from '@embedpdf/plugin-document-manager/vue'

const props = defineProps({
  documentId: { type: String },
  isLoaded: { type: Boolean }
})
const emit = defineEmits(['loaded-document'])

const { activeDocument } = useActiveDocument()

watch(() => props.isLoaded, (newValue) => {
  if (newValue) {
    emit('loaded-document', activeDocument.value)
  }
})

</script>

<template>
  <div>
  </div>
</template>

<style scoped lang="scss">
</style>
