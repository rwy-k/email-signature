<template>
  <div
    class="loader-container"
    :class="{ fullscreen: fullscreen, inline: inline }"
  >
    <div class="loader-content">
      <div class="spinner"></div>
      <p v-if="message" class="loader-message">{{ message }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Loader",
  props: {
    fullscreen: {
      type: Boolean,
      default: false,
    },
    inline: {
      type: Boolean,
      default: false,
    },
    message: {
      type: String,
      default: "Loading...",
    },
  },
});
</script>

<style scoped>
.loader-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.loader-container.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 9999;
}

.loader-container.inline {
  display: inline-flex;
  padding: 0;
  margin-left: 10px;
}

.loader-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 121, 193, 0.2);
  border-radius: 50%;
  border-top-color: #0079c1;
  animation: spin 1s ease-in-out infinite;
}

.loader-container.inline .spinner {
  width: 20px;
  height: 20px;
  border-width: 2px;
}

.loader-message {
  margin-top: 10px;
  font-size: 14px;
  color: #555;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
