<template>
  <div class="conversation-container no-background-container">
    <!-- 左侧边栏 -->
    <div class="sidebar">
      <!-- 搜索框 -->
      <div class="search-section">
        <el-input v-model="searchKeyword" placeholder="顾客名、订单号、聊天记录" clearable class="search-input">
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- 标签页 -->
      <div class="tabs-section">
        <div
          v-for="tab in tabs"
          :key="tab.key"
          :class="['tab-item', { active: activeTab === tab.key }]"
          @click="handleTabChange(tab.key)"
        >
          {{ tab.label }}
        </div>
      </div>

      <!-- 全渠道消息下的快捷操作 -->
      <div v-if="activeTab === 'all-channels' && !showTodoMessagePage" class="quick-actions-section">
        <!-- 待办消息卡片 -->
        <div class="todo-message-card" @click="showTodoMessagePage = true">
          <div class="todo-icon">
            <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M3 2.5C3 1.67157 3.67157 1 4.5 1H11.5C12.3284 1 13 1.67157 13 2.5V13.5C13 13.7652 12.8946 14.0196 12.7071 14.2071C12.5196 14.3946 12.2652 14.5 12 14.5C11.7348 14.5 11.4804 14.3946 11.2929 14.2071L8 10.9142L4.70711 14.2071C4.51957 14.3946 4.26522 14.5 4 14.5C3.73478 14.5 3.48043 14.3946 3.29289 14.2071C3.10536 14.0196 3 13.7652 3 13.5V2.5ZM4.5 2.5V13.5L8 10L11.5 13.5V2.5H4.5Z"
                stroke="#606266"
                stroke-width="1.5"
                fill="none"
              />
            </svg>
          </div>
          <div class="todo-text">待办消息</div>
          <div class="todo-right">
            <span class="todo-count">{{ todoMessageCount }}</span>
            <el-icon class="todo-arrow"><ArrowRight /></el-icon>
          </div>
        </div>
        <!-- 未回复和未读按钮 -->
        <div class="filter-buttons">
          <div class="filter-btn" @click="handleFilterClick('unreplied')">未回复</div>
          <div class="filter-btn" @click="handleFilterClick('unread')">未读</div>
        </div>
      </div>

      <!-- 待办消息界面 -->
      <div v-if="showTodoMessagePage" class="todo-message-page">
        <!-- 顶部标题栏 -->
        <div class="todo-page-header">
          <div class="header-left" @click="showTodoMessagePage = false">
            <el-icon class="back-icon"><ArrowLeft /></el-icon>
            <span class="header-title">待办消息</span>
          </div>
        </div>

        <!-- 待办消息列表 -->
        <div class="todo-message-list">
          <div v-for="tagGroup in todoMessagesByTag" :key="tagGroup.tag" class="todo-tag-group">
            <!-- 分组标题 -->
            <div class="tag-group-header">
              <div class="tag-bookmark" :style="{ color: tagGroup.tagColor }">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M3 2.5C3 1.67157 3.67157 1 4.5 1H11.5C12.3284 1 13 1.67157 13 2.5V13.5C13 13.7652 12.8946 14.0196 12.7071 14.2071C12.5196 14.3946 12.2652 14.5 12 14.5C11.7348 14.5 11.4804 14.3946 11.2929 14.2071L8 10.9142L4.70711 14.2071C4.51957 14.3946 4.26522 14.5 4 14.5C3.73478 14.5 3.48043 14.3946 3.29289 14.2071C3.10536 14.0196 3 13.7652 3 13.5V2.5ZM4.5 2.5V13.5L8 10L11.5 13.5V2.5H4.5Z"
                    :fill="tagGroup.tagColor"
                  />
                </svg>
              </div>
              <span class="tag-group-title">{{ tagGroup.tagLabel }}</span>
            </div>

            <!-- 分组消息列表 -->
            <div class="tag-messages">
              <div
                v-for="message in tagGroup.messages"
                :key="message.id"
                :class="['todo-message-item', { selected: (message as any).selected }]"
                @click="handleSelectTodoMessage(message)"
              >
                <div class="message-avatar">
                  <div class="avatar-placeholder user-avatar">
                    <el-icon><User /></el-icon>
                  </div>
                </div>
                <div class="message-info">
                  <div class="message-header">
                    <span class="message-name" :class="{ 'demo-mode-blur': isDemoMode }">{{ message.name }}</span>
                    <span v-if="message.badge" class="message-badge">{{ message.badge }}</span>
                  </div>
                  <div class="message-content" :class="{ 'demo-mode-blur': isDemoMode }">{{ message.content }}</div>
                </div>
                <div class="message-right">
                  <div class="message-date">{{ message.date }}</div>
                  <div class="message-actions" @click.stop>
                    <el-popover
                      placement="bottom-start"
                      :width="120"
                      trigger="hover"
                      popper-class="todo-message-menu-popover"
                      :popper-options="{ modifiers: [{ name: 'offset', options: { offset: [0, 8] } }] }"
                      append-to-body
                    >
                      <template #reference>
                        <span class="more-dots">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="4" cy="8" r="1.5" class="dot-circle" fill="#909399" />
                            <circle cx="8" cy="8" r="1.5" class="dot-circle" fill="#909399" />
                            <circle cx="12" cy="8" r="1.5" class="dot-circle" fill="#909399" />
                          </svg>
                        </span>
                      </template>
                      <div class="todo-message-menu-content">
                        <div class="menu-item" @click="handleCancelTodoMessage(message, tagGroup.tag)">
                          <span class="menu-text">取消待办</span>
                        </div>
                      </div>
                    </el-popover>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 会话列表 -->
      <div v-if="!showTodoMessagePage" class="conversation-list">
        <div v-if="conversationList.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="60" cy="60" r="50" fill="#F5F7FA" />
              <path
                d="M40 50C40 45.5817 43.5817 42 48 42H52C56.4183 42 60 45.5817 60 50V54C60 58.4183 56.4183 62 52 62H48C43.5817 62 40 58.4183 40 54V50Z"
                fill="#C0C4CC"
              />
              <path
                d="M60 50C60 45.5817 63.5817 42 68 42H72C76.4183 42 80 45.5817 80 50V54C80 58.4183 76.4183 62 72 62H68C63.5817 62 60 58.4183 60 54V50Z"
                fill="#C0C4CC"
              />
              <path
                d="M50 70C50 65.5817 53.5817 62 58 62H62C66.4183 62 70 65.5817 70 70V74C70 78.4183 66.4183 82 62 82H58C53.5817 82 50 78.4183 50 74V70Z"
                fill="#C0C4CC"
              />
              <circle cx="45" cy="45" r="3" fill="#909399" />
              <circle cx="75" cy="45" r="3" fill="#909399" />
              <path
                d="M50 85C50 85 55 90 60 90C65 90 70 85 70 85"
                stroke="#909399"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </div>
          <p class="empty-text">暂无消息</p>
        </div>
        <div v-else class="conversation-items">
          <!-- 会话列表项 -->
          <div
            v-for="item in conversationList"
            :key="item.id"
            :class="['conversation-item', { active: selectedConversation?.id === item.id }]"
            @click="handleSelectConversation(item)"
          >
            <div class="platform-icon" :style="{ backgroundColor: item.platformColor || '#FFC107' }">
              <span class="platform-name">{{ item.platform || '平台' }}</span>
            </div>
            <div class="conversation-content">
              <div class="conversation-header">
                <span class="conversation-name" :class="{ 'demo-mode-blur': isDemoMode }">{{ item.name }}</span>
                <div class="header-right-info">
                  <span v-if="item.todoTag" class="todo-badge">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M3 2.5C3 1.67157 3.67157 1 4.5 1H11.5C12.3284 1 13 1.67157 13 2.5V13.5C13 13.7652 12.8946 14.0196 12.7071 14.2071C12.5196 14.3946 12.2652 14.5 12 14.5C11.7348 14.5 11.4804 14.3946 11.2929 14.2071L8 10.9142L4.70711 14.2071C4.51957 14.3946 4.26522 14.5 4 14.5C3.73478 14.5 3.48043 14.3946 3.29289 14.2071C3.10536 14.0196 3 13.7652 3 13.5V2.5ZM4.5 2.5V13.5L8 10L11.5 13.5V2.5H4.5Z"
                        :fill="getTagColor(item.todoTag)"
                      />
                    </svg>
                  </span>
                  <span v-if="item.isPinned" class="pin-badge">
                    <span class="pin-icon-small" v-html="pinIcon" />
                  </span>
                  <span class="conversation-time">{{ item.time }}</span>
                </div>
              </div>
              <div class="conversation-preview">
                <div class="preview-content-wrapper">
                  <span v-if="item.isUrgent" class="message-status-tag urgent-tag">紧急消息 (1分钟内回复)</span>
                  <span
                    v-else-if="item.unrepliedMinutes && item.unrepliedMinutes > 3"
                    class="message-status-tag unreplied-tag"
                    >超过3分钟未回复的顾客</span
                  >
                  <span class="preview-text" :class="{ 'demo-mode-blur': isDemoMode }">{{ item.preview }}</span>
                </div>
                <el-popover
                  placement="bottom-start"
                  :width="140"
                  trigger="hover"
                  popper-class="message-menu-popover"
                  :popper-options="{ modifiers: [{ name: 'offset', options: { offset: [0, 8] } }] }"
                  append-to-body
                >
                  <template #reference>
                    <span class="more-dots" @click.stop>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="4" cy="8" r="1.5" class="dot-circle" fill="#909399" />
                        <circle cx="8" cy="8" r="1.5" class="dot-circle" fill="#909399" />
                        <circle cx="12" cy="8" r="1.5" class="dot-circle" fill="#909399" />
                      </svg>
                    </span>
                  </template>
                  <div class="message-menu-content">
                    <div class="menu-item" @click="handlePinMessage(item)">
                      <span
                        class="menu-icon"
                        style="margin-right: 5px"
                        v-html="
                          item.isPinned
                            ? unpinIcon.replace('currentColor', '#2c2c2c')
                            : pinIcon.replace('currentColor', '#2c2c2c')
                        "
                      />
                      <span class="menu-text">{{ item.isPinned ? '取消置顶' : '置顶消息' }}</span>
                    </div>
                    <div
                      class="menu-divider"
                      style="height: 1px; background-color: #e4e7ed; margin: 12px 0; padding: 0"
                    />
                    <el-popover
                      placement="right"
                      :width="120"
                      trigger="hover"
                      popper-class="todo-menu-popover"
                      @show="handleShowTodoMenu(item)"
                    >
                      <template #reference>
                        <div class="menu-item">
                          <span class="menu-icon" style="margin-right: 5px">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path
                                d="M3 2.5C3 1.67157 3.67157 1 4.5 1H11.5C12.3284 1 13 1.67157 13 2.5V13.5C13 13.7652 12.8946 14.0196 12.7071 14.2071C12.5196 14.3946 12.2652 14.5 12 14.5C11.7348 14.5 11.4804 14.3946 11.2929 14.2071L8 10.9142L4.70711 14.2071C4.51957 14.3946 4.26522 14.5 4 14.5C3.73478 14.5 3.48043 14.3946 3.29289 14.2071C3.10536 14.0196 3 13.7652 3 13.5V2.5ZM4.5 2.5V13.5L8 10L11.5 13.5V2.5H4.5Z"
                                fill="#2c2c2c"
                              />
                            </svg>
                          </span>
                          <span class="menu-text">标记待办</span>
                        </div>
                      </template>
                      <div class="todo-menu-content" style="display: flex; flex-direction: column; gap: 0; width: 100%">
                        <div
                          class="todo-menu-item"
                          style="
                            display: flex;
                            align-items: center;
                            flex-direction: row;
                            flex-wrap: nowrap;
                            gap: 8px;
                            padding: 10px 12px;
                            white-space: nowrap;
                            width: 100%;
                            box-sizing: border-box;
                          "
                          @click="handleMarkTodoTag(item, 'invoice')"
                        >
                          <div
                            class="todo-menu-icon"
                            style="
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              width: 16px;
                              height: 16px;
                              flex-shrink: 0;
                              margin: 0;
                              padding: 0;
                            "
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                              style="width: 16px; height: 16px; display: block"
                            >
                              <path
                                d="M3 2.5C3 1.67157 3.67157 1 4.5 1H11.5C12.3284 1 13 1.67157 13 2.5V13.5C13 13.7652 12.8946 14.0196 12.7071 14.2071C12.5196 14.3946 12.2652 14.5 12 14.5C11.7348 14.5 11.4804 14.3946 11.2929 14.2071L8 10.9142L4.70711 14.2071C4.51957 14.3946 4.26522 14.5 4 14.5C3.73478 14.5 3.48043 14.3946 3.29289 14.2071C3.10536 14.0196 3 13.7652 3 13.5V2.5ZM4.5 2.5V13.5L8 10L11.5 13.5V2.5H4.5Z"
                                fill="#409EFF"
                              />
                            </svg>
                          </div>
                          <span class="todo-menu-text" style="white-space: nowrap; margin: 0; padding: 0">开发票</span>
                        </div>
                        <div
                          class="todo-menu-item"
                          style="
                            display: flex;
                            align-items: center;
                            flex-direction: row;
                            flex-wrap: nowrap;
                            gap: 8px;
                            padding: 10px 12px;
                            white-space: nowrap;
                            width: 100%;
                            box-sizing: border-box;
                          "
                          @click="handleMarkTodoTag(item, 'complaint')"
                        >
                          <div
                            class="todo-menu-icon"
                            style="
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              width: 16px;
                              height: 16px;
                              flex-shrink: 0;
                              margin: 0;
                              padding: 0;
                            "
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                              style="width: 16px; height: 16px; display: block"
                            >
                              <path
                                d="M3 2.5C3 1.67157 3.67157 1 4.5 1H11.5C12.3284 1 13 1.67157 13 2.5V13.5C13 13.7652 12.8946 14.0196 12.7071 14.2071C12.5196 14.3946 12.2652 14.5 12 14.5C11.7348 14.5 11.4804 14.3946 11.2929 14.2071L8 10.9142L4.70711 14.2071C4.51957 14.3946 4.26522 14.5 4 14.5C3.73478 14.5 3.48043 14.3946 3.29289 14.2071C3.10536 14.0196 3 13.7652 3 13.5V2.5ZM4.5 2.5V13.5L8 10L11.5 13.5V2.5H4.5Z"
                                fill="#F56C6C"
                              />
                            </svg>
                          </div>
                          <span class="todo-menu-text" style="white-space: nowrap; margin: 0; padding: 0">投诉</span>
                        </div>
                        <div
                          class="todo-menu-item"
                          style="
                            display: flex;
                            align-items: center;
                            flex-direction: row;
                            flex-wrap: nowrap;
                            gap: 8px;
                            padding: 10px 12px;
                            white-space: nowrap;
                            width: 100%;
                            box-sizing: border-box;
                          "
                          @click="handleMarkTodoTag(item, 'cancel')"
                        >
                          <div
                            class="todo-menu-icon"
                            style="
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              width: 16px;
                              height: 16px;
                              flex-shrink: 0;
                              margin: 0;
                              padding: 0;
                            "
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                              style="width: 16px; height: 16px; display: block"
                            >
                              <path
                                d="M3 2.5C3 1.67157 3.67157 1 4.5 1H11.5C12.3284 1 13 1.67157 13 2.5V13.5C13 13.7652 12.8946 14.0196 12.7071 14.2071C12.5196 14.3946 12.2652 14.5 12 14.5C11.7348 14.5 11.4804 14.3946 11.2929 14.2071L8 10.9142L4.70711 14.2071C4.51957 14.3946 4.26522 14.5 4 14.5C3.73478 14.5 3.48043 14.3946 3.29289 14.2071C3.10536 14.0196 3 13.7652 3 13.5V2.5ZM4.5 2.5V13.5L8 10L11.5 13.5V2.5H4.5Z"
                                fill="#E6A23C"
                              />
                            </svg>
                          </div>
                          <span class="todo-menu-text" style="white-space: nowrap; margin: 0; padding: 0"
                            >取消退换</span
                          >
                        </div>
                        <div
                          class="todo-menu-item"
                          style="
                            display: flex;
                            align-items: center;
                            flex-direction: row;
                            flex-wrap: nowrap;
                            gap: 8px;
                            padding: 10px 12px;
                            white-space: nowrap;
                            width: 100%;
                            box-sizing: border-box;
                          "
                          @click="handleMarkTodoTag(item, 'exchange')"
                        >
                          <div
                            class="todo-menu-icon"
                            style="
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              width: 16px;
                              height: 16px;
                              flex-shrink: 0;
                              margin: 0;
                              padding: 0;
                            "
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                              style="width: 16px; height: 16px; display: block"
                            >
                              <path
                                d="M3 2.5C3 1.67157 3.67157 1 4.5 1H11.5C12.3284 1 13 1.67157 13 2.5V13.5C13 13.7652 12.8946 14.0196 12.7071 14.2071C12.5196 14.3946 12.2652 14.5 12 14.5C11.7348 14.5 11.4804 14.3946 11.2929 14.2071L8 10.9142L4.70711 14.2071C4.51957 14.3946 4.26522 14.5 4 14.5C3.73478 14.5 3.48043 14.3946 3.29289 14.2071C3.10536 14.0196 3 13.7652 3 13.5V2.5ZM4.5 2.5V13.5L8 10L11.5 13.5V2.5H4.5Z"
                                fill="#67C23A"
                              />
                            </svg>
                          </div>
                          <span class="todo-menu-text" style="white-space: nowrap; margin: 0; padding: 0"
                            >换货补送</span
                          >
                        </div>
                      </div>
                    </el-popover>
                  </div>
                </el-popover>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧内容区 -->
    <div class="content-area">
      <div v-if="!selectedConversation" class="empty-content">
        <div class="empty-icon-large">
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="80" fill="#F5F7FA" />
            <path
              d="M60 80C60 70.0599 68.0599 62 78 62H82C91.9401 62 100 70.0599 100 80V84C100 93.9401 91.9401 102 82 102H78C68.0599 102 60 93.9401 60 84V80Z"
              fill="#C0C4CC"
            />
            <path
              d="M100 80C100 70.0599 108.06 62 118 62H122C131.94 62 140 70.0599 140 80V84C140 93.9401 131.94 102 122 102H118C108.06 102 100 93.9401 100 84V80Z"
              fill="#C0C4CC"
            />
            <path
              d="M80 120C80 110.06 88.0599 102 98 102H102C111.94 102 120 110.06 120 120V124C120 133.94 111.94 142 102 142H98C88.0599 142 80 133.94 80 124V120Z"
              fill="#C0C4CC"
            />
            <circle cx="70" cy="70" r="5" fill="#909399" />
            <circle cx="130" cy="70" r="5" fill="#909399" />
            <path
              d="M80 150C80 150 90 160 100 160C110 160 120 150 120 150"
              stroke="#909399"
              stroke-width="3"
              stroke-linecap="round"
            />
          </svg>
        </div>
        <p class="empty-text-large">请选择一个对话</p>
      </div>
      <div v-else :key="selectedConversation?.id" class="conversation-detail">
        <!-- 左侧/中间：聊天对话框区域 -->
        <div class="chat-panel">
          <!-- 顶部信息栏 -->
          <div class="chat-header">
            <div class="header-left">
              <span class="order-info" :class="{ 'demo-mode-blur': isDemoMode }">1.5#27单 P**</span>
              <span class="order-tag">已下1单</span>
              <span class="add-note">
                <el-icon><EditPen /></el-icon>
                添加备注
              </span>
            </div>
            <div class="header-right">
              <el-popover placement="bottom-start" :width="300" trigger="click" popper-class="todo-popover">
                <template #reference>
                  <el-button class="todo-btn" :class="{ 'has-tag': selectedTodoTag }">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        v-if="selectedTodoTag"
                        d="M3 2.5C3 1.67157 3.67157 1 4.5 1H11.5C12.3284 1 13 1.67157 13 2.5V13.5C13 13.7652 12.8946 14.0196 12.7071 14.2071C12.5196 14.3946 12.2652 14.5 12 14.5C11.7348 14.5 11.4804 14.3946 11.2929 14.2071L8 10.9142L4.70711 14.2071C4.51957 14.3946 4.26522 14.5 4 14.5C3.73478 14.5 3.48043 14.3946 3.29289 14.2071C3.10536 14.0196 3 13.7652 3 13.5V2.5ZM4.5 2.5V13.5L8 10L11.5 13.5V2.5H4.5Z"
                        :style="{ fill: getTagColor(selectedTodoTag) }"
                      />
                      <path
                        v-else
                        d="M3 2.5C3 1.67157 3.67157 1 4.5 1H11.5C12.3284 1 13 1.67157 13 2.5V13.5C13 13.7652 12.8946 14.0196 12.7071 14.2071C12.5196 14.3946 12.2652 14.5 12 14.5C11.7348 14.5 11.4804 14.3946 11.2929 14.2071L8 10.9142L4.70711 14.2071C4.51957 14.3946 4.26522 14.5 4 14.5C3.73478 14.5 3.48043 14.3946 3.29289 14.2071C3.10536 14.0196 3 13.7652 3 13.5V2.5ZM4.5 2.5V13.5L8 10L11.5 13.5V2.5H4.5Z"
                        stroke="currentColor"
                        stroke-width="1.5"
                        fill="none"
                      />
                    </svg>
                    {{ selectedTodoTag ? getTagLabel(selectedTodoTag) : '待办' }}
                  </el-button>
                </template>
                <div class="todo-popover-content">
                  <div class="todo-options">
                    <div class="todo-option" @click="handleTodoTag('invoice')">
                      <div class="todo-icon blue">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path
                            d="M3 2.5C3 1.67157 3.67157 1 4.5 1H11.5C12.3284 1 13 1.67157 13 2.5V13.5C13 13.7652 12.8946 14.0196 12.7071 14.2071C12.5196 14.3946 12.2652 14.5 12 14.5C11.7348 14.5 11.4804 14.3946 11.2929 14.2071L8 10.9142L4.70711 14.2071C4.51957 14.3946 4.26522 14.5 4 14.5C3.73478 14.5 3.48043 14.3946 3.29289 14.2071C3.10536 14.0196 3 13.7652 3 13.5V2.5ZM4.5 2.5V13.5L8 10L11.5 13.5V2.5H4.5Z"
                            fill="#409EFF"
                          />
                        </svg>
                      </div>
                      <span class="todo-text">开发票</span>
                    </div>
                    <div class="todo-option" @click="handleTodoTag('complaint')">
                      <div class="todo-icon red">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path
                            d="M3 2.5C3 1.67157 3.67157 1 4.5 1H11.5C12.3284 1 13 1.67157 13 2.5V13.5C13 13.7652 12.8946 14.0196 12.7071 14.2071C12.5196 14.3946 12.2652 14.5 12 14.5C11.7348 14.5 11.4804 14.3946 11.2929 14.2071L8 10.9142L4.70711 14.2071C4.51957 14.3946 4.26522 14.5 4 14.5C3.73478 14.5 3.48043 14.3946 3.29289 14.2071C3.10536 14.0196 3 13.7652 3 13.5V2.5ZM4.5 2.5V13.5L8 10L11.5 13.5V2.5H4.5Z"
                            fill="#F56C6C"
                          />
                        </svg>
                      </div>
                      <span class="todo-text">投诉</span>
                    </div>
                    <div class="todo-option" @click="handleTodoTag('cancel')">
                      <div class="todo-icon yellow">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path
                            d="M3 2.5C3 1.67157 3.67157 1 4.5 1H11.5C12.3284 1 13 1.67157 13 2.5V13.5C13 13.7652 12.8946 14.0196 12.7071 14.2071C12.5196 14.3946 12.2652 14.5 12 14.5C11.7348 14.5 11.4804 14.3946 11.2929 14.2071L8 10.9142L4.70711 14.2071C4.51957 14.3946 4.26522 14.5 4 14.5C3.73478 14.5 3.48043 14.3946 3.29289 14.2071C3.10536 14.0196 3 13.7652 3 13.5V2.5ZM4.5 2.5V13.5L8 10L11.5 13.5V2.5H4.5Z"
                            fill="#E6A23C"
                          />
                        </svg>
                      </div>
                      <span class="todo-text">取消退换</span>
                    </div>
                    <div class="todo-option" @click="handleTodoTag('exchange')">
                      <div class="todo-icon green">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path
                            d="M3 2.5C3 1.67157 3.67157 1 4.5 1H11.5C12.3284 1 13 1.67157 13 2.5V13.5C13 13.7652 12.8946 14.0196 12.7071 14.2071C12.5196 14.3946 12.2652 14.5 12 14.5C11.7348 14.5 11.4804 14.3946 11.2929 14.2071L8 10.9142L4.70711 14.2071C4.51957 14.3946 4.26522 14.5 4 14.5C3.73478 14.5 3.48043 14.3946 3.29289 14.2071C3.10536 14.0196 3 13.7652 3 13.5V2.5ZM4.5 2.5V13.5L8 10L11.5 13.5V2.5H4.5Z"
                            fill="#67C23A"
                          />
                        </svg>
                      </div>
                      <span class="todo-text">换货补送</span>
                    </div>
                  </div>
                  <div class="todo-tip">点击标签可对消息进行标记待办,再次点击可取消</div>
                </div>
              </el-popover>
              <el-button class="pin-btn" @click="togglePin">
                <span class="pin-icon" v-html="isPinned ? unpinIcon : pinIcon" />
              </el-button>
            </div>
          </div>

          <!-- 聊天消息区域 -->
          <div class="chat-section">
            <div class="chat-messages">
              <!-- 用户消息 -->
              <div class="chat-message user-message">
                <div class="message-avatar">
                  <div class="avatar-placeholder user-avatar">
                    <el-icon><User /></el-icon>
                  </div>
                </div>
                <div class="message-content">
                  <div class="message-name" :class="{ 'demo-mode-blur': isDemoMode }">大**</div>
                  <div class="message-bubble user-bubble">瓷白有没有</div>
                </div>
              </div>

              <!-- 店铺消息 -->
              <div class="chat-message store-message">
                <div class="message-avatar">
                  <div class="avatar-placeholder store-avatar">
                    <el-icon><Shop /></el-icon>
                  </div>
                </div>
                <div class="message-content">
                  <!-- 时间戳和商家名称 -->
                  <div class="message-header-row">
                    <span class="message-time">01-07 15:56:35</span>
                    <span class="store-name" :class="{ 'demo-mode-blur': isDemoMode }">东鹏卫浴蓝翔水暖批发</span>
                  </div>
                  <!-- 消息内容和状态 -->
                  <div class="message-content-row">
                    <div class="message-status">已读</div>
                    <div class="message-bubble store-bubble">我查一下库存</div>
                  </div>
                </div>
              </div>

              <!-- 店铺消息2 -->
              <div class="chat-message store-message">
                <div class="message-avatar">
                  <div class="avatar-placeholder store-avatar">
                    <el-icon><Shop /></el-icon>
                  </div>
                </div>
                <div class="message-content">
                  <!-- 时间戳和商家名称 -->
                  <div class="message-header-row">
                    <span class="message-time">01-07 15:58:07</span>
                    <span class="store-name" :class="{ 'demo-mode-blur': isDemoMode }">东鹏卫浴蓝翔水暖批发</span>
                  </div>
                  <!-- 消息内容和状态 -->
                  <div class="message-content-row">
                    <div class="message-status">已读</div>
                    <div class="message-bubble store-bubble">象牙白</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 输入区域 -->
          <div class="chat-input-area">
            <div class="input-toolbar">
              <el-button text class="toolbar-btn">
                <el-icon><Picture /></el-icon>
              </el-button>
            </div>
            <div ref="inputWrapperRef" class="input-wrapper">
              <el-input
                v-model="messageInput"
                type="textarea"
                :rows="4"
                placeholder="请输入你要回复顾客的内容"
                resize="none"
                class="message-textarea"
                @keydown.enter.exact="handleEnterKey"
                @keydown.shift.enter.exact.prevent
                @input="handleMessageInput"
                @keydown.down.prevent="handleAutocompleteKeyDown"
                @keydown.up.prevent="handleAutocompleteKeyUp"
              />
              <!-- 输入联想下拉列表 -->
              <div
                v-if="quickReplyAutoComplete && autocompleteVisible && autocompleteMatches.length > 0"
                class="autocomplete-dropdown"
              >
                <div
                  v-for="(match, index) in autocompleteMatches"
                  :key="`${match.groupId}-${match.itemId}`"
                  :class="['autocomplete-item', { active: autocompleteSelectedIndex === index }]"
                  @click="handleSelectAutocomplete(match)"
                  @mouseenter="autocompleteSelectedIndex = index"
                >
                  <div class="autocomplete-group-name">{{ match.groupName }}</div>
                  <div class="autocomplete-content" v-html="highlightKeyword(match.content, messageInput.trim())" />
                </div>
              </div>
              <div class="input-footer">
                <span class="input-tip">Shift + Enter换行, Enter发送</span>
                <el-button class="send-btn" @click="handleSendMessage">发送</el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：订单详情区域 -->
        <div class="order-detail-panel">
          <!-- 顶部标签页 -->
          <div class="detail-tabs">
            <div
              v-for="tab in detailTabs"
              :key="tab.key"
              :class="['detail-tab-item', { active: activeDetailTab === tab.key }]"
              @click="activeDetailTab = tab.key"
            >
              <span class="tab-icon" v-html="tab.icon" />
              <span>{{ tab.label }}</span>
            </div>
          </div>

          <!-- 快捷回复内容 -->
          <div v-if="activeDetailTab === 'quick-reply'" class="quick-reply-section">
            <!-- 顶部标题区域 -->
            <div class="quick-reply-header">
              <div class="header-left">
                <div class="title">快捷回复输入联想</div>
                <div class="description">在输入时根据关键词快速找到回复话术</div>
              </div>
              <div class="header-right">
                <el-switch v-model="quickReplyAutoComplete" />
              </div>
            </div>

            <!-- 标签页 -->
            <div class="quick-reply-tabs">
              <div
                v-for="tab in quickReplyTabs"
                :key="tab.key"
                :class="['quick-reply-tab', { active: activeQuickReplyTab === tab.key }]"
                @click="activeQuickReplyTab = tab.key"
              >
                {{ tab.label }}
              </div>
            </div>

            <!-- 搜索和操作栏 -->
            <div class="quick-reply-toolbar">
              <el-input
                v-model="quickReplySearchKeyword"
                placeholder="输入关键词,搜索快捷回复话术"
                clearable
                class="search-input"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <div class="toolbar-actions">
                <el-button class="import-export-btn" @click="handleImportScript"> 导入 </el-button>
                <el-button class="import-export-btn" @click="handleExportScript"> 分享 </el-button>
                <el-button type="primary" class="add-group-btn" @click="handleAddGroup">
                  <el-icon><Plus /></el-icon>
                  添加分组
                </el-button>
              </div>
            </div>

            <!-- 分组列表 -->
            <div class="quick-reply-groups">
              <div v-for="group in quickReplyGroups" :key="group.id" class="quick-reply-group">
                <div class="group-header" @click="toggleGroup(group.id)">
                  <el-icon class="collapse-icon" :class="{ collapsed: group.collapsed }">
                    <ArrowDown />
                  </el-icon>
                  <div v-if="group.icon" class="group-icon">
                    <span v-html="group.icon" />
                  </div>
                  <span class="group-name">{{ group.name }}</span>
                  <div v-if="group.name !== '常用回复'" class="group-actions">
                    <div
                      class="action-icon"
                      :class="{ disabled: !canMoveUpGroup(group.id) }"
                      @click.stop="canMoveUpGroup(group.id) && handleMoveUpGroup(group.id)"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 1024 1024"
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M489.344 233.408a32 32 0 0 1 45.248 0l170.688 170.624a32 32 0 1 1-45.248 45.248L544 333.248v605.44a32 32 0 0 1-64 0v-605.44L363.904 449.28a32 32 0 1 1-45.184-45.248zM53.312 85.312a32 32 0 0 1 32-32h853.312a32 32 0 0 1 0 64H85.12a32 32 0 0 1-32-32"
                          fill="#8a8a8a"
                        />
                      </svg>
                    </div>
                    <div class="action-icon" @click.stop="handleMoveDownGroup(group.id)">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 1024 1024"
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M53.376 938.688a32 32 0 0 1 32-32h853.312a32 32 0 0 1 0 64H85.376a32 32 0 0 1-32-32M512 53.312a32 32 0 0 1 32 32v605.44l116.096-116.032a32 32 0 0 1 45.184 45.248l-170.624 170.624a32 32 0 0 1-45.248 0L318.72 619.968a32 32 0 0 1 45.248-45.248L480 690.752v-605.44a32 32 0 0 1 32-32"
                          fill="#8a8a8a"
                        />
                      </svg>
                    </div>
                    <div class="action-icon" @click.stop="handleAddToGroup(group.id)">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <line x1="8" y1="3" x2="8" y2="13" stroke="#909399" stroke-width="1.5" stroke-linecap="round" />
                        <line x1="3" y1="8" x2="13" y2="8" stroke="#909399" stroke-width="1.5" stroke-linecap="round" />
                      </svg>
                    </div>
                    <div class="action-icon" @click.stop="handleEditGroup(group.id)">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 1024 1024"
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M622.336 214.016l169.728 169.792 88.576-88.576a53.888 53.888 0 0 0 0-76.224l-93.568-93.504a53.824 53.824 0 0 0-76.16 0zM261.632 914.24l484.736-484.736-169.792-169.728-481.536 481.6a10.56 10.56 0 0 0-3.2 7.552v154.56a10.752 10.752 0 0 0 10.752 10.752z m403.584-834.496a118.464 118.464 0 0 1 167.552 0l93.568 93.568a118.528 118.528 0 0 1 0 167.616l-573.312 573.312h611.392a32.32 32.32 0 1 1 0 64.64H102.592a75.392 75.392 0 0 1-75.392-75.392v-154.56a75.52 75.52 0 0 1 22.08-53.248z"
                          fill="#8a8a8a"
                        />
                      </svg>
                    </div>
                    <div class="action-icon" @click.stop="handleDeleteGroup(group.id)">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 1024 1024"
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M595.2 397.44a30.72 30.72 0 0 1 31.36 31.36v333.44a31.36 31.36 0 1 1-64 0V428.8a30.72 30.72 0 0 1 30.72-31.36M428.8 397.44a30.72 30.72 0 0 1 30.72 31.36v333.44a31.36 31.36 0 1 1-64 0V428.8a30.72 30.72 0 0 1 31.36-31.36"
                          fill="#8a8a8a"
                        />
                        <path
                          d="M887.68 188.16h-218.88v-51.84a115.84 115.84 0 0 0-115.2-115.2h-83.2a115.84 115.84 0 0 0-115.2 115.2v51.84H136.32a31.36 31.36 0 0 0 0 64h13.44l72.32 648.32a115.2 115.2 0 0 0 113.92 102.4h352a115.2 115.2 0 0 0 113.92-102.4l72.32-649.6h13.44a31.36 31.36 0 1 0 0-64z m-469.76-51.84a52.48 52.48 0 0 1 52.48-52.48h83.2a52.48 52.48 0 0 1 52.48 52.48v51.84H417.92z m320 757.12a52.48 52.48 0 0 1-51.84 46.72H336a52.48 52.48 0 0 1-51.84-44.16L213.12 256h597.76z"
                          fill="#8a8a8a"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <div v-show="!group.collapsed" class="group-content">
                  <div v-if="group.items && group.items.length > 0" class="group-items">
                    <div
                      v-for="(item, itemIndex) in group.items"
                      :key="item.id"
                      class="group-item"
                      :class="{ dragging: draggedItemId === Number(item.id) }"
                      draggable="true"
                      @dragstart="
                        handleDragStart(group.id as number | string, item.id as number | string, itemIndex, $event)
                      "
                      @dragend="handleDragEnd"
                      @dragover.prevent="handleDragOver($event)"
                      @drop="handleDrop(group.id as number | string, itemIndex, $event)"
                    >
                      <div class="item-drag-icon">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2 4H14M2 8H14M2 12H14" stroke="#909399" stroke-width="1.5" stroke-linecap="round" />
                        </svg>
                      </div>
                      <div class="item-content" @click="handleSelectQuickReply(item)">
                        {{ item.content }}
                      </div>
                      <div class="item-actions">
                        <div class="item-action-icon" @click.stop="handleSelectQuickReply(item)">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 1024 1024"
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M1014.288782 129.308444a42.666667 42.666667 0 0 1 5.802667 45.141334L715.024782 829.610667a42.666667 42.666667 0 0 1-63.146666 16.952889l-234.666667-163.783112a42.666667 42.666667 0 0 1 48.839111-69.973333l193.024 134.741333 245.902222-528.099555L146.875449 408.462222l156.814222 104.248889a42.666667 42.666667 0 0 0 45.056 1.336889l235.719111-137.073778a42.666667 42.666667 0 1 1 42.922667 73.756445l-235.719111 137.102222a128 128 0 0 1-135.253334-4.039111L19.131449 425.984a42.666667 42.666667 0 0 1 13.312-76.942222l938.666667-233.984a42.666667 42.666667 0 0 1 43.207111 14.250666h-0.056889z"
                              fill="#8a8a8a"
                            />
                            <path
                              d="M481.439004 686.876444a42.666667 42.666667 0 0 1 1.934223 60.302223l-153.514667 163.783111A42.666667 42.666667 0 0 1 256.045227 881.777778v-163.811556a42.666667 42.666667 0 1 1 85.333333 0v55.893334l79.786667-85.048889a42.666667 42.666667 0 0 1 60.302222-1.934223z"
                              fill="#8a8a8a"
                            />
                          </svg>
                        </div>
                        <el-popover
                          v-model:visible="getMoreActionsRef(group.id, item.id).value"
                          placement="bottom-end"
                          :width="120"
                          trigger="click"
                          popper-class="more-actions-popover"
                          :popper-options="{ modifiers: [{ name: 'offset', options: { offset: [0, 8] } }] }"
                          :hide-after="0"
                        >
                          <template #reference>
                            <div class="item-action-icon" @click.stop>
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <circle cx="4" cy="8" r="1" fill="#909399" />
                                <circle cx="8" cy="8" r="1" fill="#909399" />
                                <circle cx="12" cy="8" r="1" fill="#909399" />
                              </svg>
                            </div>
                          </template>
                          <div class="more-actions-menu" @click.stop>
                            <div class="menu-item" @click.stop="handleCopyScript(group.id, item)">
                              <span>复制</span>
                            </div>
                            <div class="menu-item" @click.stop="handleEditScript(group.id, item)">
                              <span>编辑</span>
                            </div>
                            <div class="menu-item" @click.stop="handleDeleteScript(group.id, item)">
                              <span>删除</span>
                            </div>
                          </div>
                        </el-popover>
                      </div>
                    </div>
                  </div>
                  <div v-else class="empty-group">
                    <div class="empty-icon">
                      <svg
                        width="120"
                        height="120"
                        viewBox="0 0 120 120"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <!-- 盒子底部 -->
                        <path
                          d="M25 50L60 70L95 50V85C95 89.4183 91.4183 93 87 93H33C28.5817 93 25 89.4183 25 85V50Z"
                          fill="url(#emptyBoxGradient)"
                          stroke="#DCDFE6"
                          stroke-width="1.5"
                        />
                        <!-- 盒子顶部左翼 -->
                        <path
                          d="M25 50L60 30L60 70L25 50Z"
                          fill="url(#emptyBoxGradient)"
                          stroke="#DCDFE6"
                          stroke-width="1.5"
                        />
                        <!-- 盒子顶部右翼 -->
                        <path
                          d="M95 50L60 30L60 70L95 50Z"
                          fill="url(#emptyBoxShadow)"
                          stroke="#DCDFE6"
                          stroke-width="1.5"
                        />
                        <!-- 内部线条表示空 -->
                        <path
                          d="M35 58L60 72L85 58"
                          stroke="#C0C4CC"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          opacity="0.5"
                        />
                        <path
                          d="M35 70L85 70"
                          stroke="#C0C4CC"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          opacity="0.5"
                        />
                        <path
                          d="M35 78L85 78"
                          stroke="#C0C4CC"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          opacity="0.5"
                        />
                        <!-- 渐变定义 -->
                        <defs>
                          <linearGradient
                            id="emptyBoxGradient"
                            x1="25"
                            y1="30"
                            x2="95"
                            y2="93"
                            gradientUnits="userSpaceOnUse"
                          >
                            <stop offset="0%" stop-color="#FAFBFC" stop-opacity="0.8" />
                            <stop offset="100%" stop-color="#F5F7FA" stop-opacity="1" />
                          </linearGradient>
                          <linearGradient
                            id="emptyBoxShadow"
                            x1="60"
                            y1="30"
                            x2="95"
                            y2="50"
                            gradientUnits="userSpaceOnUse"
                          >
                            <stop offset="0%" stop-color="#F5F7FA" stop-opacity="0.6" />
                            <stop offset="100%" stop-color="#E4E7ED" stop-opacity="0.8" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                    <div class="empty-text">没有快捷回复话术</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 提示条 -->
          <!-- 商品列表页面 -->
          <div v-if="activeDetailTab === 'product'" class="product-list-page">
            <!-- 顶部标题和批量发送 -->
            <div class="product-page-header">
              <div class="product-page-title">
                <span class="title-text">全部商品</span>
                <span class="title-underline" />
              </div>
              <div class="product-page-actions">
                <el-button v-if="batchSendMode" type="text" class="cancel-batch-btn" @click="handleCancelBatch">
                  <el-icon><Close /></el-icon>
                  取消批量
                </el-button>
                <el-checkbox v-else v-model="batchSendMode">批量发送</el-checkbox>
              </div>
            </div>

            <!-- 搜索栏 -->
            <div class="product-search-bar">
              <el-input
                v-model="productSearchKeyword"
                placeholder="输入关键词/条码号/货号搜索"
                clearable
                class="product-search-input"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>

            <!-- 商品列表内容区域 -->
            <div :class="['product-list-content', { 'has-batch-bar': batchSendMode }]">
              <!-- 左侧分类栏 -->
              <div class="product-categories">
                <div class="categories-title">全部分类</div>
                <div class="categories-list">
                  <div
                    :class="['category-item', { active: selectedCategoryId === null }]"
                    @click="selectedCategoryId = null"
                  >
                    全部分类
                  </div>
                  <div
                    v-for="category in productCategories"
                    :key="category.id"
                    :class="['category-item', { active: selectedCategoryId === category.id }]"
                    @click="selectedCategoryId = category.id"
                  >
                    {{ category.name }}
                  </div>
                </div>
              </div>

              <!-- 右侧商品卡片列表 -->
              <div class="product-cards-container">
                <div class="product-cards-list">
                  <div v-for="product in filteredProducts" :key="product.id" class="product-card">
                    <el-checkbox
                      v-if="batchSendMode"
                      :model-value="selectedProducts.includes(product.id)"
                      class="product-checkbox"
                      @change="(val: any) => handleProductCheckboxChange(product.id, !!val)"
                    />
                    <div class="product-card-image">
                      <img :src="product.image" :alt="product.name" />
                      <div v-if="product.tags && product.tags.length > 0" class="product-image-tags">
                        <span v-for="tag in product.tags" :key="tag" class="image-tag">
                          {{ tag }}
                        </span>
                      </div>
                    </div>
                    <div class="product-card-content">
                      <div class="product-card-title">{{ product.name }}</div>
                      <div class="product-card-info">
                        <span class="sales-info">月售{{ product.monthlySales || 0 }}</span>
                        <span class="divider">|</span>
                        <span class="stock-info">库存{{ product.stock || 0 }}</span>
                      </div>
                      <div class="product-card-footer">
                        <div class="product-card-price">¥ {{ product.price }}</div>
                        <el-button
                          v-if="!batchSendMode"
                          type="primary"
                          size="small"
                          class="product-send-btn"
                          @click="handleSendProduct(product)"
                        >
                          发送
                        </el-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 底部批量发送栏 -->
            <div v-if="batchSendMode" class="batch-send-bar">
              <el-button type="primary" class="batch-send-btn" @click="handleBatchSend">
                批量发送({{ selectedProducts.length }})
              </el-button>
            </div>
          </div>

          <!-- 订单详情页面 -->
          <div v-if="activeDetailTab === 'order'" class="order-tip-bar">
            <span class="tip-text">仅展示当前用户近1个月的订单</span>
            <el-button text type="primary" size="small" class="refresh-btn">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>

          <div v-if="activeDetailTab === 'order'" class="order-detail-section">
            <div class="order-content">
              <div class="order-status" :class="{ 'demo-mode-blur': isDemoMode }">#2 用户已收货</div>
              <div class="order-info">
                <div class="info-row">
                  <span class="info-label">订单编号：</span>
                  <span class="info-value" :class="{ 'demo-mode-blur': isDemoMode }">2501921962814501460</span>
                  <el-icon class="copy-icon"><DocumentCopy /></el-icon>
                </div>
                <div class="info-row">
                  <span class="info-label">下单时间：</span>
                  <span class="info-value" :class="{ 'demo-mode-blur': isDemoMode }">2025-12-25 16:45:54</span>
                </div>
                <div class="info-row">
                  <span class="info-label">买家留言：</span>
                  <span class="info-value" :class="{ 'demo-mode-blur': isDemoMode }">
                    <span class="highlight-orange">【如遇缺货】</span>:缺货时电话与我沟通
                  </span>
                </div>
              </div>

              <!-- 顾客信息 -->
              <div class="customer-info">
                <div class="customer-name" :class="{ 'demo-mode-blur': isDemoMode }">
                  关(先生)
                  <span class="phone-tail">(尾号 138****9732)</span>
                </div>
                <div class="customer-address" :class="{ 'demo-mode-blur': isDemoMode }">
                  <span>顾客地址:</span>
                  <el-link type="primary" underline="never">点击查看</el-link>
                  <el-icon class="arrow-icon"><ArrowDown /></el-icon>
                </div>
              </div>

              <!-- 商品列表 -->
              <div class="product-list">
                <div class="product-list-header">
                  <span>3 种商品, 共 3 件</span>
                  <el-button text type="primary" size="small" @click="toggleProductList">
                    {{ isProductListCollapsed ? '展开' : '收起' }}
                    <el-icon>
                      <ArrowUp v-if="!isProductListCollapsed" />
                      <ArrowDown v-else />
                    </el-icon>
                  </el-button>
                </div>
                <div v-show="!isProductListCollapsed" class="product-items">
                  <div class="product-item">
                    <div class="product-image">
                      <img src="https://via.placeholder.com/60x60?text=车厘子" alt="车厘子" />
                    </div>
                    <div class="product-content">
                      <div class="product-info">
                        <div class="product-name-row">
                          <div class="product-name">【象象精选】空运进口2J车厘子约</div>
                        </div>
                        <div class="product-desc">500-1000g左右</div>
                        <div class="product-weight">500g</div>
                      </div>
                      <div class="product-price-quantity">
                        <div class="product-price">¥49.9</div>
                        <div class="product-quantity">x1</div>
                      </div>
                    </div>
                  </div>
                  <div class="product-item">
                    <div class="product-image">
                      <img src="https://via.placeholder.com/60x60?text=香梨" alt="香梨" />
                    </div>
                    <div class="product-content">
                      <div class="product-info">
                        <div class="product-name-row">
                          <div class="product-name">【象象精选】香梨+麒麟瓜约350g</div>
                        </div>
                        <div class="product-desc">左右</div>
                        <div class="product-weight">默认</div>
                      </div>
                      <div class="product-price-quantity">
                        <div class="product-price">¥28.8</div>
                        <div class="product-quantity">x1</div>
                      </div>
                    </div>
                  </div>
                  <div class="product-item">
                    <div class="product-image">
                      <img src="https://via.placeholder.com/60x60?text=火龙果" alt="火龙果" />
                    </div>
                    <div class="product-content">
                      <div class="product-info">
                        <div class="product-name-row">
                          <div class="product-name">【象象精选】单拼火龙果</div>
                        </div>
                        <div class="product-desc">250g</div>
                      </div>
                      <div class="product-price-quantity">
                        <div class="product-price">¥15.8</div>
                        <div class="product-quantity">x1</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="product-total">
                  <span>买家实付</span>
                  <span class="total-amount">¥95.5</span>
                </div>
              </div>

              <!-- 操作按钮区域 -->
              <div class="action-buttons">
                <el-button class="view-detail-btn">查看详情</el-button>
              </div>
            </div>
          </div>

          <!-- 底部提示 -->
          <div v-if="activeDetailTab !== 'product' && activeDetailTab !== 'quick-reply'" class="bottom-tip">
            <span class="tip-line" />
            <span class="tip-text">已经到底啦~</span>
            <span class="tip-line" />
          </div>
        </div>
      </div>
    </div>

    <!-- 新建话术分组对话框 -->
    <el-dialog
      v-model="addGroupDialogVisible"
      title="新建话术分组"
      width="480px"
      :close-on-click-modal="false"
      class="add-group-dialog"
    >
      <div class="dialog-content">
        <el-input
          v-model="newGroupName"
          placeholder="请输入分组名称"
          maxlength="20"
          show-word-limit
          clearable
          class="group-name-input"
        />
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCancelAddGroup">取消</el-button>
          <el-button type="primary" class="confirm-btn" @click="handleConfirmAddGroup">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑话术分组对话框 -->
    <el-dialog
      v-model="editGroupDialogVisible"
      title="编辑话术分组"
      width="480px"
      :close-on-click-modal="false"
      class="edit-group-dialog"
    >
      <div class="dialog-content">
        <el-input
          v-model="editGroupName"
          placeholder="请输入分组名称"
          maxlength="20"
          show-word-limit
          clearable
          class="group-name-input"
        />
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCancelEditGroup">取消</el-button>
          <el-button type="primary" class="confirm-btn" @click="handleConfirmEditGroup">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 新增话术对话框 -->
    <el-dialog
      v-model="addScriptDialogVisible"
      title="新增话术"
      width="480px"
      :close-on-click-modal="false"
      class="add-script-dialog"
    >
      <div class="dialog-content">
        <!-- 话术内容输入框 -->
        <div class="script-content-wrapper">
          <el-input
            v-model="scriptContent"
            type="textarea"
            :rows="4"
            placeholder="请输入话术内容"
            maxlength="200"
            show-word-limit
            class="script-content-input"
          />
        </div>

        <!-- 分组选择下拉框 -->
        <div class="group-select-wrapper">
          <el-select v-model="currentGroupId" placeholder="请选择分组" class="group-select">
            <el-option
              v-for="group in quickReplyGroups.filter(g => g.name !== '常用回复')"
              :key="group.id"
              :label="group.name"
              :value="group.id"
            />
          </el-select>
        </div>

        <!-- 图片上传区域 -->
        <div class="image-upload-wrapper">
          <div v-if="!scriptImage" class="image-upload-area" @click="triggerImageUpload">
            <input ref="imageInputRef" type="file" accept="image/*" style="display: none" @change="handleImageUpload" />
            <div class="upload-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M5 12H19" stroke="#909399" stroke-width="2" stroke-linecap="round" />
              </svg>
            </div>
            <div class="upload-text">上传图片</div>
          </div>
          <div v-else class="image-preview">
            <img :src="scriptImage" alt="预览图片" />
            <div class="image-remove" @click="handleRemoveImage">
              <el-icon><Close /></el-icon>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCancelAddScript">取消</el-button>
          <el-button type="primary" class="confirm-btn" @click="handleConfirmAddScript">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑话术对话框 -->
    <el-dialog
      v-model="editScriptDialogVisible"
      title="编辑话术"
      width="480px"
      :close-on-click-modal="false"
      class="edit-script-dialog"
    >
      <div class="dialog-content">
        <!-- 话术内容输入框 -->
        <div class="script-content-wrapper">
          <el-input
            v-model="editScriptContent"
            type="textarea"
            :rows="4"
            placeholder="请输入话术内容"
            maxlength="200"
            show-word-limit
            class="script-content-input"
          />
        </div>

        <!-- 分组选择下拉框 -->
        <div class="group-select-wrapper">
          <el-select v-model="editingScriptGroupId" placeholder="请选择分组" class="group-select">
            <el-option
              v-for="group in quickReplyGroups.filter(g => g.name !== '常用回复')"
              :key="group.id"
              :label="group.name"
              :value="group.id"
            />
          </el-select>
        </div>

        <!-- 图片上传区域 -->
        <div class="image-upload-wrapper">
          <div v-if="!editScriptImage" class="image-upload-area" @click="triggerEditImageUpload">
            <input
              ref="editImageInputRef"
              type="file"
              accept="image/*"
              style="display: none"
              @change="handleEditImageUpload"
            />
            <div class="upload-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M5 12H19" stroke="#909399" stroke-width="2" stroke-linecap="round" />
              </svg>
            </div>
            <div class="upload-text">上传图片</div>
          </div>
          <div v-else class="image-preview">
            <img :src="editScriptImage" alt="预览图片" />
            <div class="image-remove" @click="handleRemoveEditImage">
              <el-icon><Close /></el-icon>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCancelEditScript">取消</el-button>
          <el-button type="primary" class="confirm-btn" @click="handleConfirmEditScript">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 删除分组对话框 -->
    <el-dialog
      v-model="deleteGroupDialogVisible"
      title="删除分组"
      width="480px"
      :close-on-click-modal="false"
      class="delete-group-dialog"
    >
      <div class="dialog-content">
        <div class="delete-warning">
          <div class="warning-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="#F56C6C" />
              <path d="M8 8L16 16M16 8L8 16" stroke="white" stroke-width="2" stroke-linecap="round" />
            </svg>
          </div>
          <div class="warning-text">删除分组后,所属快捷短语全部一并删除,点击确定继续操作</div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCancelDeleteGroup">取消</el-button>
          <el-button type="primary" class="confirm-btn" @click="handleConfirmDeleteGroup">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 导入话术对话框 -->
    <el-dialog
      v-model="importScriptDialogVisible"
      width="480px"
      :close-on-click-modal="false"
      class="import-script-dialog"
    >
      <template #header>
        <span class="el-dialog__title">{{ importDialogTitle }}</span>
      </template>
      <div class="dialog-content">
        <div class="import-code-wrapper">
          <div class="import-label">请输入6位数字分享码</div>
          <el-input v-model="importCode" placeholder="请输入6位数字分享码" maxlength="6" class="import-code-input" />
          <div class="import-tips">
            <div class="tips-title">使用说明：</div>
            <div class="tips-content">
              <p>1. 向分享者获取6位数字分享码</p>
              <p>2. 分享码有效期为5分钟，请及时使用</p>
              <p>3. 输入分享码后点击确定即可导入话术</p>
              <p>4. 导入的话术将添加到当前标签页的分组中</p>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCancelImportScript">取消</el-button>
          <el-button type="primary" class="confirm-btn" @click="handleConfirmImportScript">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 分享话术对话框 -->
    <el-dialog
      v-model="shareScriptDialogVisible"
      width="480px"
      :close-on-click-modal="false"
      class="share-script-dialog"
    >
      <template #header>
        <span class="el-dialog__title">{{ shareDialogTitle }}</span>
      </template>
      <div class="dialog-content">
        <div class="share-code-wrapper">
          <div class="share-label">分享码（有效期5分钟）</div>
          <div class="share-code-display">
            <div class="share-code-text">{{ shareCode }}</div>
            <el-button type="primary" class="copy-btn" @click="handleCopyShareCode">
              <el-icon><DocumentCopy /></el-icon>
              复制
            </el-button>
          </div>
          <div class="share-expiry">
            <span class="expiry-label">剩余时间：</span>
            <span class="expiry-time">{{ remainingTime }}</span>
          </div>
          <div class="share-tips">
            <div class="tips-title">使用说明：</div>
            <div class="tips-content">
              <p>1. 点击"复制"按钮复制分享码</p>
              <p>2. 将分享码发送给需要导入话术的用户</p>
              <p>3. 分享码有效期为5分钟，过期后需重新生成</p>
              <p>4. 对方在导入话术弹窗中输入此分享码即可导入</p>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" class="confirm-btn" @click="handleCloseShareScript">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Search,
  Refresh,
  DocumentCopy,
  ArrowDown,
  ArrowUp,
  ArrowRight,
  ArrowLeft,
  EditPen,
  Picture,
  User,
  Shop,
  Plus,
  Close
} from '@element-plus/icons-vue'
import { useSettingsStore } from '/@/store/modules/settings'
import { storeToRefs } from 'pinia'

