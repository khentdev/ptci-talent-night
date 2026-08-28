<template>
  <teleport to="body">
    <transition
      appear
      enter-active-class="transition duration-200 ease-out"
      leave-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="show"
        class="fixed inset-0 bg-black/10 z-60 flex items-center justify-center p-4 py-10 overflow-y-auto"
      >
        <transition
          appear
          enter-active-class="transition-all duration-200 ease-out"
          leave-active-class="transition-all duration-200 ease-in"
          enter-from-class="opacity-0 translate-y-4 scale-95"
          enter-to-class="opacity-100 translate-y-0 scale-100"
          leave-from-class="opacity-100 translate-y-0 scale-100"
          leave-to-class="opacity-0 translate-y-4 scale-95"
        >
          <div
            class="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-5"
            v-if="show"
          >
            <div class="flex">
              <div>
                <h2 class="text-xl font-semibold text-gray-800">
                  {{ title }}
                </h2>
                <p class="text-sm text-gray-600 mt-1">
                  {{ description }}
                </p>
              </div>
            </div>

            <div
              class="bg-gray-50 border border-gray-200 flex flex-col gap-2 rounded-lg p-3 text-gray-800 text-sm"
            >
              <div>
                <span class="font-medium">Candidate Number:</span>
                {{ props.datas?.number }}
              </div>
              <div>
                <span class="font-medium">Candidate:</span>
                {{ props.datas?.name }}
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                @click="props.onClose?.()"
                :class="ACTION_STYLES.CANCELBTN"
              >
                Cancel
              </button>
              <button
                @click="handleDelete"
                :disabled="isDeleting"
                :class="ACTION_STYLES.DELETEBTN"
              >
                {{ isDeleting ? "Deleting..." : "Delete" }}
              </button>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { defineProps } from "vue";
import { ACTION_STYLES } from "../../constants/formStyles";

const props = withDefaults(
  defineProps<{
    show: boolean;
    title?: string;
    description?: string;
    datas: { id: string; name: string; number: string } | null;
    onDelete: ({ id }: { id: string }) => void;
    onClose: () => void;
  }>(),
  {
    title: "Delete Entity",
    description: "Are you sure you want to delete this entity?",
    datas: () => ({ name: "- Unknown -", id: "", number: "#" }),
  }
);

const isDeleting = ref(false);
const handleDelete = () => {
  if (isDeleting.value || !props.datas?.id) return;
  isDeleting.value = true;
  try {
    props.onDelete({ id: props.datas.id });
  } finally {
    isDeleting.value = false;
    props.onClose();
  }
};
</script>
