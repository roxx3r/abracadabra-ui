<template>
  <div class="toggle-wrap">
    <div :class="['toggle', { selected: selected }]" @click="updateToggle">
      <div class="indicator"></div>
    </div>
    <span class="text" v-if="text">{{ text }}</span>
  </div>
</template>

<script lang="ts">
export default {
  props: {
    selected: {
      type: Boolean,
      default: false,
    },
    text: {
      type: String,
      default: "",
    },
  },

  methods: {
    updateToggle() {
      this.$emit("updateToggle");
    },
  },
};
</script>

<style lang="scss" scoped>
.toggle-wrap {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.toggle {
  position: relative;
  width: 30px;
  height: 10px;
  border-radius: 3px;
  background: #252a55;
  cursor: pointer;
}

.indicator {
  width: 15px;
  height: 15px;
  border-radius: 4px;
  background: #3a4668;
  position: absolute;
  top: calc(50%);
  left: 0;
  transform: translateY(-50%);
  transition: all 0.3s ease;
}
.selected .indicator {
  left: 100%;
  background: #7088cc;
  transform: translateY(-50%) translateX(-100%);
}

.text {
  line-height: 150%;
}

@media screen and (max-width: 600px) {
  .text {
    font-size: 14px;
    font-weight: 400;
  }
}

@media screen and (max-width: 360px) {
  .text {
    font-size: 11px;
  }
}
</style>