defineOptions({
  name: 'CustomerServiceConversation'
})

// 获取演示模式状态
const settingsStore = useSettingsStore()
const { theme } = storeToRefs(settingsStore)
const isDemoMode = computed(() => {
  return theme.value?.demoMode === true
})

// 搜索关键词
const searchKeyword = ref('')

// 标签页
const tabs = [
  { key: 'all-channels', label: '全渠道消息' },
  { key: 'unreplied', label: '未回复' },
  { key: 'todo', label: '美团' },
  { key: 'taobao-retail', label: '淘宝闪购' }
]

const activeTab = ref('all-channels')

// 待办消息界面显示状态
const showTodoMessagePage = ref(false)

// 待办消息数量
const todoMessageCount = ref(4)

// 待办消息数据（按标签分组）
const todoMessagesByTag = ref([
  {
    tag: 'invoice',
    tagLabel: '开发票',
    tagColor: '#409EFF',
    messages: [
      {
        id: 1,
        name: '昨日#2单 B**',
        badge: '已下1单',
        content: '不好意思',
        date: '01/07',
        avatar: 'yellow'
      },
      {
        id: 2,
        name: '大**',
        badge: '门店新客',
        content: '象牙白',
        date: '01/07',
        avatar: 'yellow'
      }
    ]
  },
  {
    tag: 'complaint',
    tagLabel: '投诉',
    tagColor: '#F56C6C',
    messages: [
      {
        id: 3,
        name: '1.5#1单 O**',
        badge: null,
        content: '[图片]',
        date: '01/05',
        avatar: 'yellow'
      },
      {
        id: 4,
        name: '1.3#1单 n**',
        badge: null,
        content: '车已过去',
        date: '01/03',
        avatar: 'yellow',
        selected: true
      }
    ]
  }
])

