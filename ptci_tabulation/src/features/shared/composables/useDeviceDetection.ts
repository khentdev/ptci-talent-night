import { ref, computed, onMounted, onUnmounted } from 'vue';

export function useDeviceDetection() {
    const windowWidth = ref(window.innerWidth);
    const userAgent = ref('');

    const MOBILE_MAX = 767;
    const TABLET_MAX = 1023;
    const DESKTOP_MIN = 1024;

    const updateWidth = () => {
        windowWidth.value = window.innerWidth;
    };

    const isMobile = computed(() => windowWidth.value <= MOBILE_MAX);
    const isTablet = computed(() => windowWidth.value > MOBILE_MAX && windowWidth.value <= TABLET_MAX);
    const isDesktop = computed(() => windowWidth.value >= DESKTOP_MIN);

    const hasTouchScreen = computed(() => {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    });


    const shouldShowKeyboardHint = computed(() =>
        isDesktop.value && !hasTouchScreen.value
    );

    const shouldEnableAnimations = computed(() => isDesktop.value);
    const shouldEnableManualScroll = computed(() => !isDesktop.value);

    onMounted(() => {
        userAgent.value = navigator.userAgent;
        console.log('Device Detection:', {
            width: windowWidth.value,
            isMobile: isMobile.value,
            isTablet: isTablet.value,
            isDesktop: isDesktop.value,
            hasTouchScreen: hasTouchScreen.value,
            shouldShowKeyboardHint: shouldShowKeyboardHint.value
        });
        window.addEventListener('resize', updateWidth);
    });

    onUnmounted(() => {
        window.removeEventListener('resize', updateWidth);
    });

    return {
        windowWidth,
        isMobile,
        isTablet,
        isDesktop,
        hasTouchScreen,
        shouldShowKeyboardHint,
        shouldEnableAnimations,
        shouldEnableManualScroll,
    };
}