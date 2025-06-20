<template>
  <div class="pool-action-block">
    <div class="inputs-wrap">
      <BaseTokenInput
        :name="pool.name"
        :icon="pool.icon"
        :decimals="pool.decimals"
        :max="pool.userInfo.balance"
        :value="inputValue"
        :tokenPrice="pool.price"
        @updateInputValue="updateValue($event)"
      />
    </div>

    <p class="slippage-included-message">Output amounts include slippage</p>

    <PreviewRemove
      :pool="pool"
      :previewRemoveLiquidityResult="previewRemoveLiquidityResult"
      :isBase="isBase"
      :isSingleSide="isSingleSide"
      @chooseToken="chooseToken($event)"
    />

    <BaseButton primary @click="actionHandler" :disabled="isButtonDisabled">
      {{ buttonText }}
    </BaseButton>
  </div>
</template>

<script>
import moment from "moment";
import { defineAsyncComponent } from "vue";
import { mapActions, mapGetters, mapMutations } from "vuex";
import { formatUnits } from "viem";
import { notificationErrorMsg } from "@/helpers/notification/notificationError.js";
import notification from "@/helpers/notification/notification";
import { approveToken } from "@/helpers/approval";
import { trimZeroDecimals } from "@/helpers/numbers";
import {
  previewRemoveLiquidity,
  previewRemoveLiquidityOneSide,
} from "@/helpers/pools/swap/liquidity";
import { applySlippageToMinOutBigInt } from "@/helpers/gm/applySlippageToMinOut";
import { removeLiquidity } from "@/helpers/pools/swap/actions/removeLiquidity";
import { removeLiquidityOneSide } from "@/helpers/pools/swap/actions/removeLiquidityOneSide";
import { formatTokenBalance } from "@/helpers/filters";
import { switchNetwork } from "@/helpers/chains/switchNetwork";
import { openConnectPopup } from "@/helpers/connect/utils";

