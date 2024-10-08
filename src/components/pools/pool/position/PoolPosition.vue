<template>
  <div
    :class="['backdrop', { isOpened: isMyPositionPopupOpened }]"
    @click.self="closePopup"
  ></div>
  <div :class="['pool-position-wrap', { isOpened: isMyPositionPopupOpened }]">
    <img
      class="close"
      src="@/assets/images/close-icon.png"
      alt="Close popup"
      @click="closePopup"
    />

    <div class="pool-position">
      <Tabs
        :name="activeTab"
        :items="tabItems"
        @select="selectTab"
        v-if="showTabs"
      />

      <p class="position-title" v-if="!showTabs && activeTab === 'deposited'">
        Your Magic LP
      </p>

      <Deposited
        :pool="pool"
        @updatePoolInfo="$emit('updateInfo')"
        v-show="activeTab === 'deposited'"
      />

      <template v-if="hasLockLogic || hasStakeLogic">
        <Staked
          :pool="pool"
          @updatePoolInfo="$emit('updateInfo')"
          v-show="activeTab === 'staked'"
        />

        <Locked
          v-if="hasLockLogic"
          :pool="pool"
          v-show="activeTab === 'locked'"
        />
      </template>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";

export default {
  props: {
    pool: { type: Object },
    isMyPositionPopupOpened: { type: Boolean, default: false },
  },

  emits: ["closePopup", "updateInfo"],

  data() {
    return {
      activeTab: "deposited",
    };
  },

  computed: {
    hasLockLogic() {
      return !!this.pool.lockInfo;
    },
    hasStakeLogic() {
      return !!this.pool.stakeInfo;
    },
    tabItems() {
      return ["deposited", "staked"];
    },
    showTabs() {
      return this.hasLockLogic || this.hasStakeLogic;
    },
  },

  methods: {
    selectTab(action) {
      this.activeTab = action;
    },

    closePopup() {
      this.$emit("closePopup");
    },
  },

  components: {
    Tabs: defineAsyncComponent(() =>
      import("@/components/pools/pool/position/Tabs.vue")
    ),
    Deposited: defineAsyncComponent(() =>
      import("@/components/pools/pool/position/Deposited.vue")
    ),
    Staked: defineAsyncComponent(() =>
      import("@/components/pools/pool/position/Staked.vue")
    ),
    Locked: defineAsyncComponent(() =>
      import("@/components/pools/pool/position/Locked.vue")
    ),
  },
};
</script>

<style lang="scss" scoped>
.position-title {
  font-size: 18px;
  font-weight: 500;
  line-height: 22px;
}

.pool-position-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 129px;
  z-index: 3;
}

.pool-position {
  display: flex;
  flex-direction: column;
  width: 354px;
  padding: 16px;
  gap: 16px;
  border-radius: 16px;
  border: 1px solid #00296b;

  background: linear-gradient(
    146deg,
    rgba(0, 10, 35, 0.07) 0%,
    rgba(0, 80, 156, 0.07) 101.49%
  );

  box-shadow: 0px 4px 32px 0px rgba(103, 103, 103, 0.14);
  backdrop-filter: blur(12.5px);
}

.points-earned {
  display: none !important;
}

.blast-icon {
  width: 28px;
  height: 28px;
  margin-right: 10px;
  border-radius: 50px;
}

.close {
  align-self: flex-end;
  display: none;
  transition: opacity 0.3s ease-in-out;
  cursor: pointer;
}

.close:hover {
  opacity: 0.5;
}

@media (max-width: 1400px) {
  .backdrop {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: none;
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: end;
    background: rgba(25, 25, 25, 0.1);
    backdrop-filter: blur(10px);
    z-index: 2;
  }

  .pool-position-wrap {
    position: fixed;
    top: initial;
    left: 0;
    right: 0;
    bottom: 0;
    display: none;
    width: 100%;
    padding: 16px 20px;
    gap: 16px;
    border-radius: 20px 20px 0 0;
    border: 1px solid #342866;
    background: #101622;
    box-shadow: 0px 4px 32px 0px rgba(103, 103, 103, 0.14);
    backdrop-filter: blur(20px);
  }

  .pool-position {
    width: 100%;
    max-width: 385px;
    padding: 0;
    border: none;
    background: transparent;
    box-shadow: none;
  }

  .close {
    align-self: flex-end;
    display: block;
  }

  .points-earned {
    display: flex !important;
  }

  .points-earned-row {
    display: none;
  }

  .isOpened {
    display: flex !important;
  }
}

@media screen and (max-width: 500px) {
  .pool-position {
    min-width: 100%;
  }
}
</style>
