<script setup>
import { useFlashMessages } from '@/composables/flashMessages'
import { computed } from 'vue'
import NavBar from '@/components/NavBar'
import { useStore } from 'vuex'

const { flashMessages, clearMessage } = useFlashMessages()
const store = useStore()
const messages = computed(() => flashMessages.value)
const themeName = computed(() => store.getters.theme)

const computeAlertClass = (type) => {
  switch (type) {
    case 'error': return 'alert-danger'
    default:
      return 'alert-' + type
  }
}

</script>

<template>
  <div :class="'theme-'+themeName">
    <nav-bar></nav-bar>
    <div class="message-container">
      <div v-for="(message, msgIndex) in messages" :key="msgIndex" class="alert" :class="computeAlertClass(message.type)" @click="clearMessage(msgIndex)">
        {{ message.message }}
      </div>
    </div>
    <router-view class="content"/>
  </div>
</template>

<style lang="scss">
#app {
  & > div.theme-dark {
    --main-color: #C5FDFE;
    --main-bg: #00161E;
    --main-bg-alpha: #04405140; // rgba(main-bg, 0.3)
    --light-bg: #02404C;
    --border-radius: 50px;
    --primary: #DDB04B;
    --primary-alpha: #DDB04B40;
  }
  & > div.theme-light {
    --main-color: #0C487B;
    --main-bg: #FFFDF4;
    --main-bg-alpha: #FFFDF34D;
    --light-bg: #76D4EA;
    --border-radius: 50px;
    --light: #000000;
    --dark: #FFFFFF;
    --primary: #0C487B;
    --primary-alpha: #0C487B40;
  }
}

</style>
