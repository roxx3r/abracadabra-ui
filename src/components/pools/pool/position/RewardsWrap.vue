<template>
  <div class="token-rewards-wrap" v-if="tokenRewards">
    <div class="title-wrap">
      <h4 class="title">{{ titleText }}</h4>
      <div class="apr-wrap" v-if="!rewardPointsType">
        <Tooltip
          v-if="poolRewards && poolRewards.length > 1"
          :width="18"
          :height="18"
          fill="#ffffff"
          :tooltip="''"
        />

        <div class="apr-info" v-if="poolRewards && poolRewards.length > 1">
          <div
            class="apr-item"
            v-for="item in poolRewards"
            :key="item.token.address"
          >
            <img :src="item.token.icon" alt="" class="token-icon" />
            <p class="name">{{ item.token.name }}:</p>
            <p class="apr">{{ Number(item.apr).toFixed(2) }}%</p>
          </div>
          <!-- <div class="apr-item total-item">
              <p class="name">Total:</p>
              <p class="apr">
                {{ Number(pool.poolAPR.totalApr).toFixed(2) }} %
              </p>
            </div> -->
        </div>

        <p class="apr">APR {{ Number(pool.poolAPR.totalApr).toFixed(2) }} %</p>
      </div>
    </div>

    <RewardPointsTagWrap
      icon
      name
      multiplier
      :rewardPointsType="rewardPointsType"
      v-if="rewardPointsType"
    />

    <ul class="rewards-list" v-if="tokenRewards && !rewardPointsType">
      <li class="list-item" v-for="(item, index) in tokenRewards" :key="index">
        <img :src="item.token.icon" class="reward-icon" />

        <div class="values-wrap">
          <p class="item-value">{{ item.value }}</p>
          <p class="usd-value" v-if="item.price">{{ item.usd }}</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { formatUnits } from "viem";
import { formatUSD, formatTokenBalance } from "@/helpers/filters";
import { getCoinsPrices } from "@/helpers/prices/defiLlama/index.ts";
import { defineAsyncComponent } from "vue";

export default {
  name: "RewardsWrap",
  props: {
    pool: { type: Object, required: true },
  },
  computed: {
    isPoolHasReward() {
      return this.pool.stakeInfo ?? false;
    },

    poolRewards() {
      if (!this.isPoolHasReward) return;
      return this.pool.stakeInfo.earnedInfo;
    },

    tokenRewards() {
      if (!this.isPoolHasReward) return false;

      const rewards = this.poolRewards.map((info) => {
        const value = this.formatTokenBalance(info.earned, info.token.decimals);
        const usd = formatUSD(
          formatUnits(info.earned, info.token.decimals) * info.price
        );

        return {
          ...info,
          value,
          usd,
        };
      });

      return rewards;
    },

    rewardPointsType() {
      return this.pool.config.settings.rewardPointsType;
    },

    titleText() {
      return this.rewardPointsType ? "Earning Rewards" : "Rewards Earned";
    },
  },
  methods: {
    formatTokenBalance(value, decimals) {
      return formatTokenBalance(formatUnits(value, decimals));
    },
    async fetchRewardPrice() {
      if (!this.reward) return false;

      const prices = await getCoinsPrices(this.pool.chainId, [
        this.reward.address,
      ]);

      const rewardPrice = prices.find(
        (price) => price.address === this.reward.address
      );

      if (rewardPrice) this.price = rewardPrice.price;
    },
  },
  created() {
    this.fetchRewardPrice();
  },
  components: {
    Tooltip: defineAsyncComponent(() =>
      import("@/components/ui/icons/Tooltip.vue")
    ),
    RewardPointsTagWrap: defineAsyncComponent(() =>
      import("@/components/pools/rewardPoints/RewardPointsTagWrap.vue")
    ),
  },
};
</script>

<style scoped lang="scss">
.title-wrap {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.apr-wrap {
  display: flex;
  align-items: center;
  gap: 3px;
  position: relative;
  // cursor: pointer;

  &:hover {
    .apr-info {
      z-index: 100;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  }

  .apr-info {
    display: none;
    z-index: -100;
    position: absolute;
    left: -92px;
    bottom: 100%;
    min-width: 200px;
    border-radius: 12px;
    background: #15192a;
    box-shadow: 0px 4px 32px 0px rgba(103, 103, 103, 0.14);
    padding: 12px;
    transition: opacity 0.3s ease;

    .total-item {
      border-top: 1px solid rgba(255, 255, 255, 0.12);
      padding-top: 8px;
    }

    .apr-item {
      width: 100%;
      display: flex;
      align-items: center;
      font-size: 14px;
      // margin-bottom: 8px;

      .token-icon {
        width: 20px;
        height: 20px;
        object-fit: contain;
        margin-right: 4px;
      }

      .name {
        color: #878b93;
      }

      .apr {
        font-weight: 500;
        margin-left: auto;
        text-align: right;
      }
    }
  }
}

.token-rewards-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rewards-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  list-style: none;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.reward-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.values-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  .item-value {
    font-size: 16px;
    font-weight: 400;
    line-height: 1.2;
  }

  .usd-value {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 400;
    line-height: 1;
  }
}

.apr {
  color: #fff;
  text-shadow: 0px 0px 16px #ab5de8;
  font-size: 16px;
  font-weight: 600;
}
</style>