export default {
  props: {
    pool: { type: Object },
    slippage: { type: BigInt, default: 100n },
    deadline: { type: BigInt, default: 100n },
    isSingleSide: { type: Boolean },
  },

  emits: ["updatePoolInfo"],

  data() {
    return {
      inputAmount: 0n,
      inputValue: "",
      isBase: true,
      isActionProcessing: false,
    };
  },

  computed: {
    ...mapGetters({
      chainId: "getChainId",
      account: "getAccount",
    }),

    isAllowed() {
      return this.pool.userInfo.allowance >= this.inputAmount;
    },

    previewRemoveLiquidityResult() {
      const previewRemoveLiquidityResult = this.isSingleSide
        ? previewRemoveLiquidityOneSide(this.inputAmount, this.pool)
        : previewRemoveLiquidity(this.inputAmount, this.pool);

      previewRemoveLiquidityResult.baseAmountOut = applySlippageToMinOutBigInt(
        this.slippage,
        previewRemoveLiquidityResult.baseAmountOut
      );

      previewRemoveLiquidityResult.quoteAmountOut = applySlippageToMinOutBigInt(
        this.slippage,
        previewRemoveLiquidityResult.quoteAmountOut
      );

      return previewRemoveLiquidityResult;
    },

    isValid() {
      return !!this.inputAmount;
    },

    error() {
      if (this.inputAmount > this.pool.userInfo.balance)
        return "Insufficient balance";

      return null;
    },

    buttonText() {
      if (!this.isProperNetwork) return "Switch network";
      if (!this.account) return "Connect wallet";
      if (this.error) return this.error;
      if (this.inputValue == "") return "Enter amount";

      if (this.isActionProcessing) return "Processing...";
      if (!this.isAllowed) return "Approve";

      return "Remove";
    },

    isButtonDisabled() {
      return (
        (!this.isValid || !!this.error || this.isActionProcessing) &&
        this.isProperNetwork &&
        !!this.account
      );
    },

    isProperNetwork() {
      return this.chainId == this.pool.chainId;
    },
  },

  watch: {
    inputAmount(value) {
      if (value == 0) {
        this.inputValue = "";
        return false;
      }

      this.inputValue = trimZeroDecimals(
        formatUnits(value, this.pool.decimals)
      );
    },
  },

  methods: {
    ...mapActions({ createNotification: "notifications/new" }),
    ...mapMutations({ deleteNotification: "notifications/delete" }),

    updateValue(value) {
      if (value === null) return (this.inputAmount = 0n);
      this.inputAmount = value;
    },

    resetInput() {
      this.inputValue = "";
      this.inputAmount = 0n;
    },

    chooseToken(isBase) {
      this.isBase = isBase;
    },

    createRemovePayload() {
      const { baseAmountOut, quoteAmountOut } =
        this.previewRemoveLiquidityResult;

      const deadline = moment().unix() + Number(this.deadline);

      return {
        lp: this.pool.contract.address,
        to: this.account,
        sharesIn: this.inputAmount,
        minimumBaseAmount: baseAmountOut,
        minimumQuoteAmount: quoteAmountOut,
        deadline: deadline,
      };
    },

    createRemoveOneSidePayload() {
      const { baseAmountOut, quoteAmountOut } =
        this.previewRemoveLiquidityResult;

      const minAmountOut = this.isBase ? baseAmountOut : quoteAmountOut;

      const deadline = moment().unix() + Number(this.deadline);

      return {
        lp: this.pool.contract.address,
        to: this.account,
        withdrawBase: this.isBase,
        sharesIn: this.inputAmount,
        minAmountOut,
        deadline,
      };
    },

    async approveHandler() {
      this.isActionProcessing = true;

      const notificationId = await this.createNotification(
        notification.approvePending
      );

      try {
        await approveToken(
          this.pool.contract,
          this.pool.swapRouter,
          this.inputAmount
        );
        await this.$emit("updatePoolInfo");

        await this.deleteNotification(notificationId);
      } catch (error) {
        console.log("approve err:", error);

        const errorNotification = {
          msg: await notificationErrorMsg(error),
          type: "error",
        };

        await this.deleteNotification(notificationId);
        await this.createNotification(errorNotification);
      }
      this.isActionProcessing = false;
    },

    async removeHandler() {
      this.isActionProcessing = true;

      const notificationId = await this.createNotification(
        notification.pending
      );

      try {
        const payload = this.createRemovePayload();

        const { error, result } = await removeLiquidity(
          this.pool.swapRouter,
          payload
        );

        await this.$emit("updatePoolInfo");

        await this.deleteNotification(notificationId);
        await this.createNotification(notification.success);
        this.resetInput();
      } catch (error) {
        console.log("remove liquidity err:", error);

        const errorNotification = {
          msg: await notificationErrorMsg(error),
          type: "error",
        };

        await this.deleteNotification(notificationId);
        await this.createNotification(errorNotification);
      }
      this.isActionProcessing = false;
    },

    async removeOneSideHandler() {
      this.isActionProcessing = true;

      const notificationId = await this.createNotification(
        notification.pending
      );

      try {
        const payload = this.createRemoveOneSidePayload();

        const { error, result } = await removeLiquidityOneSide(
          this.pool.swapRouter,
          payload
        );

        await this.$emit("updatePoolInfo");

        await this.deleteNotification(notificationId);
        await this.createNotification(notification.success);
        this.resetInput();
      } catch (error) {
        console.log("remove liquidity err:", error);

        const errorNotification = {
          msg: await notificationErrorMsg(error),
          type: "error",
        };

        await this.deleteNotification(notificationId);
        await this.createNotification(errorNotification);
      }
      this.isActionProcessing = false;
    },

    async actionHandler() {
      if (this.isButtonDisabled) return false;
      if (!this.isProperNetwork) return switchNetwork(this.pool.chainId);
      if (!this.account) return openConnectPopup();

      if (!this.isAllowed) return await this.approveHandler();

      if (this.isSingleSide) {
        await this.removeOneSideHandler();
      } else {
        await this.removeHandler();
      }

      await this.$emit("updatePoolInfo");
    },

    formatTokenBalance(value, decimals) {
      return formatTokenBalance(formatUnits(value, decimals));
    },
  },

  components: {
    BaseTokenInput: defineAsyncComponent(() =>
      import("@/components/base/BaseTokenInput.vue")
    ),
    BaseButton: defineAsyncComponent(() =>
      import("@/components/base/BaseButton.vue")
    ),
    PreviewRemove: defineAsyncComponent(() =>
      import("@/components/pools/pool/PreviewRemove.vue")
    ),
  },
};
</script>

<style lang="scss" scoped>
.pool-action-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 100%;
}

.inputs-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.plus-icon {
  position: absolute;
  top: calc(50% - 28px);
  left: calc(50% - 28px);
  width: 46px;
  height: 46px;
}

.slippage-included-message {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #2d4a96;
  background: linear-gradient(
    90deg,
    rgba(45, 74, 150, 0.12) 0%,
    rgba(116, 92, 210, 0.12) 100%
  );
  box-shadow: 0px 4px 33px 0px rgba(0, 0, 0, 0.06);
}
</style>
