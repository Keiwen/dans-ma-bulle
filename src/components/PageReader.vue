<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { usePageManager } from '@/composables/pageManager'
import { useFlashMessages } from '@/composables/flashMessages'
import PageController from '@/components/PageController'

const store = useStore()
const { loadPages, getCurrentPage } = usePageManager()
const { addErrorMessage } = useFlashMessages()

const pageSrc = ref(null)

// computed
const pageIndex = computed(() => store.getters.getCurrentPageIndex())

const loadPage = async () => {
  const pageHandle = getCurrentPage()
  if (!pageHandle) {
    addErrorMessage('No page found')
    return
  }

  try {
    const imageFile = await pageHandle.getFile()
    // clean previous value
    if (pageSrc.value) {
      URL.revokeObjectURL(pageSrc.value)
    }
    pageSrc.value = URL.createObjectURL(imageFile)
  } catch (e) {
    addErrorMessage('Cannot load image file')
    console.error(e)
  }
}

// watch
watch(pageIndex, async (newValue) => {
  await loadPage()
})

onMounted(async () => {
  await loadPages()
  await loadPage()
})
</script>

<template>
  <div>
    <div class="page-reader">
      <img :src="pageSrc" :alt="'Page ' + (pageIndex+1)" width="100%" />
      <page-controller></page-controller>
    </div>
  </div>
</template>

<style scoped lang="scss">
.page-reader {
  width: 100%;
  height: 100%;
  z-index: 20;
  position: relative;

  img {
    display: block;
    width: 100%;
    height: auto;
    border: 2px solid var(--light);
    margin-bottom: 2px;
  }
}
</style>