// 会话列表
const conversationList = ref<any[]>([
  {
    id: 1,
    name: '11299540929-千...',
    time: '20:49',
    preview: '[自动回复]亲,您的商品已...',
    platform: '美团',
    platformColor: '#FFC107',
    isPinned: false,
    isUrgent: true, // 紧急消息示例
    unrepliedMinutes: 0
  },
  {
    id: 2,
    name: '8650972276-千...',
    time: '18:07',
    preview: '[自动回复]亲,您的商品已...',
    platform: '美团',
    platformColor: '#FFC107',
    isPinned: false,
    isUrgent: false,
    unrepliedMinutes: 5 // 超过3分钟未回复示例
  },
  {
    id: 3,
    name: '13800138000-张...',
    time: '17:30',
    preview: '您好，我想咨询一下...',
    platform: '淘宝',
    platformColor: '#FF6A00',
    isPinned: false,
    isUrgent: false,
    unrepliedMinutes: 2 // 普通消息示例
  }
])

// 选中的会话
const selectedConversation = ref<any>(null)

// 计算属性：是否有选中的会话（保留用于未来可能的用途）
// const hasSelectedConversation = computed(() => {
//   return selectedConversation.value !== null && selectedConversation.value !== undefined
// })

// 详情标签页
const detailTabs = [
  {
    key: 'order',
    label: '订单',
    icon: '<svg t="1767785263925" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="11498" width="16" height="16"><path d="M341.2992 488.5504a32 32 0 1 0 0 64v-64z m298.6496 64a32 32 0 1 0 0-64v64z m-298.6496 0h298.6496v-64H341.2992v64zM341.2992 659.2a32 32 0 1 0 0 64v-64z m186.88 64a32 32 0 0 0 0-64v64z m-186.88 0h186.88v-64h-186.88v64zM426.6496 288h170.6496v-64H426.6496v64z m170.6496 0c46.8992 0 81.8176-11.7248 101.2736-40.96 17.1008-25.6 16.0768-57.8048 16.0768-76.3904h-64c0 24.1152-1.024 34.56-5.3248 40.96-1.8432 2.7648-9.5744 12.3904-48.0256 12.3904v64z m117.3504-117.3504c0-46.848-11.776-81.8176-40.96-101.2736-25.6-17.1008-57.856-16.0256-76.3904-16.0256v64c24.064 0 34.56 1.024 40.96 5.2736 2.7648 1.8944 12.3904 9.6256 12.3904 48.0256h64z m-117.3504-117.2992H426.6496v64h170.6496v-64z m-170.6496 0c-18.5856 0-50.7904-1.024-76.4416 16.0256-29.184 19.456-40.9088 54.4256-40.9088 101.2736h64c0-38.4 9.6256-46.1312 12.4416-48.0256 6.3488-4.2496 16.7936-5.2736 40.9088-5.2736v-64zM309.248 170.6496c0 46.8992 11.7248 81.8688 40.96 101.3248 25.6 17.0496 57.8048 16.0256 76.3904 16.0256v-64c-24.1152 0-34.56-1.024-40.96-5.2736-2.7648-1.8944-12.3904-9.6256-12.3904-48.0768h-64z" fill="currentColor" p-id="11499"></path><path d="M684.3904 139.5712a32 32 0 0 0-3.4304 63.8976l3.4304-63.8976zM343.04 203.4688a32 32 0 0 0-3.4304-63.8976L343.04 203.4688z m337.92 0c68.608 3.7376 111.2576 18.0224 138.1376 47.104 27.2896 29.4912 44.9024 81.2032 44.9024 176.128h64c0-100.096-18.0224-172.1344-61.9008-219.5968-44.2368-47.7696-108.1856-63.5392-181.7088-67.5328L680.96 203.4688z m183.04 223.232v256h64v-256h-64z m0 256c0 84.736-11.1616 137.8304-40.0896 170.9056-28.0064 32-80.0256 53.0432-183.9104 53.0432v64c109.4144 0 185.4464-21.6064 232.0896-74.9056 45.7216-52.224 55.9104-127.1808 55.9104-213.0944h-64zM640 906.5984h-256v64h256v-64z m-256 0c-103.936 0-155.904-21.0432-183.9104-53.0432-28.928-33.0752-40.0896-86.1696-40.0896-170.9568h-64c0 85.9136 10.1888 160.8192 55.9104 213.0944 46.6432 53.2992 122.6752 74.9056 232.0896 74.9056v-64z m-224-224v-256h-64v256h64z m0-256c0-94.6688 17.6128-146.3808 44.9024-175.9232 26.9312-29.184 69.632-43.52 138.1376-47.2576l-3.4304-63.8976c-73.5744 3.9936-137.5232 19.8656-181.76 67.7376-43.8272 47.4624-61.8496 119.5008-61.8496 219.3408h64z" fill="currentColor" p-id="11500"></path></svg>'
  },
  {
    key: 'product',
    label: '商品',
    icon: '<svg t="1767785296665" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="12509" width="16" height="16"><path d="M886.544384 963.868672H137.670656c-75.91936 0-137.670656-61.78816-137.670656-137.68704l0.059392-2.138112L42.356736 196.683776c0.62464-75.421696 62.128128-136.5504 137.709568-136.5504H844.1856c75.558912 0 137.058304 61.128704 137.689088 136.5504l42.356736 629.497856c0 75.89888-61.771776 137.68704-137.68704 137.68704zM63.533056 827.131904c0.565248 40.45824 33.591296 73.1648 74.135552 73.1648h748.873728c40.57088 0 73.617408-32.70656 74.133504-73.1648L918.3232 197.801984c0-40.851456-33.263616-74.135552-74.1376-74.135552H180.066304c-40.92928 0-74.143744 33.284096-74.143744 74.135552l-0.059392 2.11968-42.330112 627.21024z" fill="currentColor" p-id="12510"></path><path d="M512.116736 599.003136c-142.977024 0-259.323904-116.30592-259.323904-259.282944 0 0 0-30.162944 35.561472-30.162944 31.778816 0 27.97568 30.162944 27.97568 30.162944 0 107.952128 87.863296 195.751936 195.786752 195.751936 107.943936 0 195.762176-87.799808 195.762176-195.751936 0 0-0.948224-30.162944 32.528384-30.162944 33.568768 0 31.031296 30.162944 31.031296 30.162944 0.002048 142.979072-116.353024 259.282944-259.321856 259.282944z" fill="currentColor" p-id="12511"></path></svg>'
  },
  {
    key: 'quick-reply',
    label: '快捷回复',
    icon: '<svg t="1767785350835" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="15224" width="16" height="16"><path d="M136.5504 192a8.5504 8.5504 0 0 0-8.5504 8.5504v537.6c0 4.7104 3.84 8.4992 8.5504 8.4992h98.0992c23.552 0 42.7008 19.0976 42.7008 42.7008v37.632l151.552-75.776a42.7008 42.7008 0 0 1 19.0976-4.5568h96a42.6496 42.6496 0 1 1 0 85.3504H458.0864l-204.3392 102.144A42.7008 42.7008 0 0 1 192 896v-64H136.5504a93.8496 93.8496 0 0 1-93.9008-93.8496v-537.6c0-51.8656 42.0352-93.9008 93.9008-93.9008h750.8992c51.8656 0 93.9008 42.0352 93.9008 93.9008V384a42.6496 42.6496 0 0 1-85.3504 0V200.5504a8.5504 8.5504 0 0 0-8.5504-8.5504H136.5504z" fill="currentColor" p-id="15225"></path><path d="M213.3504 320c0-23.552 19.0976-42.6496 42.6496-42.6496h128a42.6496 42.6496 0 0 1 0 85.2992H256a42.6496 42.6496 0 0 1-42.6496-42.6496zM213.3504 448c0-23.552 19.0976-42.6496 42.6496-42.6496h256a42.6496 42.6496 0 0 1 0 85.2992H256a42.6496 42.6496 0 0 1-42.6496-42.6496zM805.0176 444.8768c20.48 11.5712 27.6992 37.5808 16.128 58.112l-65.3824 115.712h162.2528a42.6496 42.6496 0 0 1 36.608 64.512l-114.0224 190.6688a42.6496 42.6496 0 0 1-73.216-43.776l75.4176-126.1056h-160.1536a42.6496 42.6496 0 0 1-37.12-63.6416l101.3248-179.3536a42.6496 42.6496 0 0 1 58.1632-16.128z" fill="currentColor" p-id="15226"></path></svg>'
  }
]

