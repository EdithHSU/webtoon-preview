/**
 * Bootstrap 5 Dropdown Select Group V3 - Native Checkbox Version
 * Optimized for native HTML checkbox and label elements
 * @version 3.0.0
 */

class DropdownSelectGroupV3 {
  constructor(element, options = {}) {
    if (!element) {
      console.error('DropdownSelectGroupV3: Element not found');
      return;
    }
    
    this.element = element;
    this.selectedValues = new Map();
    this.parentChildMap = new Map();
    
    this.options = {
      placeholder: options.placeholder || '請選擇項目',
      clearAllText: options.clearAllText || '清除全部',
      showClearAll: options.showClearAll !== false,
      theme: options.theme || 'dark',
      compact: options.compact || false,
      rounded: options.rounded || false,
      fullWidth: options.fullWidth || false,
      disabled: options.disabled || false,
      onSelect: options.onSelect || (() => {}),
      onDeselect: options.onDeselect || (() => {}),
      onChange: options.onChange || (() => {}),
      onExpand: options.onExpand || (() => {}),
      onCollapse: options.onCollapse || (() => {}),
      ...options
    };
    
    this.init();
  }
  
  init() {
    try {
      // Apply theme and styles
      this.applyTheme();
      
      // Cache DOM elements
      this.toggleButton = this.element.querySelector('.dropdown-toggle');
      this.dropdownMenu = this.element.querySelector('.dropdown-menu');
      this.tagsContainer = this.element.querySelector('.dropdown-tags');
      
      if (!this.validateElements()) {
        return;
      }
      
      // Build parent-child relationships
      this.buildParentChildMap();
      
      this.setInitialCheckedValues();

      // Initialize display
      this.updateButtonDisplay();
      
      // Bind events
      this.bindEvents();
      
      // Set initial values if provided
      if (this.options.selectedValues && Array.isArray(this.options.selectedValues)) {
        this.setSelectedValues(this.options.selectedValues);
      }
      
      // Set disabled state if needed
      if (this.options.disabled) {
        this.disable();
      }
      
      console.log('DropdownSelectGroupV3: Initialized successfully');
    } catch (error) {
      console.error('DropdownSelectGroupV3: Initialization error', error);
    }
  }

  
  validateElements() {
    if (!this.toggleButton) {
      console.error('DropdownSelectGroupV3: .dropdown-toggle not found');
      return false;
    }
    
    if (!this.dropdownMenu) {
      console.error('DropdownSelectGroupV3: .dropdown-menu not found');
      return false;
    }
    
    if (!this.tagsContainer) {
      // Create tags container if it doesn't exist
      this.tagsContainer = document.createElement('div');
      this.tagsContainer.className = 'dropdown-tags';
      const arrow = this.toggleButton.querySelector('.dropdown-arrow');
      if (arrow) {
        this.toggleButton.insertBefore(this.tagsContainer, arrow);
      } else {
        this.toggleButton.appendChild(this.tagsContainer);
      }
    }
    
    return true;
  }
  
  applyTheme() {
    if (!this.element) return;
    
    // Apply theme
    if (this.options.theme === 'light') {
      this.element.classList.add('theme-light');
    }
    
    // Apply style variants
    if (this.options.compact) {
      this.element.classList.add('compact');
    }
    
    if (this.options.rounded) {
      this.element.classList.add('rounded');
    }
    
    if (this.options.fullWidth) {
      this.element.classList.add('full-width');
    }
  }
  
  buildParentChildMap() {
    const parentItems = this.element.querySelectorAll('[data-parent="true"]');
    
    parentItems.forEach(parent => {
      const parentValue = parent.dataset.value;
      if (!parentValue) return;
      
      const children = this.element.querySelectorAll(`[data-parent="${parentValue}"]`);
      
      if (children.length > 0) {
        this.parentChildMap.set(parentValue, Array.from(children));
      }
    });
  }
  
