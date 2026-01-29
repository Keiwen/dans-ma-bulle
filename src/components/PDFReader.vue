<script setup>
import { onMounted, ref, watch, computed } from 'vue'
import { useStore } from 'vuex'
import { useFlashMessages } from '@/composables/flashMessages'
import { useLibraryLoader } from '@/composables/libraryLoader'
import { usePageManager } from '@/composables/pageManager'
import PageController from '@/components/PageController'
import PdfReaderManager from '@/components/PDFReaderManager'
import { usePdfiumEngine } from '@embedpdf/engines/vue'
import { EmbedPDF } from '@embedpdf/core/vue'
import { createPluginRegistration } from '@embedpdf/core'

// EMBED PDF Import the essential plugins
import { ViewportPluginPackage, Viewport } from '@embedpdf/plugin-viewport/vue'
import { ScrollPluginPackage } from '@embedpdf/plugin-scroll/vue'
import { DocumentContent, DocumentManagerPluginPackage } from '@embedpdf/plugin-document-manager/vue'
import { RenderLayer, RenderPluginPackage } from '@embedpdf/plugin-render/vue'
import { ZoomPluginPackage, ZoomMode } from '@embedpdf/plugin-zoom/vue'

const store = useStore()
const { addErrorMessage } = useFlashMessages()
const { loadFullBook } = usePageManager()
// EMBED PDF Initialize the engine with the Vue composable
const { engine, isLoading } = usePdfiumEngine()
const plugins = ref([])

const bookSrc = ref(null)
const embedPdfKey = ref(0)
const pageIndex = computed(() => store.getters.getCurrentPageIndex())

const loadFile = async () => {
  const bookHandle = await useLibraryLoader().getBookHandle(store.getters.comicSeries, store.getters.book)
  if (!bookHandle) {
    addErrorMessage('No book found')
    return
  }

  try {
    const bookFile = await bookHandle.getFile()
    // clean previous value
    if (bookSrc.value) {
      URL.revokeObjectURL(bookSrc.value)
    }
    bookSrc.value = URL.createObjectURL(bookFile)
  } catch (e) {
    addErrorMessage('Cannot load PDF file')
    console.error(e)
  }
}

const initPdfReader = () => {
  // EMBED PDF Register the plugins you need
  plugins.value = [
    createPluginRegistration(DocumentManagerPluginPackage, {
      initialDocuments: [{ url: bookSrc.value }]
    }),
    createPluginRegistration(ViewportPluginPackage),
    createPluginRegistration(ScrollPluginPackage, {
      enabled: false
    }),
    createPluginRegistration(RenderPluginPackage),
    createPluginRegistration(ZoomPluginPackage, {
      defaultZoomLevel: ZoomMode.FitPage
    })
  ]
  embedPdfKey.value++
}

const onLoadedDocument = (docState) => {
  loadFullBook(docState.document.pageCount)
}

watch(bookSrc, (newVal) => {
  if (!newVal) return
  initPdfReader()
})

onMounted(async () => {
  await loadFile()
})

</script>

<template>
  <div>
    <div class="page-reader" style="height: 100%">
      <div>
        <div v-if="isLoading || !engine" class="loading-pane">
          Loading PDF Engine...
        </div>

        <!-- 3. Wrap your UI with the <EmbedPDF> provider -->
        <div v-else class="pdf-container">
          <EmbedPDF :engine="engine" :plugins="plugins" v-slot="{ activeDocumentId }" :key="embedPdfKey">
            <DocumentContent
              v-if="activeDocumentId"
              :document-id="activeDocumentId"
              v-slot="{ isLoaded }"
            >
              <pdf-reader-manager :is-loaded="isLoaded" @loaded-document="onLoadedDocument"></pdf-reader-manager>
              <div v-if="isLoaded" style="display: flex; height: 100%; flex-direction: column">
                <Viewport
                  :document-id="activeDocumentId"
                  style="background-color: transparent"
                >
                  <RenderLayer
                    :key="pageIndex"
                    :document-id="activeDocumentId"
                    :page-index="pageIndex"
                  />
                </Viewport>
              </div>
            </DocumentContent>
          </EmbedPDF>
        </div>
      </div>

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
}

.pdf-container {
  height: 72vh;
  width: 51vh;
  overflow: hidden !important;
}
@media (min-width: 700px) {
  /* Desktop */
  .pdf-container {
    height: 137vw;
    width: 97vw;
  }
}

.pdf-viewport {
  overflow: hidden !important;
}
</style>