const activeDetailTab = ref('order')

// 商品列表展开/收起状态
const isProductListCollapsed = ref(false)

// 切换商品列表展开/收起
const toggleProductList = () => {
  isProductListCollapsed.value = !isProductListCollapsed.value
}

// 商品列表页面相关
const batchSendMode = ref(false)
const productSearchKeyword = ref('')
const selectedCategoryId = ref<number | null>(null)
const selectedProducts = ref<number[]>([])

// 商品分类数据
const productCategories = ref([
  { id: 1, name: '大淋浴花洒' },
  { id: 2, name: '其他/' },
  { id: 3, name: '潜水艇系列' },
  { id: 4, name: '净水器产品' },
  { id: 5, name: '箭牌卫浴' },
  { id: 6, name: '铜/接头配件' },
  { id: 7, name: '感应龙头' },
  { id: 8, name: '进水管下水管' },
  { id: 9, name: '厨房卫浴' },
  { id: 10, name: '地漏收纳类' },
  { id: 11, name: '箭牌卫浴' },
  { id: 12, name: '铜/接头配件' },
  { id: 13, name: '感应龙头' },
  { id: 14, name: '进水管下水管' },
  { id: 15, name: '厨房卫浴' },
  { id: 16, name: '地漏收纳类' }
])

// 商品列表数据（示例数据，实际应该从API获取）
const products = ref([
  {
    id: 1,
    name: '潜水艇 精品花洒头 三功能 手持花洒 液态硅胶 大面 手持花洒 液态硅胶 大面...',
    image: 'https://via.placeholder.com/120x120?text=花洒',
    price: 65,
    monthlySales: 0,
    stock: 10,
    categoryId: 3,
    tags: ['大水', '畅快淋浴', '大出水量', '硅胶防堵']
  },
  {
    id: 2,
    name: '潜水艇 (Submarine) F309黄铜亚银拉丝色三...',
    image: 'https://via.placeholder.com/120x120?text=接头',
    price: 68,
    monthlySales: 0,
    stock: 20,
    categoryId: 6,
    tags: ['59精铜铸造', '加厚/防爆/不生锈']
  },
  {
    id: 3,
    name: '潜水艇不锈钢面盆上装冷热水龙头洗脸池大流量...',
    image: 'https://via.placeholder.com/120x120?text=龙头',
    price: 285,
    monthlySales: 0,
    stock: 5,
    categoryId: 7,
    tags: ['镀铬亮面', '台上快装 面盆龙头']
  },
  {
    id: 4,
    name: '潜水艇 (Submarine) 淋浴花洒套装 增压喷头【...',
    image: 'https://via.placeholder.com/120x120?text=套装',
    price: 1199,
    monthlySales: 0,
    stock: 10,
    categoryId: 3,
    tags: ['钢琴按键', '三功能花洒套装']
  }
])

// 过滤后的商品列表
const filteredProducts = computed(() => {
  let result = products.value

  // 按分类过滤
  if (selectedCategoryId.value) {
    result = result.filter(p => p.categoryId === selectedCategoryId.value)
  }

  // 按关键词搜索
  if (productSearchKeyword.value) {
    const keyword = productSearchKeyword.value.toLowerCase()
    result = result.filter(p => p.name.toLowerCase().includes(keyword) || p.id.toString().includes(keyword))
  }

  return result
})

// 取消批量模式
const handleCancelBatch = () => {
  batchSendMode.value = false
  selectedProducts.value = []
}

// 批量发送商品
const handleBatchSend = () => {
  if (selectedProducts.value.length === 0) {
    ElMessage.warning('请先选择要发送的商品')
    return
  }
  ElMessage.success(`已批量发送 ${selectedProducts.value.length} 个商品`)
  // TODO: 实现批量发送商品到聊天窗口的逻辑
  selectedProducts.value = []
  batchSendMode.value = false
}

// 处理商品复选框变更
const handleProductCheckboxChange = (productId: number, checked: boolean) => {
  if (checked) {
    if (!selectedProducts.value.includes(productId)) {
      selectedProducts.value.push(productId)
    }
  } else {
    const index = selectedProducts.value.indexOf(productId)
    if (index > -1) {
      selectedProducts.value.splice(index, 1)
    }
  }
}

// 发送商品
const handleSendProduct = (product: any) => {
  if (batchSendMode.value) {
    // 批量发送模式，切换选中状态
    const index = selectedProducts.value.indexOf(product.id)
    if (index > -1) {
      selectedProducts.value.splice(index, 1)
    } else {
      selectedProducts.value.push(product.id)
    }
  } else {
    // 单个发送
    ElMessage.success(`已发送商品: ${product.name}`)
    // TODO: 实现发送商品到聊天窗口的逻辑
  }
}

// 切换标签页
const handleTabChange = (key: string) => {
  activeTab.value = key
  // TODO: 根据标签页加载不同的会话列表
  conversationList.value = []
  selectedConversation.value = null
}

// 处理筛选按钮点击
const handleFilterClick = (filter: string) => {
  // TODO: 实现筛选逻辑
  console.log('筛选:', filter)
  ElMessage.info(`筛选: ${filter}`)
}

// 选择待办消息
const handleSelectTodoMessage = (message: any) => {
  // 根据待办消息的 id 查找对应的会话
  const conversation = conversationList.value.find(item => item.id === message.id)

  if (conversation) {
    // 选中对应的会话
    handleSelectConversation(conversation)
    // 关闭待办消息界面
    showTodoMessagePage.value = false
  } else {
    // 如果找不到对应的会话，只关闭待办消息界面
    ElMessage.warning('未找到对应的会话')
    showTodoMessagePage.value = false
  }
}

// 取消待办消息
const handleCancelTodoMessage = (message: any, tag: string) => {
  // 从待办消息列表中移除该消息
  const tagGroup = todoMessagesByTag.value.find(group => group.tag === tag)
  if (tagGroup) {
    const messageIndex = tagGroup.messages.findIndex(msg => msg.id === message.id)
    if (messageIndex !== -1) {
      tagGroup.messages.splice(messageIndex, 1)
      // 如果该标签组没有消息了，移除该标签组
      if (tagGroup.messages.length === 0) {
        const groupIndex = todoMessagesByTag.value.findIndex(group => group.tag === tag)
        if (groupIndex !== -1) {
          todoMessagesByTag.value.splice(groupIndex, 1)
        }
      }
    }
  }

  // 更新会话列表中对应会话的待办标签
  const conversation = conversationList.value.find(item => item.id === message.id)
  if (conversation) {
    conversation.todoTag = null
    // 如果当前选中的会话是这个消息，同步更新待办标签
    if (selectedConversation.value?.id === message.id) {
      selectedTodoTag.value = null
    }
  }

  // 更新待办消息数量
  todoMessageCount.value = Math.max(0, todoMessageCount.value - 1)

  ElMessage.success('已取消待办')
  // TODO: 实现取消待办逻辑（保存到后端）
  console.log('取消待办:', message, tag)
}

// 选择会话
const handleSelectConversation = (conversation: any) => {
  selectedConversation.value = conversation
  // 同步置顶状态
  isPinned.value = conversation.isPinned || false
  // 同步待办标签状态
  selectedTodoTag.value = conversation.todoTag || null
}

// 消息输入
const messageInput = ref('')
const inputWrapperRef = ref<HTMLElement | null>(null)

// 输入联想相关
const autocompleteMatches = ref<Array<{ groupId: number; groupName: string; itemId: number; content: string }>>([])
const autocompleteVisible = ref(false)
const autocompleteSelectedIndex = ref(-1)

// 搜索匹配的话术
const searchQuickReply = (keyword: string) => {
  if (!keyword || keyword.trim().length === 0) {
    autocompleteMatches.value = []
    autocompleteVisible.value = false
    return
  }

  const matches: Array<{ groupId: number; groupName: string; itemId: number; content: string }> = []
  const lowerKeyword = keyword.toLowerCase()

  quickReplyGroups.value.forEach(group => {
    if (group.items && group.items.length > 0) {
      group.items.forEach((item: any) => {
        if (item.content && item.content.toLowerCase().includes(lowerKeyword)) {
          matches.push({
            groupId: group.id,
            groupName: group.name,
            itemId: item.id,
            content: item.content
          })
        }
      })
    }
  })

  // 限制最多显示10条
  autocompleteMatches.value = matches.slice(0, 10)
  autocompleteVisible.value = matches.length > 0
  autocompleteSelectedIndex.value = -1
}

// 处理消息输入
const handleMessageInput = () => {
  if (!quickReplyAutoComplete.value) {
    autocompleteVisible.value = false
    return
  }

  const keyword = messageInput.value.trim()
  searchQuickReply(keyword)
}

// 处理键盘向下导航
const handleAutocompleteKeyDown = () => {
  if (!autocompleteVisible.value || autocompleteMatches.value.length === 0) {
    return
  }
  if (autocompleteSelectedIndex.value < autocompleteMatches.value.length - 1) {
    autocompleteSelectedIndex.value++
  }
}

// 处理键盘向上导航
const handleAutocompleteKeyUp = () => {
  if (!autocompleteVisible.value || autocompleteMatches.value.length === 0) {
    return
  }
  if (autocompleteSelectedIndex.value > 0) {
    autocompleteSelectedIndex.value--
  } else {
    autocompleteSelectedIndex.value = -1
  }
}

// 处理 Enter 键
const handleEnterKey = (event: Event) => {
  const keyboardEvent = event as KeyboardEvent
  // 如果下拉列表可见且有选中项，则插入选中项
  if (autocompleteVisible.value && autocompleteSelectedIndex.value >= 0) {
    const match = autocompleteMatches.value[autocompleteSelectedIndex.value]
    if (match) {
      keyboardEvent.preventDefault()
      handleSelectAutocomplete(match)
      return
    }
  }
  // 否则发送消息
  handleSendMessage()
}

