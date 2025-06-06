<template>
  <div class="deposit-stake-wrap">
    <div class="condition-management-wrap" v-if="hasStakeLogic">
      <Tabs
        class="tabs"
        :name="activeTab"
        :items="tabItems"
        @select="selectTab"
      />

      <Toggle
        v-if="isToggle"
        text="Balanced"
        :selected="isBalanced"
        @updateToggle="changeBalancedToggle"
      />
    </div>

    <div class="condition-management-wrap flex-end" v-else>
      <Toggle
        v-if="!isStake"
        text="Balanced"
        :selected="isBalanced"
        @updateToggle="changeBalancedToggle"
      />
    </div>

    <Deposit
      :pool="pool"
      :slippage="slippage"
      :deadline="deadline"
      :isBalanced="isBalanced"
      @updatePoolInfo="$emit('updatePoolInfo')"
      v-if="!isStake"
    />

    <Stake
      :pool="pool"
      :slippage="slippage"
      :deadline="deadline"
      :isLock="isLock"
      @updatePoolInfo="$emit('updatePoolInfo')"
      v-else
    />
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";

export default {
  props: {
    pool: { type: Object },
    slippage: { type: BigInt },
    deadline: { type: BigInt },
  },

  emits: ["updatePoolInfo"],

  data() {
    return {
      activeTab: "deposit",
      tabItems: ["deposit", "stake"],
      isLock: false,
      isBalanced: false,
    };
  },

  computed: {
    hasStakeLogic() {
      return this.pool.lockContract || this.pool.stakeContract;
    },

    isStake() {
      return this.activeTab == "stake";
    },

    isArbitrumMimUsdcPool() {
      return this.pool.chainId === 42161 && this.pool.id === 2;
    },

    isToggle() {
      // if (this.isArbitrumMimUsdcPool) return false;
      return !this.isStake;
    },
  },

  methods: {
    selectTab(action) {
      this.activeTab = action;
    },

    changeLockToggle() {
      this.isLock = !this.isLock;
    },

    changeBalancedToggle() {
      this.isBalanced = !this.isBalanced;
    },
  },

  created() {
    if (this.isArbitrumMimUsdcPool) this.isBalanced = true;
  },

  components: {
    Tabs: defineAsyncComponent(() => import("@/components/ui/Tabs.vue")),

    Toggle: defineAsyncComponent(() => import("@/components/ui/Toggle.vue")),

    Deposit: defineAsyncComponent(() =>
      import("@/components/pools/pool/actions/deposit/Deposit.vue")
    ),
  },
};
</script>

<style lang="scss" scoped>
.deposit-stake-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  border-radius: 20px;
  border: 1px solid #00296b;
  background: linear-gradient(
    146deg,
    rgba(0, 10, 35, 0.07) 0%,
    rgba(0, 80, 156, 0.07) 101.49%
  );
  box-shadow: 0px 4px 32px 0px rgba(103, 103, 103, 0.14);
  padding: 24px;
  width: 100%;
}

.condition-management-wrap {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.flex-end {
  justify-content: flex-end;
}

.tabs {
  justify-self: flex-start;
}
</style>
