<template>
  <form class="grid grid-cols-2 gap-2 md:gap-5" @submit.prevent="handleSubmit">
    <div class="col-span-2">
      <label for="username" class="block text-sm font-medium text-gray-700">
        Username
      </label>
      <input
        v-model="username"
        id="username"
        type="text"
        autocomplete="off"
        :placeholder="role === 'admin' ? 'e.g. admin1' : 'e.g. judge1'"
        :disabled="mode === 'reset-password'"
        :class="[
          FORM_FIELDS.INPUT_FIELD,
          'disabled:cursor-not-allowed disabled:text-gray-500 disabled:hover:border-gray-200',
        ]"
      />
      <p
        v-if="accountFormErrors.general"
        class="text-sm text-red-500 flex items-center gap-3 mt-1"
      >
        <TriangleAlert class="size-4 shrink-0" />
        {{ accountFormErrors.general }}
      </p>
    </div>

    <div class="col-span-2 sm:col-span-1">
      <label for="password" class="block text-sm font-medium text-gray-700">
        {{ mode === "reset-password" ? "New Password" : "Password" }}
      </label>
      <input
        v-model="password"
        id="password"
        type="password"
        autocomplete="new-password"
        placeholder="At least 8 characters"
        :class="FORM_FIELDS.INPUT_FIELD"
      />
    </div>

    <div class="col-span-2 sm:col-span-1">
      <label
        for="confirmPassword"
        class="block text-sm font-medium text-gray-700"
      >
        Confirm Password
      </label>
      <input
        v-model="confirmPassword"
        id="confirmPassword"
        type="password"
        autocomplete="new-password"
        placeholder="Re-enter password"
        :class="FORM_FIELDS.INPUT_FIELD"
      />
    </div>

    <div class="flex justify-between items-center gap-5 col-span-2 mt-3">
      <button @click="onClose" type="button" :class="ACTION_STYLES.CANCELBTN">
        Cancel
      </button>
      <button
        type="submit"
        :disabled="isLoading"
        :class="ACTION_STYLES.PRIMARYBTN"
      >
        {{ isLoading ? "Submitting..." : "Submit" }}
      </button>
    </div>
  </form>
</template>
<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from "vue";
import { TriangleAlert } from "lucide-vue-next";
import { useAccountStore } from "../../store/accountStore";
import {
  ACTION_STYLES,
  FORM_FIELDS,
} from "../../../shared/constants/formStyles";
import type {
  AccountData,
  AccountRole,
  CreateAccountParams,
  ResetPasswordParams,
} from "../../types/accounts";

const { accountFormErrors, clearFormErrors } = useAccountStore();
onBeforeUnmount(() => {
  clearFormErrors();
});

const props = defineProps<{
  mode: "create" | "reset-password";
  role: AccountRole;
  onClose: () => void;
  isLoading?: boolean;
  onSubmit: (
    data: any,
  ) => Promise<CreateAccountParams | ResetPasswordParams | any>;
  account?: AccountData | null;
}>();

const username = ref("");
const password = ref("");
const confirmPassword = ref("");

watch(
  [() => props.account, () => props.mode],
  ([account, mode]) => {
    if (account && mode === "reset-password") username.value = account.username;
  },
  { immediate: true },
);

watch([username, password, confirmPassword], () => {
  if (accountFormErrors.general) {
    accountFormErrors.general = "";
  }
});

// Mirrors the API rules: usernames are stored lowercase, a-z 0-9 . _ - only, max 64 chars.
watch([username, password], ([usernameInput, passwordInput]) => {
  const allowedChars = /[^a-z0-9._-]/g;
  username.value = usernameInput
    .toLowerCase()
    .replace(allowedChars, "")
    .substring(0, 64);
  password.value = passwordInput.substring(0, 256);
});

const validateForm = () => {
  clearFormErrors();

  if (!username.value.trim() || !password.value || !confirmPassword.value) {
    accountFormErrors.general = "All fields are required.";
    return false;
  }
  if (username.value.length < 3) {
    accountFormErrors.general = "Username must be at least 3 characters.";
    return false;
  }
  if (password.value.length < 8) {
    accountFormErrors.general = "Password must be at least 8 characters.";
    return false;
  }
  if (password.value !== confirmPassword.value) {
    accountFormErrors.general = "Passwords do not match.";
    return false;
  }

  return true;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  try {
    if (props.mode === "reset-password" && props.account) {
      const resetFormData: ResetPasswordParams = {
        id: props.account.id,
        password: password.value,
      };
      await props.onSubmit(resetFormData);
    } else {
      const addFormData: CreateAccountParams = {
        username: username.value,
        password: password.value,
        role: props.role,
      };
      await props.onSubmit(addFormData);
    }
    props.onClose();
  } catch {}
};
</script>
