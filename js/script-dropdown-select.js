// dropdown menu
document.addEventListener('DOMContentLoaded', function() {
  // 遍歷所有的 dropdown-selector
  document.querySelectorAll('.dropdown-selector').forEach((selector, index) => {
    const dropdown = selector.querySelector('.dropdown');
    const button = selector.querySelector('.dropdown-toggle');
    const dropdownMenu = selector.querySelector('.dropdown-menu');
    const dropdownItems = selector.querySelectorAll('.dropdown-item');
    
    // 只有一個 span 在按鈕內
    const buttonTextSpan = button ? button.querySelector('span') : null;
    
    // 確認必要元素存在
    if (!button || !dropdownMenu || !buttonTextSpan) {
      console.warn(`第 ${index + 1} 組缺少必要元素`);
      return;
    }
    
    // 儲存初始文字
    const defaultButtonText = buttonTextSpan.textContent.trim();
    
    // 檢查是否已有預設值 (初始化邏輯)
    const existingValue = button.getAttribute('data-selected-value');
    
    // 如果沒有值才加入 text-muted，有值則不加
    if (!existingValue || existingValue === 'null' || existingValue === '') {
      button.classList.add('text-muted');
    } else {
      // 如果有預設值，確保移除 text-muted 並標記對應的選項為 active
      button.classList.remove('text-muted');
      
      // 找到對應的選項並標記為 active
      dropdownItems.forEach(item => {
        // 這裡需要修改：初始化時，應該根據 data-value 或 active 類別來設定按鈕文字
        // 由於 HTML 已經設定了 active，我們可以在此處根據 active 來設定按鈕文字
        if (item.getAttribute('data-value') === existingValue || item.classList.contains('active')) {
          item.classList.add('active');
          item.setAttribute('aria-selected', 'true');
          // 如果按鈕的文字是預設文字，則用 active 項目的文字覆蓋它
          if (buttonTextSpan.textContent.trim() === defaultButtonText) {
             buttonTextSpan.textContent = item.textContent.trim();
          }
        } else {
             item.classList.remove('active');
             item.setAttribute('aria-selected', 'false');
        }
      });
    }
    
    // 為每個下拉選項添加點擊事件
    dropdownItems.forEach(item => {
      item.addEventListener('click', function(e) {
        
        const selectedText = this.textContent.trim();
        const selectedValue = this.getAttribute('data-value');
        const itemHref = this.getAttribute('href');
        
        // 【核心修改點】判斷是否為實際連結
        // 檢查 href 是否是實質的連結（不為空且不等於 #）
        const isActualLink = itemHref && itemHref !== '#' && itemHref.trim() !== '';

        if (isActualLink) {
          // 情況 1: 實際連結 (例如: 04-1-2.list-報表查詢-網路組.html)
          
          // 在跳轉前，只處理 active 狀態，讓 UI 看起來正確
          dropdownItems.forEach(di => {
            di.classList.remove('active');
            di.setAttribute('aria-selected', 'false');
          });
          this.classList.add('active');
          this.setAttribute('aria-selected', 'true');
          
          // **不**執行 e.preventDefault()，允許瀏覽器跳轉。
          // 其他選單邏輯（更新按鈕文字/data-value）不需要執行，因為頁面會刷新。
          return; // 結束函數，允許預設導航行為
        }
        
        // 情況 2: 純選單選項 (href="#" 或無 href)
        e.preventDefault(); // 阻止連結導航
        e.stopPropagation();
        
        // 移除該組內所有項目的 active 類別
        dropdownItems.forEach(di => {
          di.classList.remove('active');
          di.setAttribute('aria-selected', 'false');
        });
        
        // 為當前選中項添加 active 類別
        this.classList.add('active');
        this.setAttribute('aria-selected', 'true');
        
        // 更新按鈕內的 span 文字
        buttonTextSpan.textContent = selectedText;
        
        // 更新按鈕的 data-selected-value
        button.setAttribute('data-selected-value', selectedValue);
        
        // 移除 text-muted 樣式（變成正常顏色）
        button.classList.remove('text-muted');
        
        // 關閉下拉選單 (使用 Bootstrap 實例)
        const dropdownInstance = bootstrap.Dropdown.getInstance(button);
        if (dropdownInstance) {
          dropdownInstance.hide();
        }
        
        // 觸發自定義事件
        const changeEvent = new CustomEvent('dropdown-change', {
          detail: {
            value: selectedValue,
            text: selectedText,
            index: index
          },
          bubbles: true
        });
        selector.dispatchEvent(changeEvent);
      });
    });
    
    // ... 後續的實用方法保持不變 ...
    
    // 添加實用方法
    selector.getValue = function() {
      // 增加判斷，如果沒有 data-value 但有 active 連結，返回連結文字作為值（如果需要的話）
      return button.getAttribute('data-selected-value') || '';
    };
    
    selector.getText = function() {
      return buttonTextSpan.textContent.trim();
    };
    
    selector.setValue = function(value) {
      const item = this.querySelector(`.dropdown-item[data-value="${value}"]`);
      if (item) {
        // 使用 .click() 來觸發點擊事件邏輯
        item.click(); 
      }
    };
    
    selector.reset = function() {
      // 重置文字
      buttonTextSpan.textContent = defaultButtonText;
      
      // 清除值
      button.removeAttribute('data-selected-value');
      
      // 重新加入 text-muted 樣式
      button.classList.add('text-muted');
      
      // 清除 active 狀態
      dropdownItems.forEach(di => {
        di.classList.remove('active');
        di.setAttribute('aria-selected', 'false');
      });
    };
    
    selector.disable = function() {
      button.disabled = true;
    };
    
    selector.enable = function() {
      button.disabled = false;
    };
    
    // 檢查是否有值（用於判斷狀態）
    selector.hasValue = function() {
      return !!this.getValue();
    };
    
    // 新增：更新 text-muted 狀態的方法
    selector.updateTextMutedState = function() {
      const value = this.getValue();
      if (value) {
        button.classList.remove('text-muted');
      } else {
        button.classList.add('text-muted');
      }
    };
    
    // 儲存索引
    selector.setAttribute('data-dropdown-index', index);
  });
});

