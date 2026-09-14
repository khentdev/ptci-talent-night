import type { Component } from "vue"

export type ActionsDropdownItem = {
    label: string,
    icon: Component,
    onClick: () => void,
    disabled?: boolean,
    danger?: boolean,
    title?: string
}
