<template>
  <AppHeader />
  <div class="router-wrap" :style="pageBackground">
    <img
      class="mim-top-bg"
      src="@/assets/images/main-mim-top-bg.png"
      alt="Mim"
    />
    <img
      class="mim-bottom-bg"
      src="@/assets/images/main-mim-bottom-bg.png"
      alt="Mim"
    />
    <MlpMigrationBanner />
    <router-view v-slot="{ Component, route }">
      <TransitionGroup
        @before-enter="beforeEnter"
        @enter="enter"
        @leave="leave"
      >
        <div :key="route.name">
          <component :is="Component" />
        </div>
      </TransitionGroup>
    </router-view>
  </div>
  <NotificationContainer />
  <PopupsWrapper />
  <GlpBanner />
  <SkullBanner />
  <OldAllowanceBanner />
  <TenderlyMod />
</template>

<script>
import { defineAsyncComponent } from "vue";
import { useAnimation } from "@/helpers/useAnimation/useAnimation";
import { checkLocation } from "@/helpers/useLocation";
// import Banner from "./components/ui/Banner.vue";

export default {
  data() {
    return {};
  },

  methods: {
    ...useAnimation("fade"),
  },

  async beforeCreate() {
    return
    const isRestricted = await checkLocation();
    if (isRestricted) {
      document.location.href = "https://abracadabra.money/location";
    }
  },

  components: {
    AppHeader: defineAsyncComponent(() =>
      import("@/components/app/AppHeader.vue")
    ),
    NotificationContainer: defineAsyncComponent(() =>
      import("@/components/notifications/NotificationContainer.vue")
    ),
    PopupsWrapper: defineAsyncComponent(() =>
      import("@/components/popups/PopupsWrapper.vue")
    ),
    MlpMigrationBanner: defineAsyncComponent(() =>
      import("@/components/ui/MlpMigrationBanner.vue")
    ),
    GlpBanner: defineAsyncComponent(() =>
      import("@/components/ui/GLpBanner.vue")
    ),
    SkullBanner: defineAsyncComponent(() =>
      import("@/components/ui/SkullBanner.vue")
    ),
    OldAllowanceBanner: defineAsyncComponent(() =>
      import("@/components/ui/OldAllowanceBanner.vue")
    ),
    TenderlyMod: defineAsyncComponent(() =>
      import("@/components/tenderly/TenderlyMod.vue")
    ),
  },
};
</script>

<style lang="scss" src="@/assets/styles/main.scss"></style>
