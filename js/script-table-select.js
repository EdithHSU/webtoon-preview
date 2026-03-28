document.addEventListener('DOMContentLoaded', function() {
        // 1. 取得頁面上所有帶有獨立全選功能的表格容器
        const tables = document.querySelectorAll('.selectable-table');

        // 遍歷每一個找到的表格容器
        tables.forEach(function(tableContainer) {
            
            // 在當前的表格容器內，找到全選 Checkbox
            const selectAllCheckbox = tableContainer.querySelector('.select-all-header');
            
            // 在當前的表格容器內，找到所有的資料列 Checkbox
            const rowCheckboxes = tableContainer.querySelectorAll('.select-row-checkbox');

            // 確保找到全選 Checkbox
            if (!selectAllCheckbox || rowCheckboxes.length === 0) {
                // 如果這個表格不完整，則跳過處理
                return; 
            }

            // --- 1. 監聽全選 Checkbox (表頭) ---
            selectAllCheckbox.addEventListener('change', function() {
                const isChecked = this.checked;
                
                // 遍歷當前表格的資料列 Checkbox，設定勾選狀態
                rowCheckboxes.forEach(function(checkbox) {
                    checkbox.checked = isChecked;
                });
            });

            // --- 2. 監聽資料列 Checkbox (並更新當前表格的全選 Checkbox 狀態) ---
            rowCheckboxes.forEach(function(checkbox) {
                checkbox.addEventListener('change', function() {
                    // 取得當前表格中所有已勾選的資料列 Checkbox
                    // 注意：這裡使用 tableContainer 來限制查詢範圍
                    const checkedCount = tableContainer.querySelectorAll('.select-row-checkbox:checked').length;
                    
                    // 總共的資料列 Checkbox 數量
                    const totalCount = rowCheckboxes.length;
                    
                    // 判斷是否所有 Checkbox 都被勾選
                    const isAllChecked = (checkedCount === totalCount);
                    
                    // 更新當前表格的全選 Checkbox 狀態
                    selectAllCheckbox.checked = isAllChecked;
                });
            });
        });
    });