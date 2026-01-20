<script setup>
import { onMounted, ref, watch } from 'vue'
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
import { ScrollPluginPackage, Scroller } from '@embedpdf/plugin-scroll/vue'
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

const loadFile = async () => {
  const bookHandle = useLibraryLoader().getBookHandle(store.getters.comicSeries, store.getters.book)
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
    createPluginRegistration(ScrollPluginPackage),
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
    <div class="page-reader">
      <div>
        <div v-if="isLoading || !engine" class="loading-pane">
          Loading PDF Engine...
        </div>

        <!-- 3. Wrap your UI with the <EmbedPDF> provider -->
        <div v-else style="height: 500px">
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
                  style="background-color: #f1f3f5; width: 95%"
                >
                  <Scroller :document-id="activeDocumentId">
                    <template #default="{ page }">
                      <div :style="{ width: page.width + 'px', height: page.height + 'px' }">
                        <!-- The RenderLayer is responsible for drawing the page -->
                        <RenderLayer
                          :document-id="activeDocumentId"
                          :page-index="page.pageIndex"
                        />
                      </div>
                    </template>
                  </Scroller>
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
</style>
