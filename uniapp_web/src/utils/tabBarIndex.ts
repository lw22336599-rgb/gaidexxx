/** 自定义 tabBar 与各 Tab 页 onShow 同步高亮（pages.json tabBar.custom） */
export const TAB_BAR_INDEX_EVENT = "app-tab-bar-index";

export function setTabBarPageIndex(index: number) {
  uni.$emit(TAB_BAR_INDEX_EVENT, index);
}
