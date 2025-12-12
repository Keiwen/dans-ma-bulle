<script setup>
import SeriesSelect from '@/components/SeriesSelect'
import BookSelect from '@/components/BookSelect'
</script>

<template>
  <div>
    <h1>Book selection</h1>
    <series-select class="selection selection-series"></series-select>
    <book-select class="selection selection-book"></book-select>
  </div>
</template>