// 高亮关键词
const highlightKeyword = (text: string, keyword: string): string => {
  if (!keyword || !text || keyword.trim().length === 0) {
    // 如果没有关键词，直接返回转义后的文本
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  // 转义 HTML 特殊字符
  const escapeHtml = (str: string) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  // 转义正则表达式特殊字符
  const escapeRegex = (str: string) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  const escapedText = escapeHtml(text)
  const escapedKeyword = escapeRegex(escapeHtml(keyword.trim()))

  // 使用正则表达式匹配关键词（不区分大小写）
  try {
    const regex = new RegExp(`(${escapedKeyword})`, 'gi')
    return escapedText.replace(regex, '<span class="keyword-highlight">$1</span>')
  } catch (error) {
    // 如果正则表达式出错，返回原始文本
    console.error('高亮关键词失败:', error)
    return escapedText
  }
}

// 选择联想项
const handleSelectAutocomplete = (match: { groupId: number; groupName: string; itemId: number; content: string }) => {
  messageInput.value = match.content
  autocompleteVisible.value = false
  autocompleteMatches.value = []
  autocompleteSelectedIndex.value = -1
  ElMessage.success('已插入快捷回复')
}

// 点击外部关闭下拉列表
const handleClickOutside = (event: MouseEvent) => {
  if (inputWrapperRef.value && !inputWrapperRef.value.contains(event.target as Node)) {
    autocompleteVisible.value = false
  }
}

// 组件挂载和卸载时处理事件监听
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 发送消息
const handleSendMessage = () => {
  if (!messageInput.value.trim()) return
  // TODO: 实现发送消息逻辑
  console.log('发送消息:', messageInput.value)
  messageInput.value = ''
  autocompleteVisible.value = false
  autocompleteMatches.value = []
}

// 选中的待办标签
const selectedTodoTag = ref<string | null>(null)

// 待办标签映射
const todoTagMap: Record<string, { label: string; color: string }> = {
  invoice: { label: '开发票', color: '#409EFF' },
  complaint: { label: '投诉', color: '#F56C6C' },
  cancel: { label: '取消退换', color: '#E6A23C' },
  exchange: { label: '换货补送', color: '#67C23A' }
}

// 获取标签文字
const getTagLabel = (type: string | null) => {
  return type ? todoTagMap[type]?.label || '' : ''
}

// 获取标签颜色
const getTagColor = (type: string | null): string => {
  if (!type) return '#606266'
  const color = todoTagMap[type]?.color
  console.log('getTagColor:', type, color) // 调试用
  return color || '#409EFF'
}

// 处理待办标签
const handleTodoTag = (type: string) => {
  // 如果点击的是已选中的标签，则取消选中
  if (selectedTodoTag.value === type) {
    selectedTodoTag.value = null
    ElMessage.success('已取消待办标记')
  } else {
    selectedTodoTag.value = type
    ElMessage.success('已标记待办')
  }
  // 同步到当前选中会话和列表
  if (selectedConversation.value) {
    selectedConversation.value.todoTag = selectedTodoTag.value
    const index = conversationList.value.findIndex(item => item.id === selectedConversation.value?.id)
    if (index !== -1) {
      conversationList.value[index].todoTag = selectedTodoTag.value
    }
  }
  // TODO: 实现待办标签逻辑（保存到后端）
  console.log('选择待办标签:', selectedTodoTag.value)
}

// 置顶状态
const isPinned = ref(false)

// 置顶图标
const pinIcon =
  '<svg t="1767788413326" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2114" width="16" height="16"><path d="M766.5 472.3l-206-206c-26.2-26.2-68.8-26.2-95 0l-206 206c-10.9 10.9-10.9 28.7 0 39.6 10.9 10.9 28.7 10.9 39.6 0L485 326v606.2c0 15.5 12.5 28 28 28s28-12.5 28-28V326l185.9 185.9c10.9 10.9 28.7 10.9 39.6 0 11-10.9 11-28.6 0-39.6zM818.7 120.7H207.3c-15.5 0-28-12.5-28-28s12.5-28 28-28h611.5c15.5 0 28 12.5 28 28-0.1 15.4-12.6 28-28.1 28z" fill="currentColor" p-id="2115"></path></svg>'

// 取消置顶图标
const unpinIcon =
  '<svg t="1767788430360" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2327" width="16" height="16"><path d="M818.7 120.7H207.3c-15.5 0-28-12.5-28-28s12.5-28 28-28h611.5c15.5 0 28 12.5 28 28-0.1 15.4-12.6 28-28.1 28zM552.6 617.4L768 402c10.9-10.9 10.9-28.7 0-39.6-10.9-10.9-28.7-10.9-39.6 0L513 577.8 297.6 362.4c-10.9-10.9-28.7-10.9-39.6 0-10.9 10.9-10.9 28.7 0 39.6l215.4 215.4L258 832.9c-10.9 10.9-10.9 28.7 0 39.6 10.9 10.9 28.7 10.9 39.6 0L513 657l215.4 215.4c10.9 10.9 28.7 10.9 39.6 0 10.9-10.9 10.9-28.7 0-39.6L552.6 617.4z" fill="currentColor" p-id="2328"></path></svg>'

// 切换置顶状态
const togglePin = () => {
  isPinned.value = !isPinned.value
  // 更新当前选中会话的置顶状态
  if (selectedConversation.value) {
    selectedConversation.value.isPinned = isPinned.value
    // 更新会话列表中的状态
    const index = conversationList.value.findIndex(item => item.id === selectedConversation.value?.id)
    if (index !== -1) {
      conversationList.value[index].isPinned = isPinned.value
    }
  }
  // TODO: 实现置顶/取消置顶逻辑
  console.log('置顶状态:', isPinned.value)
}

// 置顶消息
const handlePinMessage = (item: any) => {
  item.isPinned = !item.isPinned
  if (selectedConversation.value?.id === item.id) {
    isPinned.value = item.isPinned
  }
  ElMessage.success(item.isPinned ? '已置顶' : '已取消置顶')
  // TODO: 实现置顶逻辑
}

// 显示待办菜单
const handleShowTodoMenu = (item: any) => {
  // 可以在这里做一些处理
  console.log('显示待办菜单:', item)
}

// 标记待办标签
const handleMarkTodoTag = (item: any, type: string) => {
  // 如果点击的是已选中的标签，则取消选中
  if (item.todoTag === type) {
    item.todoTag = null
    ElMessage.success('已取消待办标记')
  } else {
    item.todoTag = type
    ElMessage.success(`已标记待办: ${todoTagMap[type]?.label}`)
  }
  // 如果当前选中的会话是这个消息，同步更新待办标签
  if (selectedConversation.value?.id === item.id) {
    selectedTodoTag.value = item.todoTag
  }
  // TODO: 实现标记待办标签逻辑（保存到后端）
  console.log('标记待办标签:', item, type)
}

// 快捷回复相关
const activeQuickReplyTab = ref('personal')
const quickReplySearchKeyword = ref('')
const quickReplyAutoComplete = ref(true) // 快捷回复输入联想开关

// 监听开关变化
watch(quickReplyAutoComplete, newVal => {
  if (!newVal) {
    autocompleteVisible.value = false
    autocompleteMatches.value = []
  }
})

const addGroupDialogVisible = ref(false)
const newGroupName = ref('')

// 编辑分组弹窗相关
const editGroupDialogVisible = ref(false)
const editGroupName = ref('')
const editingGroupId = ref<number | null>(null)

// 删除分组弹窗相关
const deleteGroupDialogVisible = ref(false)
const deletingGroupId = ref<number | null>(null)

// 新增话术弹窗相关
const addScriptDialogVisible = ref(false)
const currentGroupId = ref<number | null>(null)
const scriptContent = ref('')
const scriptImage = ref<string | null>(null)
const imageInputRef = ref<HTMLInputElement | null>(null)

// 编辑话术弹窗相关
const editScriptDialogVisible = ref(false)
const editingScriptId = ref<number | null>(null)
const editingScriptGroupId = ref<number | null>(null)
const editScriptContent = ref('')
const editScriptImage = ref<string | null>(null)
const editImageInputRef = ref<HTMLInputElement | null>(null)

// 导入话术弹窗相关
const importScriptDialogVisible = ref(false)
const importCode = ref('')

// 分享话术弹窗相关
const shareScriptDialogVisible = ref(false)
const shareCode = ref('')
const shareCodeExpiry = ref<Date | null>(null)
const shareCodeTimer = ref<number | null>(null)

// 分享码存储（用于验证）
const shareCodeMap = ref<Map<string, { data: any[]; expiry: Date }>>(new Map())

// 拖拽排序相关
const draggedItemId = ref<number | null>(null)
const draggedGroupId = ref<number | null>(null)
const draggedItemIndex = ref<number>(-1)

// 更多操作菜单相关
const moreActionsPopoverRefs = ref<Map<string, any>>(new Map())

// 获取菜单 ref
const getMoreActionsRef = (groupId: number, itemId: number) => {
  const key = `${groupId}-${itemId}`
  if (!moreActionsPopoverRefs.value.has(key)) {
    moreActionsPopoverRefs.value.set(key, ref(false))
  }
  return moreActionsPopoverRefs.value.get(key)
}

const quickReplyTabs = [
  { key: 'personal', label: '个人话术' },
  { key: 'team', label: '团队话术' }
]

// 获取当前标签页的标题
const currentTabLabel = computed(() => {
  const currentTab = quickReplyTabs.find(tab => tab.key === activeQuickReplyTab.value)
  return currentTab ? currentTab.label : '话术'
})

// 导入弹窗标题
const importDialogTitle = computed(() => {
  return `导入${currentTabLabel.value}`
})

// 分享弹窗标题
const shareDialogTitle = computed(() => {
  return `分享${currentTabLabel.value}`
})

const quickReplyGroups = ref<any[]>([
  {
    id: 1,
    name: '常用回复',
    icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1ZM8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8C14 11.3137 11.3137 14 8 14Z" fill="#FF6A00"/><path d="M5 7C5 6.44772 5.44772 6 6 6H10C10.5523 6 11 6.44772 11 7C11 7.55228 10.5523 8 10 8H6C5.44772 8 5 7.55228 5 7Z" fill="#FF6A00"/><path d="M6 9C5.44772 9 5 9.44772 5 10C5 10.5523 5.44772 11 6 11H8C8.55228 11 9 10.5523 9 10C9 9.44772 8.55228 9 8 9H6Z" fill="#FF6A00"/></svg>',
    collapsed: false,
    items: [
      { id: 1, content: '您好，有什么可以帮您的吗？' },
      { id: 2, content: '感谢您的咨询，我们会尽快为您处理。' }
    ]
  },
  {
    id: 2,
    name: '123',
    icon: null,
    collapsed: false,
    items: []
  }
])

// 切换分组折叠状态
const toggleGroup = (groupId: number) => {
  const group = quickReplyGroups.value.find(g => g.id === groupId)
  if (group) {
    group.collapsed = !group.collapsed
  }
}

// 生成6位数字分享码
const generateShareCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// 导入话术
const handleImportScript = () => {
  importCode.value = ''
  importScriptDialogVisible.value = true
}

// 确认导入话术
const handleConfirmImportScript = () => {
  if (!importCode.value || importCode.value.length !== 6) {
    ElMessage.warning('请输入6位数字分享码')
    return
  }

  const shareData = shareCodeMap.value.get(importCode.value)
  if (!shareData) {
    ElMessage.error('分享码不存在或已过期')
    return
  }

  // 检查是否过期
  if (new Date() > shareData.expiry) {
    shareCodeMap.value.delete(importCode.value)
    ElMessage.error('分享码已过期')
    return
  }

  // 导入话术数据
  shareData.data.forEach((item: any) => {
    if (item.groupName && item.content) {
      // 查找或创建分组
      let group = quickReplyGroups.value.find(g => g.name === item.groupName)
      if (!group) {
        // 创建新分组
        group = {
          id: Date.now() + Math.random(),
          name: item.groupName,
          icon: null,
          collapsed: false,
          items: []
        }
        quickReplyGroups.value.push(group)
      }

      // 添加话术到分组
      const scriptItem = {
        id: Date.now() + Math.random(),
        content: item.content,
        image: item.image || null
      }
      group.items.push(scriptItem)
    }
  })

  ElMessage.success('导入话术成功')
  importScriptDialogVisible.value = false
  importCode.value = ''
}

// 取消导入话术
const handleCancelImportScript = () => {
  importScriptDialogVisible.value = false
  importCode.value = ''
}

// 监听导入码输入，只允许数字
watch(importCode, newVal => {
  if (newVal) {
    const filtered = newVal.replace(/\D/g, '')
    if (filtered !== newVal) {
      importCode.value = filtered
    }
  }
})

// 分享话术
const handleExportScript = () => {
  try {
    // 构建导出数据
    const exportData: any[] = []

    quickReplyGroups.value.forEach(group => {
      if (group.items && group.items.length > 0) {
        group.items.forEach((item: any) => {
          exportData.push({
            groupName: group.name,
            content: item.content,
            image: item.image || null
          })
        })
      }
    })

    if (exportData.length === 0) {
      ElMessage.warning('没有可分享的话术')
      return
    }

    // 生成6位数字分享码
    const code = generateShareCode()
    shareCode.value = code

    // 设置有效期5分钟
    const expiry = new Date()
    expiry.setMinutes(expiry.getMinutes() + 5)
    shareCodeExpiry.value = expiry

    // 存储分享码数据
    shareCodeMap.value.set(code, {
      data: exportData,
      expiry: expiry
    })

    // 设置定时器，5分钟后清除分享码
    if (shareCodeTimer.value) {
      clearTimeout(shareCodeTimer.value)
    }
    shareCodeTimer.value = window.setTimeout(
      () => {
        shareCodeMap.value.delete(code)
        if (shareScriptDialogVisible.value) {
          shareScriptDialogVisible.value = false
          ElMessage.warning('分享码已过期')
        }
      },
      5 * 60 * 1000
    )

    // 显示分享弹窗
    shareScriptDialogVisible.value = true
  } catch (error) {
    ElMessage.error('分享话术失败')
  }
}

// 关闭分享弹窗
const handleCloseShareScript = () => {
  shareScriptDialogVisible.value = false
}

// 复制分享码
const handleCopyShareCode = () => {
  navigator.clipboard
    .writeText(shareCode.value)
    .then(() => {
      ElMessage.success('分享码已复制到剪贴板')
    })
    .catch(() => {
      // 降级方案
      const textarea = document.createElement('textarea')
      textarea.value = shareCode.value
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      ElMessage.success('分享码已复制到剪贴板')
    })
}

// 计算剩余时间
const getRemainingTime = () => {
  if (!shareCodeExpiry.value) return '00:00'
  const now = new Date()
  const diff = shareCodeExpiry.value.getTime() - now.getTime()
  if (diff <= 0) return '00:00'
  const minutes = Math.floor(diff / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

// 剩余时间显示
const remainingTime = ref('05:00')

// 更新剩余时间
const updateRemainingTime = () => {
  if (shareScriptDialogVisible.value && shareCodeExpiry.value) {
    remainingTime.value = getRemainingTime()
    const now = new Date()
    if (shareCodeExpiry.value.getTime() > now.getTime()) {
      setTimeout(updateRemainingTime, 1000)
    } else {
      remainingTime.value = '00:00'
    }
  }
}

// 监听分享弹窗显示状态
watch(shareScriptDialogVisible, visible => {
  if (visible) {
    updateRemainingTime()
  }
})

// 添加分组
const handleAddGroup = () => {
  newGroupName.value = ''
  addGroupDialogVisible.value = true
}

// 取消添加分组
const handleCancelAddGroup = () => {
  addGroupDialogVisible.value = false
  newGroupName.value = ''
}

// 确认添加分组
const handleConfirmAddGroup = () => {
  if (!newGroupName.value || !newGroupName.value.trim()) {
    ElMessage.warning('请输入分组名称')
    return
  }

  const trimmedName = newGroupName.value.trim()
  if (trimmedName.length > 20) {
    ElMessage.warning('分组名称不能超过20个字符')
    return
  }

  // 检查是否已存在同名分组
  const exists = quickReplyGroups.value.some(g => g.name === trimmedName)
  if (exists) {
    ElMessage.warning('分组名称已存在')
    return
  }

  // 添加新分组
  const newGroup = {
    id: Date.now(), // 临时ID，实际应该从后端获取
    name: trimmedName,
    icon: null,
    collapsed: false,
    items: []
  }

  quickReplyGroups.value.push(newGroup)
  ElMessage.success('添加分组成功')
  addGroupDialogVisible.value = false
  newGroupName.value = ''
}

// 判断是否可以上移分组（如果分组已经在"常用回复"下面，则不能上移）
const canMoveUpGroup = (groupId: number): boolean => {
  const index = quickReplyGroups.value.findIndex(g => g.id === groupId)
  // 如果索引 <= 0，说明是第一个分组（"常用回复"），不能上移
  // 如果索引 <= 1，说明紧跟在"常用回复"后面，也不能上移
  return index > 1
}

// 上移分组
const handleMoveUpGroup = (groupId: number) => {
  if (!canMoveUpGroup(groupId)) {
    ElMessage.warning('该分组已经在"常用回复"下面，无法继续上移')
    return
  }

  const index = quickReplyGroups.value.findIndex(g => g.id === groupId)
  if (index > 0) {
    // 交换当前分组和上一个分组的位置
    const temp = quickReplyGroups.value[index]
    quickReplyGroups.value[index] = quickReplyGroups.value[index - 1]
    quickReplyGroups.value[index - 1] = temp
    ElMessage.success('上移成功')
  }
}

// 下移分组
const handleMoveDownGroup = (groupId: number) => {
  const index = quickReplyGroups.value.findIndex(g => g.id === groupId)
  if (index === -1) {
    ElMessage.error('分组不存在')
    return
  }

  // 如果是最后一个分组，不能下移
  if (index === quickReplyGroups.value.length - 1) {
    ElMessage.warning('该分组已经是最后一个，无法下移')
    return
  }

  // 交换当前分组和下一个分组的位置
  const temp = quickReplyGroups.value[index]
  quickReplyGroups.value[index] = quickReplyGroups.value[index + 1]
  quickReplyGroups.value[index + 1] = temp
  ElMessage.success('下移成功')
}

// 在分组中添加内容
const handleAddToGroup = (groupId: number) => {
  const group = quickReplyGroups.value.find(g => g.id === groupId)
  // 如果点击的是"常用回复"分组，不设置currentGroupId（因为下拉框中不显示）
  if (group && group.name === '常用回复') {
    currentGroupId.value = null
  } else {
    currentGroupId.value = groupId
  }
  scriptContent.value = ''
  scriptImage.value = null
  addScriptDialogVisible.value = true
}

// 取消新增话术
const handleCancelAddScript = () => {
  addScriptDialogVisible.value = false
  scriptContent.value = ''
  scriptImage.value = null
  currentGroupId.value = null
}

// 确认新增话术
const handleConfirmAddScript = () => {
  if (!scriptContent.value || !scriptContent.value.trim()) {
    ElMessage.warning('请输入话术内容')
    return
  }

  if (!currentGroupId.value) {
    ElMessage.error('分组信息错误')
    return
  }

  const group = quickReplyGroups.value.find(g => g.id === currentGroupId.value)
  if (group) {
    const newScript = {
      id: Date.now(),
      content: scriptContent.value.trim(),
      image: scriptImage.value
    }
    group.items.push(newScript)
    ElMessage.success('添加话术成功')
    addScriptDialogVisible.value = false
    scriptContent.value = ''
    scriptImage.value = null
    currentGroupId.value = null
  }
}

// 触发图片上传
const triggerImageUpload = () => {
  imageInputRef.value?.click()
}

// 处理图片上传
const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    // 这里应该上传到服务器，暂时使用本地预览
    const reader = new FileReader()
    reader.onload = e => {
      scriptImage.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
  // 清空input，以便可以重复选择同一文件
  if (target) {
    target.value = ''
  }
}

// 移除图片
const handleRemoveImage = () => {
  scriptImage.value = null
}

// 获取当前分组名称
const getCurrentGroupName = () => {
  if (!currentGroupId.value) return ''
  const group = quickReplyGroups.value.find(g => g.id === currentGroupId.value)
  return group?.name || ''
}

// 编辑分组
const handleEditGroup = (groupId: number) => {
  const group = quickReplyGroups.value.find(g => g.id === groupId)
  if (group) {
    editingGroupId.value = groupId
    editGroupName.value = group.name
    editGroupDialogVisible.value = true
  }
}

// 取消编辑分组
const handleCancelEditGroup = () => {
  editGroupDialogVisible.value = false
  editGroupName.value = ''
  editingGroupId.value = null
}

// 确认编辑分组
const handleConfirmEditGroup = () => {
  if (!editGroupName.value || !editGroupName.value.trim()) {
    ElMessage.warning('请输入分组名称')
    return
  }

  const trimmedName = editGroupName.value.trim()
  if (trimmedName.length > 20) {
    ElMessage.warning('分组名称不能超过20个字符')
    return
  }

  if (!editingGroupId.value) {
    ElMessage.error('分组信息错误')
    return
  }

  // 检查是否已存在同名分组（排除当前编辑的分组）
  const exists = quickReplyGroups.value.some(g => g.name === trimmedName && g.id !== editingGroupId.value)
  if (exists) {
    ElMessage.warning('分组名称已存在')
    return
  }

  // 更新分组名称
  const group = quickReplyGroups.value.find(g => g.id === editingGroupId.value)
  if (group) {
    group.name = trimmedName
    ElMessage.success('编辑分组成功')
    editGroupDialogVisible.value = false
    editGroupName.value = ''
    editingGroupId.value = null
  }
}

// 删除分组
const handleDeleteGroup = (groupId: number) => {
  deletingGroupId.value = groupId
  deleteGroupDialogVisible.value = true
}

// 取消删除分组
const handleCancelDeleteGroup = () => {
  deleteGroupDialogVisible.value = false
  deletingGroupId.value = null
}

// 确认删除分组
const handleConfirmDeleteGroup = () => {
  if (!deletingGroupId.value) {
    ElMessage.error('分组信息错误')
    return
  }

  const index = quickReplyGroups.value.findIndex(g => g.id === deletingGroupId.value)
  if (index !== -1) {
    quickReplyGroups.value.splice(index, 1)
    ElMessage.success('删除成功')
    deleteGroupDialogVisible.value = false
    deletingGroupId.value = null
  }
}

// 选择快捷回复
const handleSelectQuickReply = (item: any) => {
  // 将快捷回复内容插入到消息输入框
  messageInput.value = item.content
  ElMessage.success('已选择快捷回复')
  // TODO: 实现快捷回复选择逻辑
}

// 复制话术
const handleCopyScript = (groupId: number, item: any) => {
  // 复制到剪贴板
  navigator.clipboard
    .writeText(item.content)
    .then(() => {
      ElMessage.success('已复制到剪贴板')
    })
    .catch(() => {
      // 降级方案
      const textarea = document.createElement('textarea')
      textarea.value = item.content
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      ElMessage.success('已复制到剪贴板')
    })

  // 关闭菜单
  const ref = getMoreActionsRef(groupId, item.id)
  ref.value = false
}

// 编辑话术
const handleEditScript = (groupId: number, item: any) => {
  editingScriptId.value = item.id
  editingScriptGroupId.value = groupId
  editScriptContent.value = item.content || ''
  editScriptImage.value = item.image || null
  editScriptDialogVisible.value = true

  // 关闭菜单
  const ref = getMoreActionsRef(groupId, item.id)
  ref.value = false
}

// 取消编辑话术
const handleCancelEditScript = () => {
  editScriptDialogVisible.value = false
  editScriptContent.value = ''
  editScriptImage.value = null
  editingScriptId.value = null
  editingScriptGroupId.value = null
}

// 确认编辑话术
const handleConfirmEditScript = () => {
  if (!editScriptContent.value || !editScriptContent.value.trim()) {
    ElMessage.warning('请输入话术内容')
    return
  }

  if (!editingScriptId.value || !editingScriptGroupId.value) {
    ElMessage.error('话术信息错误')
    return
  }

  const group = quickReplyGroups.value.find(g => g.id === editingScriptGroupId.value)
  if (group && group.items) {
    const item = group.items.find((i: any) => i.id === editingScriptId.value)
    if (item) {
      item.content = editScriptContent.value.trim()
      item.image = editScriptImage.value
      ElMessage.success('编辑话术成功')
      editScriptDialogVisible.value = false
      editScriptContent.value = ''
      editScriptImage.value = null
      editingScriptId.value = null
      editingScriptGroupId.value = null
    }
  }
}

// 触发编辑话术图片上传
const triggerEditImageUpload = () => {
  editImageInputRef.value?.click()
}

// 处理编辑话术图片上传
const handleEditImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    // 这里应该上传到服务器，暂时使用本地预览
    const reader = new FileReader()
    reader.onload = e => {
      editScriptImage.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
  // 清空input，以便可以重复选择同一文件
  if (target) {
    target.value = ''
  }
}

// 移除编辑话术图片
const handleRemoveEditImage = () => {
  editScriptImage.value = null
}

// 删除话术
const handleDeleteScript = (groupId: number, item: any) => {
  const group = quickReplyGroups.value.find(g => g.id === groupId)
  if (group && group.items) {
    const index = group.items.findIndex((i: any) => i.id === item.id)
    if (index !== -1) {
      group.items.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }

  // 关闭菜单
  const ref = getMoreActionsRef(groupId, item.id)
  ref.value = false
}

// 拖拽开始
const handleDragStart = (groupId: number | string, itemId: number | string, itemIndex: number, event: DragEvent) => {
  const groupIdNum = typeof groupId === 'string' ? Number(groupId) : groupId
  const itemIdNum = typeof itemId === 'string' ? Number(itemId) : itemId
  draggedItemId.value = itemIdNum
  draggedGroupId.value = groupIdNum
  draggedItemIndex.value = itemIndex

  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/html', itemIdNum.toString())
  }

  // 添加拖拽样式
  const target = event.target as HTMLElement
  const itemElement = target.closest('.group-item') as HTMLElement
  if (itemElement) {
    itemElement.style.opacity = '0.5'
  }
}

// 拖拽结束
const handleDragEnd = () => {
  // 移除所有拖拽样式
  const allItems = document.querySelectorAll('.group-item')
  allItems.forEach(item => {
    const el = item as HTMLElement
    el.style.opacity = '1'
    el.classList.remove('drag-over-top', 'drag-over-bottom')
  })

  draggedItemId.value = null
  draggedGroupId.value = null
  draggedItemIndex.value = -1
}

// 拖拽悬停
const handleDragOver = (event: DragEvent) => {
  event.preventDefault()

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }

  const target = event.target as HTMLElement
  const itemElement = target.closest('.group-item') as HTMLElement

  if (!itemElement || !draggedItemId.value) {
    return
  }

  // 移除所有拖拽指示线
  const allItems = itemElement.parentElement?.querySelectorAll('.group-item')
  if (allItems) {
    allItems.forEach(item => {
      item.classList.remove('drag-over-top', 'drag-over-bottom')
    })
  }

  // 添加插入指示线样式
  const rect = itemElement.getBoundingClientRect()
  const y = event.clientY - rect.top

  if (y < rect.height / 2) {
    itemElement.classList.add('drag-over-top')
  } else {
    itemElement.classList.add('drag-over-bottom')
  }
}

// 放置
const handleDrop = (groupId: number | string, dropIndex: number, event: DragEvent) => {
  const groupIdNum = typeof groupId === 'string' ? Number(groupId) : groupId
  event.preventDefault()
  event.stopPropagation()

  if (!draggedItemId.value || !draggedGroupId.value || draggedGroupId.value !== groupIdNum) {
    return
  }

  const group = quickReplyGroups.value.find(g => g.id === groupIdNum)
  if (!group || !group.items) {
    return
  }

  const sourceIndex = draggedItemIndex.value
  const target = event.target as HTMLElement
  const itemElement = target.closest('.group-item') as HTMLElement

  // 根据拖拽指示线确定目标位置
  let targetIndex = dropIndex
  if (itemElement) {
    if (itemElement.classList.contains('drag-over-top')) {
      targetIndex = dropIndex
    } else if (itemElement.classList.contains('drag-over-bottom')) {
      targetIndex = dropIndex + 1
    }
  }

  // 移除拖拽样式
  if (itemElement) {
    itemElement.classList.remove('drag-over-top', 'drag-over-bottom')
  }

  // 如果源索引和目标索引相同，不执行操作
  if (sourceIndex === targetIndex || (sourceIndex < targetIndex && targetIndex === sourceIndex + 1)) {
    return
  }

  // 重新排序
  const items = [...group.items]
  const [removed] = items.splice(sourceIndex, 1)

  // 调整目标索引（如果源索引在目标索引之前，目标索引需要减1）
  const adjustedTargetIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex
  items.splice(adjustedTargetIndex, 0, removed)

  group.items = items

  ElMessage.success('排序成功')

  // 重置拖拽状态
  draggedItemId.value = null
  draggedGroupId.value = null
  draggedItemIndex.value = -1
}
</script>

<style lang="scss" scoped>
// 待办消息界面
.todo-message-page {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  background-color: #ffffff;
  overflow: hidden;
  border-top: 1px solid #e4e7ed;

  .todo-page-header {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #e4e7ed;
    background-color: #ffffff;
    flex-shrink: 0;

    .header-left {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;

      .back-icon {
        font-size: 18px;
        color: #303133;
      }

      .header-title {
        font-size: 16px;
        font-weight: 500;
        color: #303133;
      }
    }
  }

  .todo-message-list {
    flex: 1;
    overflow-y: auto;
    padding: 16px;

    .todo-tag-group {
      margin-bottom: 24px;

      .tag-group-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;

        .tag-bookmark {
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tag-group-title {
          font-size: 14px;
          font-weight: 500;
          color: #303133;
        }
      }

      .tag-messages {
        .todo-message-item {
          display: flex;
          align-items: center;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: background-color 0.2s;

          &:hover {
            background-color: #f5f7fa;
          }

          &.selected {
            background-color: #f5f7fa;
          }

          .message-avatar {
            width: 40px;
            height: 40px;
            margin-right: 12px;
            flex-shrink: 0;

            .avatar-placeholder {
              width: 100%;
              height: 100%;
              border-radius: 4px;
              display: flex;
              align-items: center;
              justify-content: center;
              background-color: #fff9c4;
              color: #ffffff;

              .el-icon {
                font-size: 20px;
              }
            }
          }

          .message-info {
            flex: 1;
            min-width: 0;

            .message-header {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 4px;

              .message-name {
                font-size: 14px;
                color: #303133;
                font-weight: 400;
              }

              .message-badge {
                font-size: 12px;
                color: #909399;
                background-color: #f5f7fa;
                padding: 2px 6px;
                border-radius: 2px;
              }
            }

            .message-content {
              font-size: 14px;
              color: #606266;
              line-height: 1.5;
            }
          }

          .message-right {
            display: flex;
            flex-direction: column;
            align-items: center;
            flex-shrink: 0;
            margin-left: 12px;
            gap: 4px;

            .message-date {
              font-size: 12px;
              color: #909399;
            }

            .message-actions {
              opacity: 0;
              transition: opacity 0.2s;

              .more-dots {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 20px;
                height: 20px;
                cursor: pointer;
                border-radius: 4px;
                transition: background-color 0.2s;

                &:hover {
                  background-color: #f0f2f5;
                }

                svg .dot-circle {
                  transition: fill 0.2s;
                }

                &:hover svg .dot-circle {
                  fill: var(--el-color-primary);
                }
              }
            }
          }

          &:hover .message-right .message-actions {
            opacity: 1;
          }
        }
      }
    }
  }
}

.conversation-container.no-background-container {
  display: flex !important;
  flex-direction: row !important;
  height: 100%;
  width: 100%;
  background-color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
}

.conversation-container {
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;
  background-color: #ffffff;

  // 左侧边栏
  .sidebar {
    width: 25%;
    min-width: 300px;
    max-width: 400px;
    flex-shrink: 0;
    border-right: 1px solid #e4e7ed;
    display: flex;
    flex-direction: column;
    background-color: #ffffff;
    height: 100%;
    min-height: 0;
    overflow: hidden;

    .search-section {
      padding: 16px;
      border-bottom: 1px solid #e4e7ed;

      .search-input {
        :deep(.el-input__wrapper) {
          border-radius: 8px;
        }
      }
    }

    .tabs-section {
      display: flex;
      padding: 0 16px;
      border-bottom: 1px solid #e4e7ed;
      background-color: #fafafa;

      .tab-item {
        flex: 1;
        padding: 12px 0;
        text-align: center;
        font-size: 14px;
        color: #606266;
        cursor: pointer;
        position: relative;
        transition: color 0.3s;

        &:hover {
          color: var(--el-color-primary);
        }

        &.active {
          color: var(--el-color-primary);
          font-weight: 500;

          &::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 2px;
            background-color: var(--el-color-primary);
          }
        }
      }
    }

    .quick-actions-section {
      padding: 12px 16px;
      background-color: #ffffff;
      border-bottom: 1px solid #e4e7ed;

      .todo-message-card {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        background-color: #f5f7fa;
        border: none;
        border-radius: 4px;
        margin-bottom: 12px;
        cursor: pointer;
        transition: background-color 0.2s;

        &:hover {
          background-color: #ebeef5;
        }

        .todo-icon {
          width: 24px;
          height: 24px;
          margin-right: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .todo-text {
          flex: 1;
          font-size: 14px;
          color: #303133;
        }

        .todo-right {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;

          .todo-count {
            font-size: 14px;
            color: #303133;
          }

          .todo-arrow {
            width: 16px;
            height: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #909399;
          }
        }
      }

      .filter-buttons {
        display: flex;
        gap: 8px;

        .filter-btn {
          padding: 6px 12px;
          font-size: 12px;
          color: #606266;
          background-color: #f5f7fa;
          border: 1px solid #e4e7ed;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;

          &:hover {
            background-color: #ecf5ff;
            border-color: #409eff;
            color: #409eff;
          }
        }
      }
    }

    .conversation-list {
      flex: 1;
      overflow-y: auto;

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        padding: 40px 20px;

        .empty-icon {
          margin-bottom: 16px;
          opacity: 0.6;
        }

        .empty-text {
          font-size: 14px;
          color: #909399;
          margin: 0;
        }
      }

      .conversation-items {
        .conversation-item {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          cursor: pointer;
          transition: background-color 0.2s ease;
          border-bottom: 1px solid #f5f7fa;
          background-color: #ffffff;

          &:hover:not(.active) {
            background-color: #f5f7fa;
          }

          &.active {
            background-color: #f5f7fa;
          }

          .platform-icon {
            width: 40px;
            height: 40px;
            min-width: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            margin-right: 12px;
            flex-shrink: 0;

            .platform-name {
              font-size: 12px;
              font-weight: 500;
              color: #000000;
              line-height: 1;
            }
          }

          .conversation-content {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 4px;

            .conversation-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              position: relative;

              .conversation-name {
                font-size: 14px;
                font-weight: 400;
                color: #303133;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                flex: 1;
              }

              .header-right-info {
                display: flex;
                align-items: center;
                gap: 6px;
                flex-shrink: 0;

                .todo-badge {
                  display: inline-flex;
                  align-items: center;
                  justify-content: center;
                  width: 16px;
                  height: 16px;
                  flex-shrink: 0;

                  svg {
                    width: 16px;
                    height: 16px;
                    display: block;
                  }
                }

                .pin-badge {
                  display: inline-flex;
                  align-items: center;
                  justify-content: center;
                  width: 16px;
                  height: 16px;

                  .pin-icon-small {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 16px;
                    height: 16px;

                    :deep(svg) {
                      width: 12px;
                      height: 12px;
                    }

                    :deep(path) {
                      fill: var(--el-color-primary);
                    }
                  }
                }

                .conversation-time {
                  font-size: 12px;
                  color: #909399;
                  flex-shrink: 0;
                }
              }
            }

            .conversation-preview {
              display: flex;
              align-items: center;
              justify-content: space-between;
              font-size: 12px;
              color: #909399;
              line-height: 1.5;

              .preview-content-wrapper {
                flex: 1;
                display: flex;
                align-items: center;
                gap: 8px;
                overflow: hidden;
                min-width: 0;

                .message-status-tag {
                  flex-shrink: 0;
                  font-size: 12px;
                  padding: 2px 6px;
                  border-radius: 2px;
                  white-space: nowrap;
                  font-weight: 500;

                  &.urgent-tag {
                    color: #f56c6c;
                    background-color: #fef0f0;
                  }

                  &.unreplied-tag {
                    color: #e6a23c;
                    background-color: #fdf6ec;
                  }
                }

                .preview-text {
                  flex: 1;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                  min-width: 0;
                }
              }

              .more-dots {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                margin-left: 8px;
                opacity: 0;
                visibility: hidden;
                cursor: pointer;
                transition: opacity 0.2s;

                svg {
                  width: 16px;
                  height: 16px;

                  .dot-circle {
                    transition: fill 0.2s;
                  }
                }
              }
            }
          }

          &:hover {
            .conversation-preview .more-dots {
              opacity: 0.6;
              visibility: visible;

              svg .dot-circle {
                fill: var(--el-color-primary);
              }
            }
          }
        }
      }
    }
  }

  // 右侧内容区
  .content-area {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    background-color: #ffffff;
    height: 100%;
    min-height: 0;
    overflow: hidden;

    .empty-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;

      .empty-icon-large {
        margin-bottom: 24px;
        opacity: 0.6;
      }

      .empty-text-large {
        font-size: 16px;
        color: #909399;
        margin: 0;
      }
    }

    .conversation-detail {
      display: flex;
      height: 100%;

      // 左侧/中间：聊天对话框区域
      .chat-panel {
        flex: 1;
        display: flex;
        flex-direction: column;
        border-right: 1px solid #e4e7ed;
        background-color: #ffffff;

        // 顶部信息栏
        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 20px;
          border-bottom: 1px solid #e4e7ed;
          background-color: #ffffff;

          .header-left {
            display: flex;
            align-items: center;
            gap: 12px;

            .order-info {
              font-size: 14px;
              font-weight: 500;
              color: #303133;
            }

            .order-tag {
              font-size: 12px;
              color: #ffffff;
              background-color: #ff9800;
              padding: 2px 8px;
              border-radius: 2px;
            }

            .add-note {
              display: flex;
              align-items: center;
              gap: 4px;
              font-size: 12px;
              color: #606266;
              cursor: pointer;

              &:hover {
                color: var(--el-color-primary);
              }
            }
          }

          .header-right {
            display: flex;
            align-items: center;
            gap: 8px;

            .todo-btn {
              padding: 4px 12px;
              border: 1px solid #dcdfe6;
              background-color: #ffffff;
              border-radius: 4px;
              color: #606266;

              &:hover {
                border-color: #c0c4cc;
                background-color: #f5f7fa;
              }

              :deep(.el-button__inner) {
                display: flex !important;
                align-items: center;
                gap: 5px !important;
              }

              svg {
                width: 16px;
                height: 16px;
                flex-shrink: 0;
                margin: 0 !important;
                margin-right: 5px !important;

                path {
                  transition: fill 0.2s;
                }
              }

              :deep(span) {
                margin-left: 0 !important;
              }
            }

            .pin-btn {
              padding: 4px 8px;
              border: 1px solid #dcdfe6;
              background-color: #ffffff;
              border-radius: 4px;
              color: #606266;
              min-width: 32px;

              &:hover {
                border-color: #c0c4cc;
                background-color: #f5f7fa;
              }

              .pin-icon {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 16px;
                height: 16px;

                :deep(svg) {
                  width: 16px;
                  height: 16px;
                }
              }
            }
          }
        }

        // 聊天消息区域
        .chat-section {
          flex: 1;
          overflow-y: auto;
          padding: 16px 20px;
          background-color: #ffffff;

          .chat-messages {
            .chat-message {
              display: flex;
              margin-bottom: 12px;
              gap: 12px;
              align-items: flex-start;
              width: 100%;

              .message-avatar {
                width: 40px;
                height: 40px;
                flex-shrink: 0;

                .avatar-placeholder {
                  width: 100%;
                  height: 100%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  background-color: #f0f0f0;
                  color: #909399;

                  &.user-avatar {
                    background-color: #fff9c4;
                    color: #ffffff;
                    border-radius: 4px;
                  }

                  &.store-avatar {
                    background-color: #f0f0f0;
                    color: #909399;
                    border-radius: 4px;
                  }

                  .el-icon {
                    font-size: 20px;
                  }
                }
              }

              .message-content {
                flex: 1;
                min-width: 0;
              }

              &.user-message {
                .message-name {
                  font-size: 12px;
                  color: #909399;
                  margin-bottom: 4px;
                }

                .message-bubble {
                  display: inline-block;
                  padding: 8px 12px;
                  border-radius: 4px;
                  font-size: 16px;
                  color: #303133;
                  background-color: #ffffff;
                  max-width: 70%;
                  word-wrap: break-word;
                }

                .message-time {
                  font-size: 12px;
                  color: #909399;
                  margin-top: 4px;
                }
              }

              &.store-message {
                justify-content: flex-end;

                .message-content {
                  display: flex;
                  flex-direction: column;
                  align-items: flex-end;
                  max-width: calc(100% - 52px);
                  min-width: 0;
                }

                .message-avatar {
                  flex-shrink: 0;
                  order: 1;
                }

                .message-header-row {
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  margin-bottom: 8px;
                  justify-content: flex-end;
                  height: auto;

                  .store-name {
                    font-size: 14px;
                    color: #303133;
                    font-weight: 400;
                    line-height: 14px;
                    height: 14px;
                    display: flex;
                    align-items: center;
                  }

                  .message-time {
                    font-size: 12px;
                    color: #909399;
                    line-height: 14px;
                    height: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  }
                }

                .message-time {
                  font-size: 12px;
                  color: #909399;
                  margin-bottom: 8px;
                  text-align: right;
                }

                .message-content-row {
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  margin-bottom: 0;
                  justify-content: flex-end;

                  .message-status {
                    font-size: 12px;
                    color: #909399;
                    flex-shrink: 0;
                    order: -1;
                  }

                  .message-bubble {
                    display: inline-block;
                    padding: 8px 12px;
                    border-radius: 4px;
                    font-size: 16px;
                    color: #303133;
                    background-color: #fffbe6;
                    max-width: 100%;
                    word-wrap: break-word;
                    text-align: left;
                  }
                }
              }
            }
          }
        }

        // 输入区域
        .chat-input-area {
          border-top: 1px solid #e4e7ed;
          background-color: #ffffff;
          padding: 12px 20px;

          .input-toolbar {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;

            .toolbar-btn {
              padding: 4px 8px;
              color: #606266;
              min-height: auto;
              height: auto;

              &:hover {
                color: var(--el-color-primary);
                background-color: transparent;
              }

              .el-icon {
                font-size: 18px;
              }

              &.emoji-btn {
                padding: 4px;

                .emoji {
                  font-size: 18px;
                  line-height: 1;
                }
              }
            }

            .toolbar-divider {
              width: 1px;
              height: 16px;
              background-color: #e4e7ed;
              margin: 0 4px;
            }
          }

          .input-wrapper {
            position: relative;

            .message-textarea {
              :deep(.el-textarea__inner) {
                border-radius: 4px;
                resize: none;
                border: 1px solid #dcdfe6;
                padding: 12px;
                font-size: 14px;
                line-height: 1.5;
                background-color: #ffffff;

                &:focus {
                  border-color: var(--el-color-primary);
                }

                &::placeholder {
                  color: #c0c4cc;
                }
              }
            }

            // 输入联想下拉列表样式
            .autocomplete-dropdown {
              position: absolute;
              bottom: 100%;
              left: 0;
              right: 0;
              margin-bottom: 4px;
              background-color: #ffffff;
              border: 1px solid #dcdfe6;
              border-radius: 4px;
              box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
              max-height: 300px;
              overflow-y: auto;
              z-index: 1000;

              .autocomplete-item {
                padding: 10px 12px;
                cursor: pointer;
                border-bottom: 1px solid #f5f7fa;
                transition: background-color 0.2s;

                &:last-child {
                  border-bottom: none;
                }

                &:hover,
                &.active {
                  background-color: #f5f7fa;
                }

                .autocomplete-group-name {
                  font-size: 12px;
                  color: #909399;
                  margin-bottom: 4px;
                }

                .autocomplete-content {
                  font-size: 14px;
                  color: #303133;
                  line-height: 1.5;
                  word-break: break-word;

                  :deep(.keyword-highlight) {
                    color: #409eff;
                    font-weight: 500;
                    background-color: rgba(64, 158, 255, 0.1);
                    padding: 0 2px;
                    border-radius: 2px;
                  }
                }
              }
            }

            .input-footer {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-top: 8px;

              .input-tip {
                font-size: 12px;
                color: #c0c4cc;
              }

              .send-btn {
                padding: 8px 24px;
                background-color: #f5f7fa;
                border-color: #dcdfe6;
                color: #606266;

                &:hover {
                  background-color: #e4e7ed;
                  border-color: #c0c4cc;
                  color: #303133;
                }

                &:active {
                  background-color: #dcdfe6;
                }
              }
            }
          }
        }
      }

      // 右侧：订单详情区域
      .order-detail-panel {
        width: 480px;
        min-width: 480px;
        display: flex;
        flex-direction: column;
        background-color: #f5f7fa;
        border-left: 1px solid #e4e7ed;

        // 顶部标签页
        .detail-tabs {
          display: flex;
          gap: 28px;
          padding: 0 20px 6px 20px;
          border-bottom: 1px solid #e4e7ed;
          background-color: #ffffff;
          flex-shrink: 0;

          .detail-tab-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 4px;
            padding: 8px 12px;
            font-size: 12px;
            color: #606266;
            cursor: pointer;
            position: relative;
            transition: all 0.3s ease-in-out;
            border-radius: 4px;
            width: 100%;
            flex: 1;

            .tab-icon {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              width: 20px;
              height: 20px;
              flex-shrink: 0;
              transition: all 0.3s ease-in-out;

              :deep(svg) {
                width: 20px;
                height: 20px;
                transition: all 0.3s ease-in-out;
              }

              :deep(path) {
                transition: fill 0.3s ease-in-out;
              }
            }

            &:hover {
              color: var(--el-color-primary);
              background-color: var(--el-color-primary-light-9);

              .tab-icon {
                :deep(path) {
                  fill: var(--el-color-primary);
                }
              }
            }

            &.active {
              color: #ffffff;
              font-weight: 500;
              background-color: var(--el-color-primary);

              .tab-icon {
                :deep(path) {
                  fill: #ffffff;
                }
              }
            }
          }
        }

        // 快捷回复区域
        .quick-reply-section {
          display: flex;
          flex-direction: column;
          height: 100%;
          background-color: #ffffff;

          .quick-reply-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px 20px 16px 20px;
            border-bottom: 1px solid #e4e7ed;

            .header-left {
              flex: 1;

              .title {
                font-size: 16px;
                font-weight: 500;
                color: #303133;
                margin-bottom: 8px;
              }

              .description {
                font-size: 12px;
                color: #909399;
                line-height: 1.5;
              }
            }

            .header-right {
              flex-shrink: 0;
              margin-left: 16px;
            }
          }

          .quick-reply-tabs {
            display: flex;
            padding: 0 20px;
            border-bottom: 1px solid #e4e7ed;
            background-color: #ffffff;
            margin-bottom: 6px;

            .quick-reply-tab {
              padding: 12px 16px;
              font-size: 14px;
              color: #606266;
              cursor: pointer;
              position: relative;
              transition: color 0.3s;

              &:hover {
                color: #303133;
              }

              &.active {
                color: var(--el-color-primary);
                font-weight: 500;

                &::after {
                  content: '';
                  position: absolute;
                  bottom: 0;
                  left: 0;
                  right: 0;
                  height: 2px;
                  background-color: var(--el-color-primary);
                }
              }
            }
          }

          .quick-reply-toolbar {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 7px 5px 5px 5px;
            border-bottom: 1px solid #e4e7ed;

            .search-input {
              flex: 1;
            }

            .toolbar-actions {
              display: flex;
              align-items: center;
              flex-shrink: 0;

              .import-export-btn {
                display: flex;
                align-items: center;
                gap: 4px;
              }

              .add-group-btn {
                display: flex;
                align-items: center;
                gap: 4px;
              }
            }
          }

          .quick-reply-toolbar-old {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px 20px;
            border-bottom: 1px solid #e4e7ed;

            .search-input {
              flex: 1;
            }

            .add-group-btn {
              flex-shrink: 0;
            }
          }

          .quick-reply-groups {
            flex: 1;
            overflow-y: auto;
            padding: 0 5px 5px 5px;

            .quick-reply-group {
              margin-top: 12px;
              border: 1px solid #e4e7ed;
              border-radius: 4px;
              background-color: #ffffff;

              .group-header {
                display: flex;
                align-items: center;
                padding: 12px 16px;
                cursor: pointer;
                user-select: none;
                transition: background-color 0.2s;

                &:hover {
                  background-color: #f5f7fa;
                }

                .collapse-icon {
                  width: 16px;
                  height: 16px;
                  margin-right: 8px;
                  color: #909399;
                  transition: transform 0.3s;

                  &.collapsed {
                    transform: rotate(-90deg);
                  }
                }

                .group-icon {
                  width: 16px;
                  height: 16px;
                  margin-right: 8px;
                  display: flex;
                  align-items: center;
                  justify-content: center;

                  svg {
                    width: 16px;
                    height: 16px;
                  }
                }

                .group-name {
                  flex: 1;
                  font-size: 14px;
                  color: #303133;
                }

                .group-actions {
                  display: flex;
                  align-items: center;
                  gap: 8px;

                  .action-icon {
                    width: 16px;
                    height: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: opacity 0.2s;

                    &:hover:not(.disabled) {
                      opacity: 0.7;
                    }

                    &.disabled {
                      cursor: not-allowed;
                      opacity: 0.4;

                      svg path {
                        fill: #c0c4cc !important;
                      }
                    }

                    svg {
                      width: 16px;
                      height: 16px;
                      display: block;

                      path,
                      line,
                      rect {
                        transition: stroke 0.2s;
                      }
                    }

                    &:hover:not(.disabled) svg path,
                    &:hover:not(.disabled) svg line,
                    &:hover:not(.disabled) svg rect {
                      stroke: #606266;
                    }
                  }
                }
              }

              .group-content {
                border-top: 1px solid #e4e7ed;
                padding: 12px 16px;

                .group-items {
                  display: flex;
                  flex-direction: column;
                  gap: 0;

                  .group-item {
                    display: flex;
                    align-items: center;
                    padding: 12px 16px;
                    background-color: #ffffff;
                    border-bottom: 1px solid #f5f7fa;
                    transition:
                      background-color 0.2s,
                      opacity 0.2s;
                    position: relative;

                    &:hover {
                      background-color: #f5f7fa;
                    }

                    &:last-child {
                      border-bottom: none;
                    }

                    &.dragging {
                      opacity: 0.5;
                      cursor: grabbing;
                    }

                    &.drag-over-top {
                      border-top: 2px solid var(--el-color-primary);

                      &::before {
                        content: '';
                        position: absolute;
                        top: -1px;
                        left: 0;
                        right: 0;
                        height: 2px;
                        background-color: var(--el-color-primary);
                      }
                    }

                    &.drag-over-bottom {
                      border-bottom: 2px solid var(--el-color-primary);

                      &::after {
                        content: '';
                        position: absolute;
                        bottom: -1px;
                        left: 0;
                        right: 0;
                        height: 2px;
                        background-color: var(--el-color-primary);
                      }
                    }

                    .item-drag-icon {
                      flex-shrink: 0;
                      width: 20px;
                      height: 20px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      margin-right: 12px;
                      cursor: grab;

                      &:active {
                        cursor: grabbing;
                      }

                      svg {
                        width: 16px;
                        height: 16px;
                      }
                    }

                    .item-content {
                      flex: 1;
                      font-size: 14px;
                      color: #303133;
                      cursor: pointer;
                      line-height: 1.5;
                      word-break: break-word;
                    }

                    .item-actions {
                      flex-shrink: 0;
                      display: flex;
                      align-items: center;
                      gap: 8px;
                      margin-left: 12px;

                      .item-action-icon {
                        width: 20px;
                        height: 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        transition: opacity 0.2s;

                        &:hover {
                          opacity: 0.7;
                        }

                        svg {
                          width: 16px;
                          height: 16px;
                        }
                      }
                    }
                  }
                }

                .empty-group {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  padding: 40px 20px;
                  min-height: 200px;

                  .empty-icon {
                    width: 120px;
                    height: 120px;
                    margin-bottom: 16px;
                    opacity: 0.6;
                    display: flex;
                    align-items: center;
                    justify-content: center;

                    svg {
                      width: 100%;
                      height: 100%;
                    }
                  }

                  .empty-text {
                    font-size: 14px;
                    color: #909399;
                    line-height: 1.5;
                  }
                }
              }
            }
          }
        }

        // 商品列表页面
        .product-list-page {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
          position: relative;

          .product-page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px;
            border-bottom: 1px solid #e4e7ed;
            flex-shrink: 0;

            .product-page-title {
              position: relative;
              font-size: 16px;
              font-weight: 500;
              color: #303133;

              .title-underline {
                position: absolute;
                bottom: -16px;
                left: 0;
                width: 100%;
                height: 2px;
                background-color: #ffc107;
              }
            }

            .product-page-actions {
              display: flex;
              align-items: center;

              .cancel-batch-btn {
                display: flex;
                align-items: center;
                gap: 4px;
                color: #606266;

                &:hover {
                  color: #409eff;
                }
              }
            }
          }

          .batch-send-bar {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background-color: #409eff;
            padding: 12px 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);

            .batch-send-btn {
              background-color: #409eff;
              border-color: #409eff;
              color: #ffffff;
              font-weight: 500;
              padding: 10px 24px;

              &:hover {
                background-color: #66b1ff;
                border-color: #66b1ff;
              }

              &:active {
                background-color: #3a8ee6;
                border-color: #3a8ee6;
              }
            }
          }

          .product-search-bar {
            padding: 12px 20px;
            border-bottom: 1px solid #e4e7ed;
            flex-shrink: 0;

            .product-search-input {
              width: 100%;
            }
          }

          .product-list-content {
            display: flex;
            flex: 1;
            overflow: hidden;

            &.has-batch-bar {
              padding-bottom: 60px; // 为底部批量发送栏留出空间
            }

            .product-categories {
              width: 90px;
              border-right: 1px solid #e4e7ed;
              background-color: #ffffff;
              overflow-y: auto;
              flex-shrink: 0;

              .categories-title {
                padding: 12px 12px;
                font-size: 14px;
                font-weight: 500;
                color: #303133;
                border-bottom: 1px solid #e4e7ed;
              }

              .categories-list {
                .category-item {
                  padding: 12px;
                  font-size: 14px;
                  color: #606266;
                  cursor: pointer;
                  transition: background-color 0.2s;
                  border-bottom: 1px solid #f5f7fa;
                  line-height: 1.5;
                  word-break: break-all;
                  word-wrap: break-word;
                  // 限制每行最多4个汉字（8个字符），最多2行（8个汉字）
                  max-width: 100%;
                  display: -webkit-box;
                  -webkit-line-clamp: 2;
                  line-clamp: 2;
                  -webkit-box-orient: vertical;
                  overflow: hidden;
                  text-overflow: ellipsis;

                  &:hover {
                    background-color: #f5f7fa;
                  }

                  &.active {
                    background-color: #ecf5ff;
                    color: #409eff;
                    font-weight: 500;
                    position: relative;

                    &::before {
                      content: '';
                      position: absolute;
                      left: 0;
                      top: 0;
                      bottom: 0;
                      width: 3px;
                      background-color: #ffc107;
                    }
                  }
                }
              }
            }

            .product-cards-container {
              flex: 1;
              overflow-y: auto;
              background-color: #f5f7fa;
              padding: 16px;

              .product-cards-list {
                display: flex;
                flex-direction: column;
                gap: 12px;

                .product-card {
                  background-color: #ffffff;
                  border-radius: 8px;
                  overflow: hidden;
                  display: flex;
                  padding: 12px;
                  gap: 12px;
                  transition: box-shadow 0.2s;
                  position: relative;
                  align-items: flex-start;

                  &:hover {
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                  }

                  .product-checkbox {
                    flex-shrink: 0;
                    margin-top: 4px;
                    z-index: 10;
                  }

                  .product-card-image {
                    position: relative;
                    width: 120px;
                    height: 120px;
                    flex-shrink: 0;
                    border-radius: 4px;
                    overflow: hidden;
                    background-color: #f5f7fa;

                    img {
                      width: 100%;
                      height: 100%;
                      object-fit: cover;
                    }

                    .product-image-tags {
                      position: absolute;
                      top: 0;
                      left: 0;
                      right: 0;
                      bottom: 0;
                      display: flex;
                      flex-direction: column;
                      justify-content: flex-start;
                      align-items: flex-start;
                      padding: 4px;
                      pointer-events: none;

                      .image-tag {
                        font-size: 11px;
                        color: #ffffff;
                        background-color: rgba(0, 0, 0, 0.5);
                        padding: 2px 6px;
                        border-radius: 2px;
                        margin-bottom: 4px;
                        white-space: nowrap;
                      }
                    }
                  }

                  .product-card-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;

                    .product-card-title {
                      font-size: 14px;
                      color: #303133;
                      line-height: 1.5;
                      margin-bottom: 8px;
                      // 使用 flexbox 布局确保两行宽度一致
                      display: -webkit-box;
                      -webkit-line-clamp: 2;
                      line-clamp: 2;
                      -webkit-box-orient: vertical;
                      overflow: hidden;
                      text-overflow: ellipsis;
                      // 确保两行宽度对齐：使用 word-break 控制换行
                      word-break: break-word;
                      word-wrap: break-word;
                      // 确保容器宽度固定，让两行宽度一致
                      width: 100%;
                      max-width: 100%;
                      // 移除 letter-spacing 确保字符宽度一致
                      letter-spacing: normal;
                      // 使用 justify 让文本两端对齐，填满整行宽度
                      text-align: justify;
                      // 最后一行左对齐（避免最后一行也两端对齐）
                      text-align-last: left;
                      // 确保文本填满容器宽度
                      box-sizing: border-box;
                    }

                    .product-card-info {
                      font-size: 12px;
                      color: #909399;
                      margin-bottom: 8px;

                      .divider {
                        margin: 0 8px;
                      }
                    }

                    .product-card-footer {
                      display: flex;
                      justify-content: space-between;
                      align-items: center;

                      .product-card-price {
                        font-size: 16px;
                        font-weight: 500;
                        color: #f56c6c;
                      }

                      .product-send-btn {
                        background-color: #409eff;
                        border-color: #409eff;
                        color: #ffffff;

                        &:hover {
                          background-color: #66b1ff;
                          border-color: #66b1ff;
                        }

                        &:active {
                          background-color: #3a8ee6;
                          border-color: #3a8ee6;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }

        // 提示条
        .order-tip-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 20px;
          background-color: #f5f7fa;
          border-bottom: 1px solid #e4e7ed;
          flex-shrink: 0;

          .tip-text {
            font-size: 12px;
            color: #909399;
          }

          .refresh-btn {
            padding: 0;
            font-size: 12px;
          }
        }

        .order-detail-section {
          overflow-y: auto;
          padding: 16px 20px 0 20px;
          background-color: #ffffff;
          border: 1px solid #e4e7ed;
          border-radius: 4px;
          margin: 8px 6px;

          .order-content {
            display: flex;
            flex-direction: column;

            .order-status {
              font-size: 16px;
              color: #303133;
              margin-bottom: 16px;
              font-weight: 600;
            }

            .order-info {
              margin-bottom: 16px;

              .info-row {
                display: flex;
                align-items: center;
                font-size: 13px;
                color: #606266;
                margin-bottom: 8px;
                line-height: 1.5;

                .info-label {
                  color: #909399;
                  margin-right: 4px;
                }

                .info-value {
                  color: #303133;
                  flex: 1;

                  .highlight-orange {
                    color: #ff9800;
                  }
                }

                .copy-icon {
                  margin-left: 4px;
                  font-size: 14px;
                  color: #909399;
                  cursor: pointer;

                  &:hover {
                    color: var(--el-color-primary);
                  }
                }
              }
            }

            .customer-info {
              padding: 12px;
              background-color: #f5f7fa;
              border-radius: 4px;
              margin-bottom: 16px;

              .customer-name {
                font-size: 14px;
                color: #303133;
                margin-bottom: 8px;

                .phone-tail {
                  font-size: 13px;
                  color: #606266;
                  margin-left: 4px;
                }
              }

              .customer-address {
                font-size: 13px;
                color: #606266;
                display: flex;
                align-items: center;
                gap: 4px;

                .arrow-icon {
                  font-size: 12px;
                  color: #c0c4cc;
                }
              }
            }

            .product-list {
              .product-list-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 13px;
                color: #606266;
                margin-bottom: 12px;
                font-weight: 500;
              }

              .product-items {
                margin-bottom: 12px;

                .product-item {
                  display: flex;
                  gap: 12px;
                  padding: 12px 0;
                  border-bottom: 1px solid #f5f7fa;

                  &:last-child {
                    border-bottom: none;
                  }

                  .product-image {
                    width: 60px;
                    height: 60px;
                    flex-shrink: 0;
                    border-radius: 4px;
                    overflow: hidden;
                    background-color: #f5f7fa;

                    img {
                      width: 100%;
                      height: 100%;
                      object-fit: cover;
                    }
                  }

                  .product-content {
                    flex: 1;
                    min-width: 0;
                    display: flex;
                    justify-content: space-between;
                    gap: 12px;

                    .product-info {
                      flex: 1;
                      min-width: 0;

                      .product-name-row {
                        margin-bottom: 4px;

                        .product-name {
                          font-size: 13px;
                          color: #303133;
                          line-height: 1.4;
                        }
                      }

                      .product-desc {
                        font-size: 12px;
                        color: #909399;
                        margin-bottom: 2px;
                      }

                      .product-weight {
                        font-size: 12px;
                        color: #909399;
                      }
                    }

                    .product-price-quantity {
                      flex-shrink: 0;
                      text-align: right;

                      .product-price {
                        font-size: 14px;
                        color: #303133;
                        font-weight: 500;
                        margin-bottom: 4px;
                      }

                      .product-quantity {
                        font-size: 12px;
                        color: #909399;
                      }
                    }
                  }
                }
              }

              .product-total {
                display: flex;
                justify-content: space-between;
                padding-top: 12px;
                border-top: 1px solid #e4e7ed;
                font-size: 14px;
                color: #303133;
                font-weight: 500;

                .total-amount {
                  font-size: 16px;
                  font-weight: 600;
                  color: #f56c6c;
                }
              }
            }

            // 操作按钮区域
            .action-buttons {
              display: flex;
              gap: 12px;
              margin-top: 16px;
              padding: 16px 0 6px 0;
              justify-content: flex-end;

              .view-detail-btn {
                border-color: #dcdfe6;
                color: #606266;
              }

              .send-btn {
                background-color: var(--el-color-primary);
                border-color: var(--el-color-primary);
                color: #ffffff;
              }
            }
          }
        }

        // 底部提示
        .bottom-tip {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 16px 0;
          margin: 0 6px;

          .tip-line {
            flex: 1;
            height: 1px;
            background-color: #dcdfe6;
            max-width: 100px;
          }

          .tip-text {
            font-size: 12px;
            color: #909399;
            white-space: nowrap;
          }
        }
      }
    }
  }
}

// 待办弹窗样式（全局样式，因为 el-popover 是 append-to-body 的）
:deep(.todo-popover) {
  padding: 12px !important;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

  .todo-popover-content {
    width: 100%;

    .todo-options {
      display: grid !important;
      grid-template-columns: repeat(2, 1fr) !important;
      grid-template-rows: repeat(2, auto) !important;
      row-gap: 12px !important;
      column-gap: 16px !important;
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;

      .todo-option {
        display: flex !important;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        padding: 4px 8px !important;
        margin: 0 !important;
        border: none !important;
        background: none !important;
        border-radius: 4px;
        transition: background-color 0.2s;
        width: 100% !important;
        min-width: 0;

        &:hover {
          background-color: #f5f7fa !important;
        }

        .todo-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          flex-shrink: 0;
          margin: 0;
          padding: 0;

          svg {
            width: 16px;
            height: 16px;
            display: block;
          }
        }

        .todo-text {
          font-size: 14px;
          color: #303133;
          line-height: 1.5;
          margin: 0;
          padding: 0;
        }
      }
    }

    .todo-tip {
      font-size: 12px;
      color: #c0c4cc;
      line-height: 1.5;
      margin: 12px 0 0 0;
      padding: 12px 0 0 0;
      border-top: 1px solid #e4e7ed;
      white-space: nowrap;
    }
  }
}
</style>

