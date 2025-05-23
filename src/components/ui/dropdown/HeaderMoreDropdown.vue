<template>
  <div
    class="dropdown-tools"
    :class="{ active: showDropdownList }"
    @click="toggleDropdown"
    v-click-outside="closeDropdown"
  >
    <div class="dropdown-title">
      More
      <img
        class="arrow"
        src="@/assets/images/arrow-down.svg"
        alt="Arrow down"
      />
    </div>

    <TransitionWrapper animation-type="roll">
      <div class="list" v-show="showDropdownList">
        <router-link class="list-link" :to="{ name: 'MarketsFarm' }">
          <div class="link-title">
            <img
              class="link-icon"
              src="@/assets/images/header/dropdown/more/farms-icon.svg"
            />
            Farms
          </div>
          <p class="link-description">Farming Opportunities</p>
        </router-link>

        <router-link class="list-link" :to="{ name: 'Beam' }">
          <div class="link-title">
            <img
              class="link-icon"
              src="@/assets/images/header/dropdown/more/beam-icon.svg"
            />
            Beam
          </div>
          <p class="link-description">Move your MIM across networks</p>
        </router-link>

        <a
          href="https://curve.finance/#/ethereum/pools/mim/swap"
          class="list-link"
          target="_blank"
          ><div class="link-title">
            <img
              class="link-icon"
              src="@/assets/images/header/dropdown/more/swap-icon.svg"
            />
            Swap
          </div>
          <p class="link-description">Swap assets</p></a
        >

        <a
          href="https://analytics.abracadabra.money"
          class="list-link"
          target="_blank"
          ><div class="link-title">
            <img
              class="link-icon"
              src="@/assets/images/header/dropdown/more/bars-icon.svg"
            />
            Analytics
          </div>
          <p class="link-description">Explore analytics</p></a
        >

        <a
          href="https://docs.abracadabra.money/learn/"
          class="list-link"
          target="_blank"
          ><div class="link-title">
            <img
              class="link-icon"
              src="@/assets/images/header/dropdown/more/docs-icon.svg"
            />
            Documentation
          </div>
          <p class="link-description">Explore docs</p></a
        >

        <div class="social-media">
          <Lens class="media-link" />
          <GitHub class="media-link" />
          <Discord class="media-link" />
          <Twitter class="media-link" />
          <Mirror class="media-link" />
          <V2 class="media-link" />
        </div>
      </div>
    </TransitionWrapper>
  </div>
</template>

<script>
import V2 from "@/components/ui/icons/V2.vue";
import Lens from "@/components/ui/icons/Lens.vue";
import Mirror from "@/components/ui/icons/Mirror.vue";
import GitHub from "@/components/ui/icons/GitHub.vue";
import Twitter from "@/components/ui/icons/Twitter.vue";
import Discord from "@/components/ui/icons/Discord.vue";
import TransitionWrapper from "@/components/ui/TransitionWrapper.vue";

export default {
  data() {
    return {
      showDropdownList: false,
    };
  },

  methods: {
    toggleDropdown() {
      this.showDropdownList = !this.showDropdownList;
    },

    closeDropdown() {
      this.showDropdownList = false;
    },
  },

  components: {
    Lens,
    Mirror,
    Twitter,
    Discord,
    GitHub,
    V2,
    TransitionWrapper,
  },
};
</script>

<style lang="scss" scoped>
.dropdown-tools {
  position: relative;
  padding: 12px 14px;
  font-size: 14px;
  font-weight: 600;
  line-height: 150%;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;

  .dropdown-title {
    display: flex;
    align-items: center;
  }
}

.arrow {
  margin-left: 5px;
  transition: all 300ms ease-in-out;
}

.list {
  position: absolute;
  top: calc(100% + 12.5px);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 233px;
  padding: 16px;
  gap: 16px;
  border-radius: 12px;
  border: 1px solid #2d4a96;
  background: #101622;
  box-shadow: 0px 4px 32px 0px rgba(103, 103, 103, 0.14);
  backdrop-filter: blur(12.5px);
  overflow: hidden;
}

.list-link {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  width: 100%;
  color: #fff;
  font-size: 16px;
  line-height: 24px;
}

.list-link:hover {
  opacity: 0.5;
}

.link-title {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #fff;
  text-align: center;
  font-size: 16px;
  font-weight: 500;
}

.link-description {
  color: #878b93;
  font-size: 12px;
  font-weight: 400;
}

.active {
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px);
}

.active .arrow {
  transform: rotate(180deg);
}

.social-media {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  padding-top: 8px;
  margin: auto auto 0 auto;
  border-top: 1px solid #7089cc44;
}

.media-link {
  justify-content: center;
  align-items: baseline;
  width: 20px;
  height: 20px;
}
</style>
