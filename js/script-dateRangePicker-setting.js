// 初始化 Flatpickr
flatpickr(".dateRangeInput", {
    mode: "range", // 範圍選擇模式
    dateFormat: "Y/m/d", // 日期格式
    defaultDate: ["2025-04-08", "2025-04-14"], // 預設日期
    locale: "zh_tw", // 使用繁體中文
    showMonths: 1, // 顯示兩個月
    monthSelectorType: "static",
    // 自定義格式化顯示
    onReady: function(selectedDates, dateStr, instance) {
        // 可以在這裡添加額外的初始化邏輯
    },

});