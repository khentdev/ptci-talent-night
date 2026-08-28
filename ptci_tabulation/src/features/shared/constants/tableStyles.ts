export const TABLE_STYLES = {
    // HEADER
    TB: "w-full text-left bg-white border-collapse",
    THEADROW: "bg-gray-100 border-gray-200 border-b",
    TH: "px-6 py-2 text-xs md:text-sm font-medium uppercase text-gray-700 border-b border-gray-200",

    // BODY
    TBODY: "bg-white divide-y divide-gray-100",
    TD: {
        no_bold: "px-6 py-3 text-xs md:text-sm text-gray-800 border-gray-200 break-words min-w-30 max-w-30",
        bold: "px-6 py-3 text-xs md:text-sm text-gray-800 font-medium border-gray-200 break-words min-w-30 max-w-30",
    },

    // ACTIONS
    ACTION_ADD_UPDATE:
        "inline-flex items-center justify-center size-8 md:size-9 bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary/80 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-primary/5 disabled:text-primary/40 disabled:cursor-not-allowed disabled:scale-100 disabled:transition-none disabled:duration-0",
    ACTION_DEL:
        "inline-flex items-center justify-center size-8 md:size-9 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:bg-red-50 disabled:text-red-300 disabled:cursor-not-allowed disabled:scale-100 disabled:transition-none disabled:duration-0"
};
