<template>
  <header class="header">
    <img
      src="@/assets/images/magic-crystal.png"
      alt=""
      class="main-logo"
      @click="toHome"
    />

    <nav class="nav">
      <router-link class="header-link" :to="{ name: 'Borrow' }"
        >Borrow</router-link
      >
      <router-link class="header-link" :to="{ name: 'Leverage' }"
        >Leverage</router-link
      >
      <router-link class="header-link" :to="{ name: 'StatsBorrow' }"
        >Stats</router-link
      >
      <router-link class="header-link" :to="{ name: 'MyPositions' }"
        >Positions</router-link
      >
      <router-link class="header-link" :to="{ name: 'Farm' }">Farm</router-link>
      <div
        class="dropdown-tools header-link"
        :class="{ active: isDropdownTools }"
        @click="toggleDropdown('tools')"
        v-click-outside="closeDropdownTools"
      >
        <div class="title">
          Tools
          <img
            class="arrow"
            src="@/assets/images/arrow-down.svg"
            alt="Arrow down"
          />
        </div>
        <div class="list" v-if="isDropdownTools">
          <router-link class="list-link" :to="{ name: 'Stake' }"
            >Stake</router-link
          >
          <router-link class="list-link" :to="{ name: 'Bridge' }"
            >Bridge</router-link
          >
          <a href="https://curve.fi/mim" class="list-link" target="_blank"
            >Swap</a
          >
          <a
            href="https://app.powerbi.com/view?r=eyJrIjoiOGFjN2QyMDgtMzRhMy00NDkzLTk2NDctNTBkZTQ0NzQ3ZjJkIiwidCI6IjYyZTU1MTgwLTQzNmQtNDYyZC1hMWIwLTZkMTg2NjRlZDAxNSJ9"
            class="list-link"
            target="_blank"
            >Analytics</a
          >
        </div>
      </div>
      <ConnectButton />
      <div
        class="dropdown-other header-link"
        :class="{ active: isDropdownOther }"
        @click.stop="toggleDropdown('other')"
        v-click-outside="closeDropdownOther"
      >
        <img
          class="title"
          src="@/assets/images/social/points.svg"
          alt="Points"
        />
        <div class="list" v-if="isDropdownOther">
          <router-link class="list-link" to="/">V 1</router-link>
          <router-link class="list-link" to="/">Forum</router-link>
          <div class="list-row">
            <a href="/" class="list-link" target="_blank"
              ><img src="@/assets/images/social/docs.svg" alt="Docs"
            /></a>
            <a href="/" class="list-link" target="_blank"
              ><img src="@/assets/images/social/medium.svg" alt="Medium"
            /></a>
          </div>
          <div class="list-row">
            <router-link class="list-link" to="/"
              ><img src="@/assets/images/social/twitter.svg" alt="Twitter"
            /></router-link>
            <router-link class="list-link" to="/"
              ><img src="@/assets/images/social/discord.svg" alt="Discord"
            /></router-link>
          </div>
        </div>
      </div>
      <MimTokenBlock />

      <div
        class="burger"
        :class="{ 'burger-active': mobileMenu }"
        @click="toggleMobileMenu"
      >
        <div class="burger-line"></div>
      </div>

      <MobileMenu v-if="mobileMenu" @closePopup="closeMobilePopup" />
    </nav>
  </header>
</template>

<script>
const ConnectButton = () => import("@/components/ui/ConnectButton");
const MimTokenBlock = () => import("@/components/ui/MimTokenBlock");
const MobileMenu = () => import("@/components/popups/MobileMenu");

export default {
  data() {
    return {
      isDropdownTools: false,
      isDropdownOther: false,
      mobileMenu: false,
    };
  },

  watch: {
    mobileMenu() {
      if (this.mobileMenu) {
        document.documentElement.style.overflow = "hidden";
      } else {
        document.documentElement.style.overflow = "auto";
      }
    },
  },

  methods: {
    toHome() {
      this.$router.push({ name: "Home" });
    },
    toggleDropdown(nameDropdown) {
      if (nameDropdown === "tools") {
        this.isDropdownTools = !this.isDropdownTools;
      }
      if (nameDropdown === "other")
        this.isDropdownOther = !this.isDropdownOther;
    },

    closeDropdownTools() {
      this.isDropdownTools = false;
    },

    closeDropdownOther() {
      this.isDropdownOther = false;
    },

    toggleMobileMenu() {
      this.mobileMenu = !this.mobileMenu;
    },

    closeMobilePopup() {
      this.mobileMenu = false;
    },
  },

  components: {
    ConnectButton,
    MimTokenBlock,
    MobileMenu,
  },
};
</script>

<style lang="scss" scoped>
.main-logo {
  width: 50px;
  height: auto;
  object-fit: contain;
  margin-right: 10px;
  cursor: pointer;
}
.header {
  position: absolute;
  height: 80px;
  top: 15px;
  left: 0;
  right: 0;
  max-width: 1050px;
  margin: 0 auto;
  padding: 0 15px;
  z-index: 10;
  display: flex;
  align-items: center;
}

.nav {
  display: flex;
  flex: 1;
  justify-content: space-between;
}

.header-link {
  text-align: center;
  background: #ffffff0f;
  backdrop-filter: blur(40px);
  border-radius: 20px;
  padding: 13px 18px;
  font-size: 16px;
  line-height: 24px;
  color: #fff;
  cursor: pointer;
  min-width: 80px;
}

.header-link:hover {
  background: #ffffff33;
}

.dropdown-tools {
  position: relative;

  .title {
    display: flex;
    align-items: center;
  }
}

.dropdown-other {
  display: flex;
  justify-content: center;
  max-width: 90px;
  width: 100%;

  .title {
    max-width: 20px;
  }
}

.arrow {
  margin-left: 5px;
  transition: all 300ms ease-in-out;
}

.list {
  position: absolute;
  top: 100%;
  left: 0;
  display: flex;
  flex-direction: column;
  background: #ffffff33;
  width: 100%;
  border-radius: 0 0 20px 20px;
}

.list-link {
  padding: 13px 0;
  display: flex;
  justify-content: center;
  color: #fff;
  font-size: 16px;
  line-height: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.list-link:hover {
  background: -webkit-linear-gradient(#5282fd, #76c3f5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.list-link:last-child {
  border-bottom: none;
}

.list-row {
  display: flex;
  justify-content: space-evenly;

  .list-link {
    border-bottom: none;
  }

  img {
    max-width: 24px;
  }
}

.list-row:not(:last-child) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.active {
  border-radius: 20px 20px 0 0;
  background: #ffffff33;

  .arrow {
    transform: rotate(180deg);
  }
}

.line {
  transition: all 0.25s;
  content: "";
  width: 20px;
  height: 2px;
  border-radius: 20px;
  background: #fff;
}

.burger {
  display: none;
  align-items: center;
  height: 16px;
  position: relative;
}

.burger-line {
  @extend .line;
  &:before {
    @extend .line;
    position: absolute;
    top: 0;
  }
  &:after {
    @extend .line;
    position: absolute;
    bottom: 0;
  }
}

.burger-active {
  .burger-line {
    background-color: transparent;
    transition: all 0.25s;
    &:before {
      top: 45%;
      transform: rotate(45deg);
    }
    &:after {
      transform: rotate(-45deg);
      bottom: 45%;
    }
  }
}

@media (max-width: 980px) {
  .header-link {
    display: none;
  }

  .nav {
    padding: 0 15px;
    align-items: center;
  }

  .burger {
    display: flex;
    z-index: 11;
  }
}
</style>