// 全局样式，确保弹窗样式生效（Element Plus popover 是 append-to-body 的，需要全局样式）
<style lang="scss">
// 覆盖全局 no-background-container 的 flex-direction，确保会话页面使用水平布局
section > .conversation-container.no-background-container,
.conversation-container.no-background-container {
  flex-direction: row !important;
  display: flex !important;
}

.todo-popover {
  padding: 12px !important;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  min-width: 300px !important;
  max-width: 320px !important;

  .todo-popover-content {
    width: 100%;

    .todo-options {
      display: grid !important;
      grid-template-columns: repeat(2, 1fr) !important;
      grid-template-rows: repeat(2, auto) !important;
      row-gap: 12px !important;
      column-gap: 16px !important;
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;

      .todo-option {
        display: flex !important;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        padding: 4px 8px !important;
        margin: 0 !important;
        border: none !important;
        background: none !important;
        border-radius: 4px;
        transition: background-color 0.2s;
        width: 100% !important;
        min-width: 0;

        &:hover {
          background-color: #f5f7fa !important;
        }

        .todo-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          flex-shrink: 0;
          margin: 0;
          padding: 0;

          svg {
            width: 16px;
            height: 16px;
            display: block;
          }
        }

        .todo-text {
          font-size: 14px;
          color: #303133;
          line-height: 1.5;
          margin: 0;
          padding: 0;
        }
      }
    }

    .todo-tip {
      font-size: 12px;
      color: #c0c4cc;
      line-height: 1.5;
      margin: 12px 0 0 0;
      padding: 12px 0 0 0;
      border-top: 1px solid #e4e7ed;
      white-space: nowrap;
    }
  }
}
</style>

