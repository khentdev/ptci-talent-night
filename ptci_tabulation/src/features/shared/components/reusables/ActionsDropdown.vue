<template>
  <button
    ref="triggerRef"
    type="button"
    :title="triggerTitle"
    aria-haspopup="menu"
    :aria-expanded="open"
    :class="TABLE_STYLES.ACTION_ADD_UPDATE"
    @click="toggle"
  >
    <Ellipsis class="size-4 md:size-5 shrink-0" />
  </button>
  <teleport to="body">
    <transition
      enter-active-class="transition duration-150 ease-out"
      :enter-from-class="`opacity-0 scale-95 ${placement === 'top' ? 'translate-y-1' : '-translate-y-1'}`"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="open"
        ref="menuRef"
        role="menu"
        class="fixed z-50 w-52 py-1 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-lg"
        :class="placement === 'top' ? 'origin-bottom-right' : 'origin-top-right'"
        :style="{ top: `${position.top}px`, left: `${position.left}px` }"
      >
        <button
          v-for="item in items"
          :key="item.label"
          type="button"
          role="menuitem"
          :disabled="item.disabled"
          :title="item.title"
          class="flex items-center gap-2 w-full px-3 py-2 text-sm text-left cursor-pointer transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          :class="
            item.danger
              ? 'text-red-500 hover:bg-red-50 focus:bg-red-50'
              : 'text-gray-700 hover:bg-gray-100 focus:bg-gray-100'
          "
          @click="select(item)"
        >
          <component :is="item.icon" class="size-4 shrink-0" />
          <span>{{ item.label }}</span>
        </button>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { Ellipsis } from "lucide-vue-next";
import { onClickOutside, onKeyStroke, useEventListener } from "@vueuse/core";
import { TABLE_STYLES } from "../../constants/tableStyles";
import type { ActionsDropdownItem } from "../../types/actionsDropdown";

const props = withDefaults(
  defineProps<{
    items: ActionsDropdownItem[];
    triggerTitle?: string;
  }>(),
  {
    triggerTitle: "More actions",
  },
);

const MENU_WIDTH = 208; // w-52
const ITEM_HEIGHT = 36; // py-2 + text-sm line height
const MENU_PADDING = 10; // py-1 + borders
const GAP = 4;
const EDGE = 8;

const open = ref(false);
const triggerRef = ref<HTMLButtonElement | null>(null);
const menuRef = ref<HTMLElement | null>(null);
const placement = ref<"bottom" | "top">("bottom");
const position = reactive({ top: 0, left: 0 });

/**
 * The menu is teleported and `fixed` so the table's scroll box can't clip it — place it from the
 * trigger's viewport rect, right-aligned, opening upward when the row is too close to the bottom.
 */
const updatePosition = () => {
  const rect = triggerRef.value?.getBoundingClientRect();
  if (!rect) return;
  const height = props.items.length * ITEM_HEIGHT + MENU_PADDING;
  const fitsBelow = rect.bottom + GAP + height <= window.innerHeight - EDGE;
  placement.value = fitsBelow || rect.top - GAP - height < EDGE ? "bottom" : "top";
  position.top = placement.value === "bottom" ? rect.bottom + GAP : rect.top - GAP - height;
  position.left = Math.max(
    EDGE,
    Math.min(rect.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - EDGE),
  );
};

const close = () => (open.value = false);

const toggle = () => {
  if (!open.value) updatePosition();
  open.value = !open.value;
};

const select = (item: ActionsDropdownItem) => {
  if (item.disabled) return;
  close();
  item.onClick();
};

onClickOutside(menuRef, close, { ignore: [triggerRef] });
onKeyStroke("Escape", () => {
  if (!open.value) return;
  close();
  triggerRef.value?.focus();
});
// A fixed menu would drift away from its row, so close instead of following scroll/resize.
useEventListener(window, "scroll", () => { if (open.value) close(); }, { capture: true, passive: true });
useEventListener(window, "resize", () => { if (open.value) close(); }, { passive: true });
</script>
