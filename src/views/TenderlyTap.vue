<template>
  <div class="tendarly-tap-view">
    <div class="tenderly-tap">
      <h3 class="title">Tendarly Tap</h3>

      <div class="wrapper">
        <div class="actions">
          <CreateForkBlock />

          <ForkActionsBlock
            :primaryTab="currentTabComponent"
            @changeTab="changeTabComponent"
          />

          <component
            v-if="activeFork"
            v-bind:is="currentTabComponent"
            :activeFork="activeFork"
          ></component>

          <EmptyState v-else />
        </div>

        <ForksInfoBlock />
      </div>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";

export default {
  data() {
    return {
      forksData: JSON.parse(localStorage.getItem("tenderly_fork_data")),
      currentTabComponent: "WalletTopUpBlock",
    };
  },

  computed: {
    activeFork() {
      if (!this.forksData) return null;
      return this.forksData.find((forkData) => {
        if (forkData.useFork) return forkData;
      });
    },
  },

  methods: {
    changeTabComponent(componentName) {
      this.currentTabComponent = componentName;
    },
  },

  components: {
    CreateForkBlock: defineAsyncComponent(() =>
      import("@/components/tenderly/CreateForkBlock.vue")
    ),
    ForkActionsBlock: defineAsyncComponent(() =>
      import("@/components/tenderly/ForkActionsBlock.vue")
    ),
    WalletTopUpBlock: defineAsyncComponent(() =>
      import("@/components/tenderly/WalletTopUpBlock.vue")
    ),
    GasTopUpBlock: defineAsyncComponent(() =>
      import("@/components/tenderly/GasTopUpBlock.vue")
    ),
    CauldronTopUpBlock: defineAsyncComponent(() =>
      import("@/components/tenderly/CauldronTopUpBlock.vue")
    ),
    AddLiquidityBlock: defineAsyncComponent(() =>
      import("@/components/tenderly/AddLiquidityBlock.vue")
    ),
    ForksInfoBlock: defineAsyncComponent(() =>
      import("@/components/tenderly/ForksInfoBlock.vue")
    ),
    EmptyState: defineAsyncComponent(() =>
      import("@/components/tenderly/EmptyState.vue")
    ),
  },
};
</script>

<style lang="scss" scoped>
.tendarly-tap-view {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100px 15px;
}

.tenderly-tap {
  background: #2a2835;
  padding: 50px 30px;
  max-width: 1100px;
  width: 100%;
  border-radius: 30px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.title {
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  text-transform: uppercase;
}

.wrapper {
  display: flex;
  justify-content: space-between;
  gap: 15px;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.underline {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

@media screen and (max-width: 1024px) {
  .wrapper {
    flex-direction: column;
    gap: 30px;
  }
}
</style>