<style lang="scss">
// 演示模式模糊样式（全局样式，不使用 scoped）
.demo-mode-blur {
  filter: blur(4px) !important;
  user-select: none !important;
  pointer-events: none !important;
  opacity: 0.6 !important;
}
</style>

<style lang="scss">
// 待办消息菜单弹窗样式
:global(.todo-message-menu-popover) {
  padding: 8px 0 !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1) !important;
  border: none !important;

  .todo-message-menu-content {
    display: flex;
    flex-direction: column;
    gap: 0;

    .menu-item {
      display: flex !important;
      align-items: center !important;
      gap: 0 !important;
      padding: 10px 16px;
      cursor: pointer;
      transition: background-color 0.2s;
      color: #2c2c2c;
      font-size: 14px;
      line-height: 1.5;

      &:hover {
        background-color: #f5f7fa;
      }

      .menu-text {
        color: #2c2c2c;
      }
    }
  }
}

// 消息菜单弹窗样式
:global(.message-menu-popover) {
  padding: 8px 0 !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1) !important;
  border: none !important;

  .message-menu-content {
    display: flex;
    flex-direction: column;
    gap: 0;

    .menu-item {
      display: flex !important;
      align-items: center !important;
      gap: 0 !important;
      padding: 10px 16px;
      cursor: pointer;
      transition: background-color 0.2s;
      color: #2c2c2c;
      font-size: 14px;
      line-height: 1.5;

      &:hover {
        background-color: #f5f7fa;
      }

      .menu-icon {
        display: flex !important;
        align-items: center;
        justify-content: center;
        width: 16px !important;
        height: 16px !important;
        flex-shrink: 0 !important;
        margin-right: 5px !important;
        margin-left: 0 !important;
        margin-top: 0 !important;
        margin-bottom: 0 !important;

        svg {
          width: 16px;
          height: 16px;
          display: block;
        }
      }

      .menu-text {
        flex: 1;
        line-height: 1.5;
        margin-left: 0 !important;
        margin-right: 0 !important;
      }
    }

    .menu-divider {
      height: 1px !important;
      background-color: #e4e7ed !important;
      margin: 12px 0 !important;
      padding: 0 !important;
      width: 100% !important;
      flex-shrink: 0 !important;
    }
  }
}
</style>

