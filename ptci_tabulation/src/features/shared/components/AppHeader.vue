<template>
  <header
    class="absolute top-0 left-0 w-full h-16 z-50 flex items-center px-6 sm:px-12 justify-center bg-white shadow-sm"
  >
    <div
      class="container max-w-3xl sm:max-w-7xl flex items-center justify-center sm:justify-between w-full"
    >
      <h1
        class="hidden sm:text-2xl sm:flex font-bold font-poppins text-gray-800 w-full"
      >
        Ms & Mr. <span class="text-primary">PTCI</span>
      </h1>

      <nav
        class="flex justify-start items-center sm:justify-end sm:gap-4 sm:text-sm text-xs w-full"
      >
        <router-link
          v-for="(r, i) in navRoutes"
          :to="{ name: r.routeName }"
          :key="r.routeName + i"
          v-slot="{ navigate, href, isExactActive }"
          :custom="true"
        >
          <a
            :href="href"
            @click.prevent="() => handleNav(navigate)"
            class="relative font-medium text-gray-800 font-poppins transition-colors px-4 duration-200"
            :class="[
              isActive(r, isExactActive)
                ? 'text-primary'
                : 'hover:text-primary',
            ]"
          >
            <span class="flex flex-col items-center relative"
              >{{ r.label }}
              <span
                v-if="isActive(r, isExactActive)"
                class="absolute -bottom-1 left-0 w-full h-[2px] bg-primary rounded-full"
              ></span>
            </span>
          </a>
        </router-link>

        <button
          type="button"
          :disabled="authStore.loadingState.isLoggingOut"
          @click="handleLogout"
          :class="[
            isMobile ? 'p-3 ' : 'px-4 border border-primary',
            authStore.loadingState.isLoggingOut ? 'opacity-60 cursor-wait' : '',
            'ml-auto sm:ml-2  py-1.5  cursor-pointer rounded-full text-sm font-medium font-poppins text-primary hover:bg-primary hover:text-white transition-colors duration-200',
          ]"
        >
          <LogOut v-if="isMobile" class="size-4 shrink-0" />
          <span v-else>Logout</span>
        </button>
      </nav>
    </div>
  </header>
</template>

<script lang="ts" setup>
import { LogOut } from "lucide-vue-next";
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../../auth/store/authStore";

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = async () => {
  await authStore.logoutUser();
  router.push({ name: "login" });
};
const userRole = computed(() => authStore.getUserMetaData?.role);

const allNavRoutes: NavRoute[] = [
  { label: "Homepage", routeName: "home-default", pathPrefix: "/" },
  {
    label: "Dashboard",
    routeName: "dashboard-overview",
    pathPrefix: "/dashboard",
    role: "admin",
  },
  {
    label: "Judge",
    routeName: "judge-home",
    pathPrefix: "/judge",
    role: "judge",
  },
];

const navRoutes = computed(() =>
  allNavRoutes.filter((r) => !r.role || r.role === userRole.value)
);

const handleNav = (nav: () => void) => nav();

const windowSize = ref(window.innerWidth);
const setWindowSize = () => (windowSize.value = window.innerWidth);
const isMobile = computed(() => (windowSize.value < 640 ? true : false));

const route = useRoute();

type NavRoute = {
  label: string;
  routeName: string;
  pathPrefix: string;
  role?: "judge" | "admin";
};
const isActive = (r: NavRoute, isExactActive: boolean): boolean => {
  const matchesPrefix =
    r.pathPrefix !== "/" && route.path.startsWith(r.pathPrefix);
  return matchesPrefix || isExactActive;
};

onMounted(() => {
  window.addEventListener("resize", setWindowSize);
});
onUnmounted(() => {
  window.removeEventListener("resize", setWindowSize);
});
</script>
