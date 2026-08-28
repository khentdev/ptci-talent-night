<template>
  <teleport to="body">
    <transition appear enter-active-class="transition duration-200 ease-out"
      leave-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100"
      leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/10">
        <div
          class="w-[90%] max-w-sm bg-white rounded-2xl shadow-lg border border-primaryLight p-6 flex flex-col items-center text-center">
          <div class="flex items-center justify-center size-14 rounded-full bg-primaryLight mb-4">
            <CircleAlert class="stroke-primary size-8" />
          </div>

          <h2 class="font-poppins text-gray-900 text-lg font-semibold tracking-wide">
            {{ title }}
          </h2>

          <p class="text-gray-700 text-sm leading-relaxed max-w-xs mt-2 font-lora">
            {{ description }}
          </p>

          <div class="mt-6 flex gap-3">
            <button @click="handleCancel"
              class="px-5 py-2 rounded-full text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-100 transition-colors">
              Cancel
            </button>
            <button @click="handleAction" :disabled="isLoading"
              class="px-5 py-2 flex items-center disabled:bg-primary/50 disabled:hover:bg-primary/50 disabled:cursor-not-allowed gap-3 rounded-full text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors">
              <div v-if="isLoading" class="size-4 border-2 animate-spin border-white rounded-full border-t-transparent">
              </div>
              <span v-else>{{ actionFnName }}</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script lang="ts" setup>
  import { CircleAlert } from "lucide-vue-next";
  const props = withDefaults(
    defineProps<{
      show: boolean;
      title?: string;
      description?: string;
      actionFnName?: string;
      actionFn: () => Promise<any | void>;
      isLoading?: boolean;
      close: () => void;
    }>(),
    {
      title: "Confirm Action",
      description:
        "Are you sure you want to proceed with this action? This change cannot be undone.",
      actionFnName: "Confirm",
    }
  );
  const handleCancel = () => {
    if (props.isLoading) return;
    props.close();
  };

  const handleAction = async () => {
    if (props.isLoading) return;

    try {
      await props.actionFn();
    } catch (err) { } finally {
      props.close();
    }
  };
</script>