// 輔助函數 (保持不變)
function getAllDropdownValues() {
  const values = [];
  document.querySelectorAll('.dropdown-selector').forEach((selector, index) => {
    values.push({
      index: index,
      value: selector.getValue(),
      text: selector.getText(),
      hasValue: !!selector.getValue()
    });
  });
  return values;
}

function getDropdownByIndex(index) {
  return document.querySelector(`.dropdown-selector[data-dropdown-index="${index}"]`);
}

function validateAllDropdowns(showError = true) {
  let isValid = true;
  
  document.querySelectorAll('.dropdown-selector').forEach(selector => {
    const value = selector.getValue();
    
    if (!value) {
      isValid = false;
      if (showError) {
        selector.classList.add('is-invalid');
        const button = selector.querySelector('.dropdown-toggle');
        if (button) {
          button.classList.add('is-invalid');
        }
      }
    } else {
      selector.classList.remove('is-invalid');
      const button = selector.querySelector('.dropdown-toggle');
      if (button) {
        button.classList.remove('is-invalid');
      }
    }
  });
  
  return isValid;
}

function resetAllDropdowns() {
  document.querySelectorAll('.dropdown-selector').forEach(selector => {
    if (selector.reset) {
      selector.reset();
    }
  });
}

// 新增：更新所有 dropdown 的 text-muted 狀態
function updateAllDropdownStates() {
  document.querySelectorAll('.dropdown-selector').forEach(selector => {
    if (selector.updateTextMutedState) {
      selector.updateTextMutedState();
    }
  });
}