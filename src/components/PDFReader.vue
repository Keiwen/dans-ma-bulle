<script setup>
import { onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import { useFlashMessages } from '@/composables/flashMessages'
import { useLibraryLoader } from '@/composables/libraryLoader'
import PageController from '@/components/PageController'
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
// EMBED PDF Initialize the engine with the Vue composable
const { engine, isLoading } = usePdfiumEngine()
let plugins = []

const bookSrc = ref(null)

const loadFile = async () => {
  const bookHandle = useLibraryLoader().getBookHandle(store.getters.comicSeries, store.getters.book)
  console.log('read', bookHandle)
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
  console.log('init pdf reader')
  // EMBED PDF Register the plugins you need
  plugins = [
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
}

onMounted(async () => {
  await loadFile()
  initPdfReader()
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
          <EmbedPDF :engine="engine" :plugins="plugins" v-slot="{ activeDocumentId }">
            <DocumentContent
              v-if="activeDocumentId"
              :document-id="activeDocumentId"
              v-slot="{ isLoaded }"
            >
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
