<script setup>
import PackageJson from '@/../package.json'
import SettingTheme from '@/components/SettingTheme'

const appVersion = PackageJson.version

</script>

<template>
  <div>
    <h1>Settings</h1>
    <router-link to="/setup" class="btn btn-secondary">Library setup</router-link>
    <hr/>
    <p class="help">You are using version {{ appVersion }}</p>
    <div class="settings-container">
      <setting-theme></setting-theme>
    </div>
  </div>
</template>

<style>
  .settings-container > div {
    margin-bottom: 15px;
  }
</style>
