import type { LucideProps } from "lucide-vue-next";
import type { FunctionalComponent, Ref } from "vue";
export type NavigationBtns = {
    icon: FunctionalComponent<LucideProps>;
    label: string;
    routeName?: string;
    dropDownIcon?: FunctionalComponent<LucideProps>;
    hasChildren?: boolean;
    onClick?: () => boolean;
    isOpen?: Ref<boolean, boolean>;
    childrens?: {
        icon?: FunctionalComponent<LucideProps>;
        label: string;
        routeName: string;
    }[];
}[];