<style lang="scss">
// 待办菜单弹窗样式
:global(.todo-menu-popover) {
  padding: 8px 0 !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1) !important;
  border: none !important;
  min-width: 120px !important;
  max-width: 120px !important;

  * {
    box-sizing: border-box !important;
  }

  .todo-menu-content {
    display: flex !important;
    flex-direction: column !important;
    gap: 0 !important;
    width: 100% !important;
    min-width: 0 !important;

    .todo-menu-item {
      display: inline-flex !important;
      align-items: center !important;
      flex-direction: row !important;
      flex-wrap: nowrap !important;
      gap: 8px !important;
      padding: 10px 12px !important;
      cursor: pointer;
      transition: background-color 0.2s;
      color: #2c2c2c;
      font-size: 14px;
      line-height: 1.5;
      white-space: nowrap !important;
      width: 100% !important;
      min-width: 0 !important;
      box-sizing: border-box !important;
      overflow: hidden !important;

      &:hover {
        background-color: #f5f7fa;
      }

      .todo-menu-icon {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        width: 16px !important;
        height: 16px !important;
        min-width: 16px !important;
        max-width: 16px !important;
        flex-shrink: 0 !important;
        flex-grow: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        vertical-align: middle !important;

        svg {
          width: 16px !important;
          height: 16px !important;
          display: block !important;
          flex-shrink: 0 !important;
        }
      }

      .todo-menu-text {
        display: inline-block !important;
        line-height: 1.5;
        white-space: nowrap !important;
        overflow: visible !important;
        text-overflow: clip !important;
        margin: 0 !important;
        padding: 0 !important;
        vertical-align: middle !important;
        flex-shrink: 0 !important;
      }
    }
  }
}
</style>

// 新建话术分组对话框样式（全局样式）
<style lang="scss">
.add-group-dialog {
  .el-dialog__header {
    padding: 20px 20px 16px 20px;
    border-bottom: none;

    .el-dialog__title {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
    }

    .el-dialog__headerbtn {
      top: 20px;
      right: 20px;
      width: 20px;
      height: 20px;

      .el-dialog__close {
        color: #909399;
        font-size: 16px;

        &:hover {
          color: #606266;
        }
      }
    }
  }

  .el-dialog__body {
    padding: 20px;

    .dialog-content {
      .group-name-input {
        :deep(.el-input__wrapper) {
          border: 1px solid #dcdfe6;
          border-radius: 4px;
          box-shadow: none;

          &:hover {
            border-color: #c0c4cc;
          }

          &.is-focus {
            border-color: var(--el-color-primary);
          }
        }

        :deep(.el-input__inner) {
          font-size: 14px;
          color: #303133;

          &::placeholder {
            color: #c0c4cc;
          }
        }

        :deep(.el-input__count) {
          color: #c0c4cc;
          font-size: 12px;
          right: 12px;
        }
      }
    }
  }

  .el-dialog__footer {
    padding: 16px 20px 20px 20px;
    border-top: none;

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;

      .el-button {
        min-width: 80px;
        padding: 8px 20px;
        font-size: 14px;
        border-radius: 4px;
      }

      .confirm-btn {
        background-color: #ffc107;
        border-color: #ffc107;
        color: #303133;

        &:hover {
          background-color: #ffd54f;
          border-color: #ffd54f;
        }

        &:active {
          background-color: #ffb300;
          border-color: #ffb300;
        }

        &:focus {
          background-color: #ffc107;
          border-color: #ffc107;
          color: #303133;
        }
      }
    }
  }
}

// 编辑话术分组对话框样式（全局样式）
.edit-group-dialog {
  .el-dialog__header {
    padding: 20px 20px 16px 20px;
    border-bottom: none;

    .el-dialog__title {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
    }

    .el-dialog__headerbtn {
      top: 20px;
      right: 20px;
      width: 20px;
      height: 20px;

      .el-dialog__close {
        color: #909399;
        font-size: 16px;

        &:hover {
          color: #606266;
        }
      }
    }
  }

  .el-dialog__body {
    padding: 20px;

    .dialog-content {
      .group-name-input {
        :deep(.el-input__wrapper) {
          border: 1px solid #dcdfe6;
          border-radius: 4px;
          box-shadow: none;

          &:hover {
            border-color: #c0c4cc;
          }

          &.is-focus {
            border-color: var(--el-color-primary);
          }
        }

        :deep(.el-input__inner) {
          font-size: 14px;
          color: #303133;

          &::placeholder {
            color: #c0c4cc;
          }
        }

        :deep(.el-input__count) {
          color: #c0c4cc;
          font-size: 12px;
          right: 12px;
        }
      }
    }
  }

  .el-dialog__footer {
    padding: 16px 20px 20px 20px;
    border-top: none;

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;

      .el-button {
        min-width: 80px;
        padding: 8px 20px;
        font-size: 14px;
        border-radius: 4px;
      }

      .confirm-btn {
        background-color: var(--el-color-primary);
        border-color: var(--el-color-primary);
        color: #fff;

        &:hover {
          background-color: var(--el-color-primary-light-3);
          border-color: var(--el-color-primary-light-3);
        }

        &:active {
          background-color: var(--el-color-primary-dark-2);
          border-color: var(--el-color-primary-dark-2);
        }

        &:focus {
          background-color: var(--el-color-primary);
          border-color: var(--el-color-primary);
          color: #fff;
        }
      }
    }
  }
}

// 新增话术对话框样式（全局样式）
.add-script-dialog {
  .el-dialog__header {
    padding: 20px 20px 16px 20px;
    border-bottom: none;

    .el-dialog__title {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
    }

    .el-dialog__headerbtn {
      top: 20px;
      right: 20px;
      width: 20px;
      height: 20px;

      .el-dialog__close {
        color: #909399;
        font-size: 16px;

        &:hover {
          color: #606266;
        }
      }
    }
  }

  .el-dialog__body {
    padding: 20px;

    .dialog-content {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .script-content-wrapper {
        .script-content-input {
          :deep(.el-textarea__inner) {
            border: 1px solid #dcdfe6;
            border-radius: 4px;
            box-shadow: none;
            font-size: 14px;
            color: #303133;
            padding: 12px;
            min-height: 100px;
            resize: none;

            &::placeholder {
              color: #c0c4cc;
            }

            &:hover {
              border-color: #c0c4cc;
            }

            &:focus {
              border-color: var(--el-color-primary);
            }
          }

          :deep(.el-input__count) {
            color: #c0c4cc;
            font-size: 12px;
            bottom: 8px;
            right: 12px;
          }
        }
      }

      .group-select-wrapper {
        .group-select {
          width: 100%;

          :deep(.el-input__wrapper) {
            border: 1px solid #dcdfe6;
            border-radius: 4px;
            box-shadow: none;

            &:hover {
              border-color: #c0c4cc;
            }

            &.is-focus {
              border-color: var(--el-color-primary);
            }
          }

          :deep(.el-input__inner) {
            font-size: 14px;
            color: #303133;

            &::placeholder {
              color: #c0c4cc;
            }
          }

          :deep(.el-select__caret) {
            color: #909399;
          }
        }
      }

      .image-upload-wrapper {
        .image-upload-area {
          width: 100%;
          height: 120px;
          border: 1px dashed #dcdfe6;
          border-radius: 4px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          background-color: #fafafa;

          &:hover {
            border-color: #c0c4cc;
            background-color: #f5f7fa;
          }

          .upload-icon {
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            justify-content: center;

            svg {
              width: 24px;
              height: 24px;
            }
          }

          .upload-text {
            font-size: 14px;
            color: #909399;
          }
        }

        .image-preview {
          position: relative;
          width: 100%;
          height: 120px;
          border-radius: 4px;
          overflow: hidden;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .image-remove {
            position: absolute;
            top: 8px;
            right: 8px;
            width: 24px;
            height: 24px;
            background-color: rgba(0, 0, 0, 0.5);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: background-color 0.2s;

            &:hover {
              background-color: rgba(0, 0, 0, 0.7);
            }

            .el-icon {
              color: #fff;
              font-size: 14px;
            }
          }
        }
      }
    }
  }

  .el-dialog__footer {
    padding: 16px 20px 20px 20px;
    border-top: none;

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;

      .el-button {
        min-width: 80px;
        padding: 8px 20px;
        font-size: 14px;
        border-radius: 4px;
      }

      .confirm-btn {
        background-color: var(--el-color-primary);
        border-color: var(--el-color-primary);
        color: #fff;

        &:hover {
          background-color: var(--el-color-primary-light-3);
          border-color: var(--el-color-primary-light-3);
        }

        &:active {
          background-color: var(--el-color-primary-dark-2);
          border-color: var(--el-color-primary-dark-2);
        }

        &:focus {
          background-color: var(--el-color-primary);
          border-color: var(--el-color-primary);
          color: #fff;
        }
      }
    }
  }
}

// 编辑话术对话框样式（全局样式）
.edit-script-dialog {
  .el-dialog__header {
    padding: 20px 20px 16px 20px;
    border-bottom: none;

    .el-dialog__title {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
    }

    .el-dialog__headerbtn {
      top: 20px;
      right: 20px;
      width: 20px;
      height: 20px;

      .el-dialog__close {
        color: #909399;
        font-size: 16px;

        &:hover {
          color: #606266;
        }
      }
    }
  }

  .el-dialog__body {
    padding: 20px;

    .dialog-content {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .script-content-wrapper {
        .script-content-input {
          :deep(.el-textarea__inner) {
            border: 1px solid #dcdfe6;
            border-radius: 4px;
            box-shadow: none;
            font-size: 14px;
            color: #303133;
            padding: 12px;
            min-height: 100px;
            resize: none;

            &::placeholder {
              color: #c0c4cc;
            }

            &:hover {
              border-color: #c0c4cc;
            }

            &:focus {
              border-color: var(--el-color-primary);
            }
          }

          :deep(.el-input__count) {
            color: #c0c4cc;
            font-size: 12px;
            bottom: 8px;
            right: 12px;
          }
        }
      }

      .group-select-wrapper {
        .group-select {
          width: 100%;

          :deep(.el-input__wrapper) {
            border: 1px solid #dcdfe6;
            border-radius: 4px;
            box-shadow: none;

            &:hover {
              border-color: #c0c4cc;
            }

            &.is-focus {
              border-color: var(--el-color-primary);
            }
          }

          :deep(.el-input__inner) {
            font-size: 14px;
            color: #303133;

            &::placeholder {
              color: #c0c4cc;
            }
          }

          :deep(.el-select__caret) {
            color: #909399;
          }
        }
      }

      .image-upload-wrapper {
        .image-upload-area {
          width: 100%;
          height: 120px;
          border: 1px dashed #dcdfe6;
          border-radius: 4px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          background-color: #fafafa;

          &:hover {
            border-color: #c0c4cc;
            background-color: #f5f7fa;
          }

          .upload-icon {
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            justify-content: center;

            svg {
              width: 24px;
              height: 24px;
            }
          }

          .upload-text {
            font-size: 14px;
            color: #909399;
          }
        }

        .image-preview {
          position: relative;
          width: 100%;
          height: 120px;
          border-radius: 4px;
          overflow: hidden;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .image-remove {
            position: absolute;
            top: 8px;
            right: 8px;
            width: 24px;
            height: 24px;
            background-color: rgba(0, 0, 0, 0.5);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: background-color 0.2s;

            &:hover {
              background-color: rgba(0, 0, 0, 0.7);
            }

            .el-icon {
              color: #fff;
              font-size: 14px;
            }
          }
        }
      }
    }
  }

  .el-dialog__footer {
    padding: 16px 20px 20px 20px;
    border-top: none;

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;

      .el-button {
        min-width: 80px;
        padding: 8px 20px;
        font-size: 14px;
        border-radius: 4px;
      }

      .confirm-btn {
        background-color: var(--el-color-primary);
        border-color: var(--el-color-primary);
        color: #fff;

        &:hover {
          background-color: var(--el-color-primary-light-3);
          border-color: var(--el-color-primary-light-3);
        }

        &:active {
          background-color: var(--el-color-primary-dark-2);
          border-color: var(--el-color-primary-dark-2);
        }

        &:focus {
          background-color: var(--el-color-primary);
          border-color: var(--el-color-primary);
          color: #fff;
        }
      }
    }
  }
}

// 删除分组对话框样式（全局样式）
.delete-group-dialog {
  .el-dialog__header {
    padding: 20px 20px 16px 20px;
    border-bottom: none;

    .el-dialog__title {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
    }

    .el-dialog__headerbtn {
      top: 20px;
      right: 20px;
      width: 20px;
      height: 20px;

      .el-dialog__close {
        color: #909399;
        font-size: 16px;

        &:hover {
          color: #606266;
        }
      }
    }
  }

  .el-dialog__body {
    padding: 20px;

    .dialog-content {
      .delete-warning {
        display: flex;
        align-items: flex-start;
        gap: 12px;

        .warning-icon {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;

          svg {
            width: 24px;
            height: 24px;
          }
        }

        .warning-text {
          flex: 1;
          font-size: 14px;
          color: #303133;
          line-height: 1.5;
        }
      }
    }
  }

  .el-dialog__footer {
    padding: 16px 20px 20px 20px;
    border-top: none;

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;

      .el-button {
        min-width: 80px;
        padding: 8px 20px;
        font-size: 14px;
        border-radius: 4px;
      }

      .confirm-btn {
        background-color: var(--el-color-primary);
        border-color: var(--el-color-primary);
        color: #fff;

        &:hover {
          background-color: var(--el-color-primary-light-3);
          border-color: var(--el-color-primary-light-3);
        }

        &:active {
          background-color: var(--el-color-primary-dark-2);
          border-color: var(--el-color-primary-dark-2);
        }

        &:focus {
          background-color: var(--el-color-primary);
          border-color: var(--el-color-primary);
          color: #fff;
        }
      }
    }
  }
}

// 更多操作菜单样式（全局样式，因为 el-popover 是 append-to-body 的）
.more-actions-popover {
  padding: 4px 0 !important;
  border-radius: 4px !important;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1) !important;
  border: none !important;

  .more-actions-menu {
    .menu-item {
      padding: 8px 16px;
      font-size: 14px;
      color: #303133;
      cursor: pointer;
      transition: background-color 0.2s;
      line-height: 1.5;

      &:hover {
        background-color: #f5f7fa;
      }

      &:active {
        background-color: #e4e7ed;
      }

      span {
        display: block;
      }
    }
  }
}

// 导入话术对话框样式
.import-script-dialog {
  .el-dialog__header {
    padding: 20px 20px 16px 20px;
    border-bottom: none;

    .el-dialog__title {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
    }

    .el-dialog__headerbtn {
      top: 20px;
      right: 20px;
      width: 20px;
      height: 20px;

      .el-dialog__close {
        color: #909399;
        font-size: 16px;

        &:hover {
          color: #606266;
        }
      }
    }
  }

  .el-dialog__body {
    padding: 20px;

    .dialog-content {
      .import-code-wrapper {
        .import-label {
          font-size: 14px;
          color: #606266;
          margin-bottom: 12px;
        }

        .import-code-input {
          margin-bottom: 16px;
          .el-input__inner {
            font-size: 18px;
            font-weight: 500;
            text-align: center;
            letter-spacing: 8px;
          }
        }

        .import-tips {
          margin-top: 16px;
          padding: 12px;
          background-color: #f5f7fa;
          border-radius: 4px;
          border-left: 3px solid #409eff;

          .tips-title {
            font-size: 13px;
            font-weight: 500;
            color: #303133;
            margin-bottom: 8px;
          }

          .tips-content {
            font-size: 12px;
            color: #606266;
            line-height: 1.6;

            p {
              margin: 4px 0;
              padding: 0;
            }
          }
        }
      }
    }
  }

  .el-dialog__footer {
    padding: 16px 20px 20px 20px;
    border-top: none;

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
  }
}

// 分享话术对话框样式
.share-script-dialog {
  .el-dialog__header {
    padding: 20px 20px 16px 20px;
    border-bottom: none;

    .el-dialog__title {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
    }

    .el-dialog__headerbtn {
      top: 20px;
      right: 20px;
      width: 20px;
      height: 20px;

      .el-dialog__close {
        color: #909399;
        font-size: 16px;

        &:hover {
          color: #606266;
        }
      }
    }
  }

  .el-dialog__body {
    padding: 20px;

    .dialog-content {
      .share-code-wrapper {
        .share-label {
          font-size: 14px;
          color: #606266;
          margin-bottom: 12px;
        }

        .share-code-display {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;

          .share-code-text {
            flex: 1;
            font-size: 24px;
            font-weight: 600;
            color: #303133;
            text-align: center;
            letter-spacing: 8px;
            padding: 12px;
            background-color: #f5f7fa;
            border-radius: 4px;
            border: 1px solid #e4e7ed;
          }

          .copy-btn {
            flex-shrink: 0;
            display: flex;
            align-items: center;
            gap: 4px;
          }
        }

        .share-expiry {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 8px;
          background-color: #f0f9ff;
          border-radius: 4px;
          margin-bottom: 16px;

          .expiry-label {
            font-size: 14px;
            color: #606266;
          }

          .expiry-time {
            font-size: 16px;
            font-weight: 600;
            color: #409eff;
          }
        }

        .share-tips {
          margin-top: 16px;
          padding: 12px;
          background-color: #f5f7fa;
          border-radius: 4px;
          border-left: 3px solid #409eff;

          .tips-title {
            font-size: 13px;
            font-weight: 500;
            color: #303133;
            margin-bottom: 8px;
          }

          .tips-content {
            font-size: 12px;
            color: #606266;
            line-height: 1.6;

            p {
              margin: 4px 0;
              padding: 0;
            }
          }
        }
      }
    }
  }

  .el-dialog__footer {
    padding: 16px 20px 20px 20px;
    border-top: none;

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
  }
}
</style>

<style lang="scss">
// 演示模式模糊样式（全局样式，不使用 scoped）
.demo-mode-blur {
  filter: blur(4px) !important;
  user-select: none !important;
  pointer-events: none !important;
  opacity: 0.6 !important;
}
</style>
