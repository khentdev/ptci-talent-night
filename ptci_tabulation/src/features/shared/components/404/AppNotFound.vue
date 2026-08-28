<template>
  <div class="flex items-center justify-center min-h-screen">
    <div
      class="relative flex flex-col items-center justify-center max-w-lg px-8 py-12 mx-4 text-center bg-white border border-gray-200/50 shadow-2xl shadow-black/10 rounded-3xl backdrop-blur-sm">
      <div class="relative mb-8">
        <div class="text-8xl font-bold text-primary font-poppins relative">
          <span class="relative z-10">404</span>
          <div class="absolute inset-0 text-8xl font-bold text-primary/5 font-poppins blur-sm">
            404
          </div>
        </div>
      </div>

      <div class="mb-8">
        <h1 class="mb-6 text-2xl font-bold text-gray-800 font-poppins md:text-3xl tracking-wide">
          Page Not Found
        </h1>
        <p class="text-gray-500 font-lora leading-relaxed text-lg">
          The page you're looking for doesn't exist.
        </p>
      </div>

      <div class="flex items-center">
        <div class="flex flex-col w-full items-center gap-4 sm:flex-row sm:gap-6">
          <button @click="goHome"
            class="flex items-center justify-center gap-2 px-8 py-3 font-semibold text-white transition-all duration-300 ease-out transform border cursor-pointer group bg-primary border-primary/20 rounded-xl hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:shadow-lg hover:shadow-primary/40 hover:border-primary/40 active:translate-y-0 active:shadow-md">
            <Home class="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
            <span>Go Home</span>
          </button>

          <button @click="goBack"
            class="flex items-center justify-center gap-2 px-8 py-3 font-semibold text-gray-700 transition-all duration-300 ease-out transform border cursor-pointer group bg-white border-gray-200 rounded-xl hover:-translate-y-0.5 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300 hover:shadow-lg hover:shadow-gray-200/40 active:translate-y-0 active:shadow-md">
            <ArrowLeft class="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { Home, ArrowLeft } from "lucide-vue-next";
  import { useRouter } from "vue-router";

  const router = useRouter();

  const goHome = () => {
    router.push({ name: "home-default" });
  };

  const goBack = () => {
    if (window.history.length > 1) {
      router.go(-1);
    } else {
      router.push({ name: "home-default" });
    }
  };
</script>
