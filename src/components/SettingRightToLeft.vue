<script setup>
import { ref, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import { EnhancedToggle } from 'vue-enhanced-check'

const store = useStore()

// data
const rightToLeft = ref(false)

// watch
watch(rightToLeft, async (newValue) => {
  if (newValue === store.getters.rightToLeft) return
  await store.dispatch('setRightToLeft', newValue)
})

onMounted(async () => {
  rightToLeft.value = store.getters.rightToLeft
})
</script>

<template>
  <div>
    <label for="rightToLeft">Reading direction:</label>
    <enhanced-toggle label-on="Right to left" label-off="Left to right"
                     style-on="dmbon" style-off="dmboff"
                     v-model="rightToLeft"
                     id="rightToLeft">
    </enhanced-toggle>
  </div>
</template>

<style scoped lang="scss">

</style>
