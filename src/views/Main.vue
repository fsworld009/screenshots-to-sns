<!-- Write everything here for now ? -->
<template>
  <div class="main">
    <div>
      <label>ffmpeg path</label>
      <input type="text" />
    </div>
    <div>
      <label>Images</label>
      <textarea readonly></textarea>
      <!-- <span class="helper-text">Helper text</span> -->
      <!-- <span class="error">There is an error</span> -->
      <br/>
      <button v-on:click="selectImages">Select Images</button>
    </div>
    <div>
      <label>Output path</label>
      <input type="text" />
    </div>
    <div>
      <button>Make Video</button>
    </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { onMounted, onUnmounted, getCurrentInstance } from '@vue/composition-api';
/* eslint-disable class-methods-use-this */

@Component({
  setup(props, context) {
    console.log('asdasda');
    onMounted(() => {
      console.log('here');
      window.backend.on('onSelectImages', (data) => {
        const instance = getCurrentInstance;
        console.log('get', (data as Record<string, unknown>).files);
      });
    });
    onUnmounted(() => {
      window.backend.off('onSelectImages');
    });
  },
})
export default class Main extends Vue {
  selectImages(): void {
    console.log('clicked');
    window.backend.send('selectImages');
  }
}
</script>
