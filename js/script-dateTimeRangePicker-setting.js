// 初始化 Flatpickr
flatpickr(".dateTimeRangeInput", {
    mode: "range", // 範圍選擇模式
    dateFormat: "Y/m/d H:i", // 日期格式
    defaultDate: ["2025-04-08 00:00", "2025-04-14 23:59"], // 預設日期
    locale: "zh_tw", 
    showMonths: 1, 
    monthSelectorType: "static",
    enableTime: true,
    time_24hr: true,
    hourIncrement: 1,   // 小時調整增量為 1 小時
    minuteIncrement: 1, // 分鐘調整增量為 1 分鐘
    //設定點擊起始日
    defaultHour: 0,
    defaultMinute: 0,
   
    onChange: function(selectedDates, dateStr, instance) {
        if (selectedDates.length === 2) {
            let startDate = selectedDates[0];
            let endDate = selectedDates[1];
            if (endDate.getHours() === 0 && endDate.getMinutes() === 0) {
                endDate.setHours(23, 59); 
                instance.setDate([startDate, endDate], false, instance.config.dateFormat);
            }
        }
    }

});