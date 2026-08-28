<template>
  <teleport to="body">
    <div
      class="fixed z-50 top-3 right-3 w-[300px] md:w-[320px] flex flex-col gap-3 pointer-events-none font-poppins"
    >
      <TransitionGroup
        name="toast"
        tag="div"
        class="relative flex flex-col gap-3"
        :onBeforeLeave
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'pointer-events-auto border rounded-2xl shadow-md backdrop-blur-sm transition-all duration-200',
            'bg-primaryLight/95 border-primary/30',
            getToastStyle(toast.type),
          ]"
        >
          <div class="flex items-start gap-3 p-3">
            <div
              class="flex items-center justify-center w-8 h-8 rounded-full shrink-0 bg-primaryLight border border-primary/20"
            >
              <component
                :is="iconToShow(toast.type)"
                :class="['size-4', getIconColor(toast.type)]"
              />
            </div>

            <div class="flex-1 min-w-0">
              <p class="text-gray-800 leading-snug break-words">
                {{ toast.message }}
              </p>

              <button
                v-if="FnToRetry"
                @click="handleRetry"
                class="mt-1 text-xs font-medium text-primary hover:underline hover:underline-offset-2"
              >
                Try again
              </button>
            </div>

            <button
              @click="removeToast(toast.id)"
              class="flex items-center justify-center w-8 h-8 shrink-0 rounded-full transition-colors hover:bg-primaryLight cursor-pointer"
            >
              <X
                class="size-4 stroke-[1.5] text-gray-600 hover:text-gray-800"
              />
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { CircleX, X, CircleCheckBig, Info } from "lucide-vue-next";
import { useToast } from "../../composables/useToast";
import type { retryFn, ToastType } from "../../types/toastTypes";

const props = defineProps<{ FnToRetry?: retryFn }>();
const handleRetry = () => props.FnToRetry?.();

const { toasts, removeToast } = useToast();

const iconToShow = (type: ToastType) => {
  return {
    success: CircleCheckBig,
    error: CircleX,
    info: Info,
  }[type];
};

const getIconColor = (type: ToastType) => {
  return {
    success: "text-green-600",
    error: "text-red-600",
    info: "text-blue-600",
  }[type];
};

const getToastStyle = (type: ToastType) => {
  return {
    success: "border-green-500/30",
    error: "border-red-500/30",
    info: "border-blue-500/30",
  }[type];
};

const onBeforeLeave = (el: Element) => {
  const element = el as HTMLElement;
  const parent = element.parentElement as HTMLElement | null;
  if (!parent) return;

  const rect = element.getBoundingClientRect();
  const parentRect = parent.getBoundingClientRect();
  const preciseTop = rect.top - parentRect.top;

  element.style.width = `${rect.width}px`;
  element.style.height = `${rect.height}px`;
  element.style.boxSizing = "border-box";
  element.style.margin = "0";
  element.style.position = "absolute";
  element.style.top = `${preciseTop}px`;
  element.style.left = "0px";
};
</script>

<style scoped>
@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes toast-out {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(-10px) scale(0.96);
  }
}

.toast-enter-active {
  animation: toast-in 200ms ease-out both;
}

.toast-leave-active {
  animation: toast-out 200ms ease-in both;
  position: absolute;
  width: 100%;
  height: auto;
}

.toast-move {
  transition: transform 200ms ease;
}
</style>