  bindEvents() {
    // Handle checkbox changes using event delegation for better performance
    this.dropdownMenu.addEventListener('change', (e) => {
      if (e.target.type === 'checkbox') {
        this.handleCheckboxChange(e);
      }
    });
    
    // Handle expandable items
    const expandableItems = this.element.querySelectorAll('.expandable');
    expandableItems.forEach(item => {
      const label = item.querySelector('label');
      if (label) {
        label.addEventListener('click', (e) => {
          // Prevent expand/collapse when clicking on checkbox
          if (e.target.type !== 'checkbox') {
            e.preventDefault();
            this.toggleExpand(item);
          }
        });
      }
      
      // Alternative: Click on expand icon
      const expandIcon = item.querySelector('.expand-icon');
      if (expandIcon) {
        expandIcon.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleExpand(item);
        });
      }
    });
    
    // 確保點擊 Tag 容器區域不會影響 dropdown 狀態 (開啟或關閉)
    if (this.tagsContainer) {
      this.tagsContainer.addEventListener('click', (e) => {

        e.preventDefault(); 

        e.stopPropagation();
      });
    }

    // Prevent dropdown from closing (for clicks inside the menu)
    this.dropdownMenu.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    
    // Handle dropdown events
    this.element.addEventListener('show.bs.dropdown', () => {
      this.onDropdownShow();
    });
    
    this.element.addEventListener('hide.bs.dropdown', () => {
      this.onDropdownHide();
    });
  }
  
  handleCheckboxChange(e) {
    const checkbox = e.target;
    const item = checkbox.closest('.dropdown-item-custom, .dropdown-sub-item');
    
    if (!item) return;
    
    const value = checkbox.value;
    const labelElement = checkbox.parentElement.querySelector('span');
    const label = labelElement ? labelElement.textContent.trim() : value;
    const isParent = item.dataset.parent === 'true';
    
    if (isParent) {
      this.handleParentCheckbox(item, checkbox.checked);
    } else {
      // Handle regular/child checkbox
      if (checkbox.checked) {
        this.selectedValues.set(value, label);
        item.classList.add('selected');
        this.options.onSelect(value, label);
      } else {
        this.selectedValues.delete(value);
        item.classList.remove('selected');
        this.options.onDeselect(value, label);
      }
      
      // Update parent if this is a child
      const parentValue = item.dataset.parent;
      if (parentValue) {
        this.updateParentCheckbox(parentValue);
      }
    }
    
    this.updateButtonDisplay();
    this.triggerChange();
    this.updateDropdownPosition();
  }
  
  handleParentCheckbox(parentItem, checked) {
    const parentValue = parentItem.dataset.value;
    const children = this.parentChildMap.get(parentValue);

    const parentCheckbox = parentItem.querySelector('input[type="checkbox"]');
    const parentLabelElement = parentCheckbox.parentElement.querySelector('span');
    const parentLabel = parentLabelElement ? parentLabelElement.textContent.trim() : parentValue;

    if (!children || children.length === 0) {
      // No children, treat as regular item
      if (checked) {
        this.selectedValues.set(parentValue, parentLabel);
        parentItem.classList.add('selected');
        this.options.onSelect(parentValue, parentLabel);
      } else {
        this.selectedValues.delete(parentValue);
        parentItem.classList.remove('selected');
        this.options.onDeselect(parentValue, parentLabel);
      }
      return;
    }

    // 1. 更新所有子項目的 checkbox 狀態
    children.forEach(childItem => {
      const checkbox = childItem.querySelector('input[type="checkbox"]');
      if (!checkbox) return;

      const value = checkbox.value;
      
      // 設置子項目 checkbox 狀態
      checkbox.checked = checked;

      // 設置子項目樣式
      if (checked) {
        childItem.classList.add('selected');
      } else {
        childItem.classList.remove('selected');
      }
      
      // 2. 更新 selectedValues: 父層全選時，清空子層的 Tag
      if (checked) {
        // 父項全選時，我們只顯示父項目 Tag，故刪除所有子項目 Tag
        this.selectedValues.delete(value);
      } else {
        // 父項取消選中時，子項也被取消選中，故刪除子項目 Tag
        this.selectedValues.delete(value);
      }
    });

    // 3. 處理父項目在 selectedValues 中的狀態
    if (checked) {
      // 當父項目被選中時，將父項目 Tag 加入 selectedValues
      this.selectedValues.set(parentValue, parentLabel);
      parentItem.classList.add('selected');
      // 注意：這裡應該只觸發父項目的 onSelect，因為子項目的 onSelect/onDeselect 需要在 setSelectedValues/clearAll 時手動處理。
      // 在這個情境下，我們省略了對 onSelect/onDeselect 的觸發，因為通常只在末級單獨點擊時才關注。
    } else {
      // 父項目被取消選中時，刪除父項目 Tag
      this.selectedValues.delete(parentValue);
      parentItem.classList.remove('selected');
    }
  }
  updateDropdownPosition() {
    // 檢查 Bootstrap 和 Dropdown 實例是否存在
    if (typeof bootstrap !== 'undefined' && this.toggleButton) {
      const dropdown = bootstrap.Dropdown.getInstance(this.toggleButton);
   
      if (dropdown) {
      // 呼叫 Bootstrap Dropdown 的 update() 方法重新計算選單位置
      dropdown.update();
      }
    }
  }
  updateParentCheckbox(parentValue) {
    const parentItem = this.element.querySelector(`[data-value="${parentValue}"][data-parent="true"]`);
    if (!parentItem) return;

    const parentCheckbox = parentItem.querySelector('input[type="checkbox"]');
    if (!parentCheckbox) return;

    const children = this.parentChildMap.get(parentValue);
    if (!children || children.length === 0) return;

    const checkedCount = children.filter(child => {
      const checkbox = child.querySelector('input[type="checkbox"]');
      return checkbox && checkbox.checked;
    }).length;

    const totalCount = children.length;

    const parentLabelElement = parentCheckbox.parentElement.querySelector('span');
    const parentLabel = parentLabelElement ? parentLabelElement.textContent.trim() : parentValue;


    // 1. 更新父項目 checkbox 狀態
    if (checkedCount === 0) {
      // 全部未選中
      parentCheckbox.checked = false;
      parentCheckbox.indeterminate = false;
      parentItem.classList.remove('selected');

      // 從 selectedValues 中刪除父項目 Tag
      this.selectedValues.delete(parentValue);

    } else if (checkedCount === totalCount) {
      // 全部選中
      parentCheckbox.checked = true;
      parentCheckbox.indeterminate = false;
      parentItem.classList.add('selected');

      // ⭐ 核心簡化邏輯：用父項目 Tag 取代所有子項目 Tag ⭐
      this.selectedValues.set(parentValue, parentLabel);

      children.forEach(child => {
        const childValue = child.querySelector('input[type="checkbox"]').value;
        this.selectedValues.delete(childValue); // 刪除子項目的 Tag
      });

    } else {
      // 部分選中 (Indeterminate)
      parentCheckbox.checked = false;
      parentCheckbox.indeterminate = true;
      parentItem.classList.remove('selected');

      // 確保父項目 Tag 被刪除 (只顯示部分選中的子項目 Tag)
      this.selectedValues.delete(parentValue);
    }
  }
  setInitialCheckedValues() {
    // 1. 將所有初始選中的末級項目加入 selectedValues
    const checkboxes = this.element.querySelectorAll('input[type="checkbox"]');

    checkboxes.forEach(checkbox => {
      const item = checkbox.closest('.dropdown-item-custom, .dropdown-sub-item');
      if (!item || !checkbox.checked) return;

      const value = checkbox.value;
      const labelElement = checkbox.parentElement.querySelector('span');
      const label = labelElement ? labelElement.textContent.trim() : value;
      const isParent = item.dataset.parent === 'true';
      const hasChildren = this.parentChildMap.has(value);

      // 初始時，將所有末級項目/單獨項目加入 selectedValues
      if (!isParent || !hasChildren) {
        this.selectedValues.set(value, label);
      }
      item.classList.add('selected');
    });

    // 2. 處理父項目的 indeterminate/checked 狀態，**並執行 Tag 簡化邏輯**
    // updateParentCheckbox 會自動將全選的子項目 Tag 替換成父項目 Tag。
    const parentItems = this.element.querySelectorAll('[data-parent="true"]');
    parentItems.forEach(parentItem => {
      const parentValue = parentItem.dataset.value;
      this.updateParentCheckbox(parentValue);
    });
  }
  
  toggleExpand(item) {
    const expandIcon = item.querySelector('.expand-icon');
    const parentValue = item.dataset.value;
    const subItems = this.element.querySelector(`[data-parent-value="${parentValue}"]`);
    
    if (subItems && expandIcon) {
      if (expandIcon.classList.contains('expanded')) {
        expandIcon.classList.remove('expanded');
        subItems.classList.remove('expanded');
        this.options.onCollapse(parentValue);
      } else {
        expandIcon.classList.add('expanded');
        subItems.classList.add('expanded');
        this.options.onExpand(parentValue);
      }
    }
  }
  
  updateButtonDisplay() {
    if (!this.tagsContainer) return;
    
    this.tagsContainer.innerHTML = '';
    
    if (this.selectedValues.size === 0) {
      const placeholder = document.createElement('span');
      placeholder.className = 'dropdown-placeholder';
      placeholder.textContent = this.options.placeholder;
      this.tagsContainer.appendChild(placeholder);
    } else {
      // Add tags for each selected item
      this.selectedValues.forEach((label, value) => {
        const tag = this.createTag(value, label);
        if (tag) {
          this.tagsContainer.appendChild(tag);
        }
      });
      
      // Add clear all button
      // if (this.options.showClearAll && this.selectedValues.size > 1) {
      //   const clearBtn = this.createClearAllButton();
      //   if (clearBtn) {
      //     this.tagsContainer.appendChild(clearBtn);
      //   }
      // }
    }
  }
  
  createTag(value, label) {
    const tag = document.createElement('div');
    tag.className = 'dropdown-tag';
    tag.dataset.value = value;
    
    const textSpan = document.createElement('span');
    textSpan.className = 'dropdown-tag-text';
    textSpan.textContent = label;
    textSpan.title = label;
    tag.appendChild(textSpan);
    
    // const removeIcon = document.createElement('i');
    // removeIcon.className = 'fas fa-times dropdown-tag-remove';
    // removeIcon.dataset.value = value;
    
    // removeIcon.addEventListener('click', (e) => {
    //   e.stopPropagation();
    //   this.removeItem(value);
    // });
    
    // tag.appendChild(removeIcon);
    
    return tag;
  }
  
  createClearAllButton() {
    const clearBtn = document.createElement('button');
    clearBtn.className = 'clear-all-btn';
    clearBtn.textContent = this.options.clearAllText;
    clearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.clearAll();
    });
    return clearBtn;
  }
  
  removeItem(value) {
    const checkbox = this.element.querySelector(`input[type="checkbox"][value="${value}"]`);
    if (checkbox) {
      checkbox.checked = false;
      // 觸發 change 事件，讓 handleCheckboxChange 執行後續的 Tag 移除和父層狀態更新
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
  
  clearAll() {
    const checkboxes = this.element.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      checkbox.checked = false;
      checkbox.indeterminate = false;
    });
    
    const items = this.element.querySelectorAll('.dropdown-item-custom, .dropdown-sub-item');
    items.forEach(item => {
      item.classList.remove('selected');
    });
    
    this.selectedValues.clear();
    this.updateButtonDisplay();
    this.triggerChange();
    this.updateDropdownPosition();
  }
  
  triggerChange() {
    const values = Array.from(this.selectedValues.keys());
    const labels = Array.from(this.selectedValues.values());
    this.options.onChange(values, labels);
  }
  
  onDropdownShow() {
    if (this.element) {
      this.element.classList.add('show');
    }
  }
  
  onDropdownHide() {
    if (this.element) {
      this.element.classList.remove('show');
    }
  }
  
  // Public API Methods
  
  getSelectedValues() {
    return Array.from(this.selectedValues.keys());
  }
  
  getSelectedLabels() {
    return Array.from(this.selectedValues.values());
  }
  
  getSelectedData() {
    return Array.from(this.selectedValues.entries()).map(([value, label]) => ({
      value,
      label
    }));
  }
  
  setSelectedValues(values) {
    if (!Array.isArray(values)) return;
    
    this.clearAll();
    
    values.forEach(value => {
      const checkbox = this.element.querySelector(`input[type="checkbox"][value="${value}"]`);
      if (checkbox) {
        checkbox.checked = true;
        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  }
  
  selectAll() {
    const checkboxes = this.element.querySelectorAll('input[type="checkbox"]:not([data-parent="true"])');
    checkboxes.forEach(checkbox => {
      if (!checkbox.checked) {
        checkbox.checked = true;
        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  }
  
  enable() {
    if (this.element) {
      this.element.classList.remove('disabled');
    }
    if (this.toggleButton) {
      this.toggleButton.disabled = false;
    }
    const checkboxes = this.element.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      checkbox.disabled = false;
    });
    this.options.disabled = false;
  }
  
  disable() {
    if (this.element) {
      this.element.classList.add('disabled');
    }
    if (this.toggleButton) {
      this.toggleButton.disabled = true;
    }
    const checkboxes = this.element.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      checkbox.disabled = true;
    });
    this.options.disabled = true;
  }
  
  expandAll() {
    const expandableItems = this.element.querySelectorAll('.expandable');
    expandableItems.forEach(item => {
      const expandIcon = item.querySelector('.expand-icon');
      const parentValue = item.dataset.value;
      const subItems = this.element.querySelector(`[data-parent-value="${parentValue}"]`);
      
      if (expandIcon && subItems) {
        expandIcon.classList.add('expanded');
        subItems.classList.add('expanded');
      }
    });
  }
  
  collapseAll() {
    const expandableItems = this.element.querySelectorAll('.expandable');
    expandableItems.forEach(item => {
      const expandIcon = item.querySelector('.expand-icon');
      const parentValue = item.dataset.value;
      const subItems = this.element.querySelector(`[data-parent-value="${parentValue}"]`);
      
      if (expandIcon && subItems) {
        expandIcon.classList.remove('expanded');
        subItems.classList.remove('expanded');
      }
    });
  }
  
  destroy() {
    try {
      // Remove all event listeners by cloning
      const newElement = this.element.cloneNode(true);
      this.element.parentNode.replaceChild(newElement, this.element);
      
      // Clear Bootstrap dropdown
      if (this.toggleButton && typeof bootstrap !== 'undefined') {
        const dropdown = bootstrap.Dropdown.getInstance(this.toggleButton);
        if (dropdown) {
          dropdown.dispose();
        }
      }
      
      // Clear data
      this.selectedValues.clear();
      this.parentChildMap.clear();
      
      // Remove instance reference
      delete this.element._dropdownSelectGroupV3Instance;
      
      console.log('DropdownSelectGroupV3: Destroyed successfully');
    } catch (error) {
      console.error('DropdownSelectGroupV3: Destroy error', error);
    }
  }
  
  
  // Static Methods
  
  static init(element, options) {
    if (!element) {
      console.error('DropdownSelectGroupV3: Cannot initialize without element');
      return null;
    }
    
    const instance = new DropdownSelectGroupV3(element, options);
    element._dropdownSelectGroupV3Instance = instance;
    return instance;
  }
  
  static getInstance(element) {
    return element ? element._dropdownSelectGroupV3Instance : null;
  }
  
  static initAll(selector = '.dropdown-select-group', options = {}) {
    const elements = document.querySelectorAll(selector);
    const instances = [];
    
    elements.forEach((element, index) => {
      try {
        // Check for data attributes
        const dataOptions = {
          placeholder: element.dataset.placeholder,
          clearAllText: element.dataset.clearAllText,
          showClearAll: element.dataset.showClearAll !== 'false',
          theme: element.dataset.theme,
          compact: element.dataset.compact === 'true',
          rounded: element.dataset.rounded === 'true',
          fullWidth: element.dataset.fullWidth === 'true',
          disabled: element.dataset.disabled === 'true',
          selectedValues: element.dataset.selectedValues ? 
            element.dataset.selectedValues.split(',').map(v => v.trim()) : undefined
        };
        
        // Merge options
        const mergedOptions = { ...dataOptions, ...options };
        
        // Remove undefined values
        Object.keys(mergedOptions).forEach(key => {
          if (mergedOptions[key] === undefined) {
            delete mergedOptions[key];
          }
        });
        
        const instance = DropdownSelectGroupV3.init(element, mergedOptions);
        if (instance) {
          instances.push(instance);
        }
      } catch (error) {
        console.error(`DropdownSelectGroupV3: Failed to initialize element ${index}`, error);
      }
    });
    
    return instances;
  }
}

// Auto-initialize on DOM ready
if (typeof document !== 'undefined') {
  const initializeAll = () => {
    if (typeof bootstrap === 'undefined') {
      console.warn('DropdownSelectGroupV3: Bootstrap not found');
      return;
    }
    
    // Auto-init elements with data-auto-init="true"
    DropdownSelectGroupV3.initAll('[data-auto-init="true"]');
  };
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAll);
  } else {
    initializeAll();
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DropdownSelectGroupV3;
}

if (typeof window !== 'undefined') {
  window.DropdownSelectGroupV3 = DropdownSelectGroupV3;
}
