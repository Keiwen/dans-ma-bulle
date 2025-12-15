<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import PageInfo from '@/components/PageInfo'
import { usePageManager } from '@/composables/pageManager'

const store = useStore()
const { goToPage, isCurrentPageIsFirst, isCurrentPageIsLast } = usePageManager()

const isFirstPage = ref(false)
const isLastPage = ref(false)

// computed
const pageIndex = computed(() => store.getters.getCurrentPageIndex())
const rightToLeft = computed(() => store.getters.rightToLeft)
const leftLabel = computed(() => rightToLeft.value ? 'Next' : 'Previous')
const rightLabel = computed(() => rightToLeft.value ? 'Previous' : 'Next')

const toLeftPage = async () => {
  rightToLeft.value ? await nextPage() : await previousPage()
}

const toRightPage = async () => {
  rightToLeft.value ? await previousPage() : await nextPage()
}

const previousPage = async () => {
  await goToPage(pageIndex.value)
}

const nextPage = async () => {
  await goToPage(pageIndex.value + 2)
}

// watch
watch(pageIndex, async (newValue) => {
  isFirstPage.value = isCurrentPageIsFirst()
  isLastPage.value = isCurrentPageIsLast()
})

onMounted(async () => {
  isFirstPage.value = isCurrentPageIsFirst()
  isLastPage.value = isCurrentPageIsLast()
})
</script>

<template>
  <div class="page-controller">
    <button class="page-controller-zone left-zone btn" @click="toLeftPage" :disabled="rightToLeft ? isLastPage : isFirstPage">&laquo; {{ leftLabel }}</button>
    <page-info class="info-zone"></page-info>
    <button class="page-controller-zone right-zone btn" @click="toRightPage" :disabled="rightToLeft ? isFirstPage : isLastPage">{{ rightLabel }} &raquo;</button>
  </div>
</template>

<style scoped lang="scss">

</style>
