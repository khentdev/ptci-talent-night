<template>
    <section class="min-h-screen p-3 overflow-x-auto flex flex-col items-center justify-center">


        <div class="w-full max-w-full mt-16 md:mt-12 rounded-2xl" :class="{
            'border border-gray-200':
                isLoading
        }">

            <div class="overflow-hidden rounded-2xl">

                <slot />
            </div>
        </div>
    </section>
</template>
<script lang="ts" setup>
    defineProps<{ isLoading?: boolean }>()
</script>