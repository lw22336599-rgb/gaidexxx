<template>
  <div class="customer-service-chat">
    <div class="customer-service-content">
      <!-- 左侧面板：会话列表 -->
      <div class="conversation-panel">
        <!-- 顶部标题栏 -->
        <div v-if="!isCustomerService" class="panel-header">
          <span class="header-title">{{ translate('客服系统') }}</span>
          <div class="header-actions">
            <el-tooltip content="开启IM客服功能后,您将自动获得客服角色并连接到客服系统" placement="bottom">
              <el-switch
                v-model="imServiceEnabled"
                :loading="enableImServiceLoading"
                active-text="开启IM客服"
                @change="handleEnableImService"
              />
            </el-tooltip>
          </div>
        </div>

        <!-- 会话标签 -->
        <div class="conversation-tabs">
          <template v-if="!batchMode">
            <div class="tab-item" :class="{ active: activeTab === 'unreplied' }" @click="activeTab = 'unreplied'">
              {{ translate('接待中') }} ({{ conversationList.length }})
            </div>
            <div class="tab-item" :class="{ active: activeTab === 'all' }" @click="activeTab = 'all'">
              {{ translate('全部') }}
            </div>
          </template>
          <template v-else>
            <div class="batch-mode-header">
              <el-button text @click="toggleSelectAll">
                {{ selectedSessions.size === conversationList.length ? translate('取消全选') : translate('全选') }}
              </el-button>
              <span class="selected-count">
                {{ translate('已选择') }} {{ selectedSessions.size }} {{ translate('个会话') }}
              </span>
              <el-button text @click="exitBatchMode">
                <el-icon>
                  <Close />
                </el-icon>
                {{ translate('取消') }}
              </el-button>
            </div>
          </template>
        </div>

        <!-- 会话列表 -->
        <div
          ref="conversationListRef"
          v-loading="sessionListLoading"
          class="conversation-list"
          @scroll="handleConversationListScroll"
        >
          <div
            v-for="session in conversationList"
            :key="session.id"
            class="conversation-item"
            :class="{
              active: activeConversation?.id === session.id,
              selected: selectedSessions.has(session.id),
              'batch-mode': batchMode
            }"
            @click="handleConversationClick(session)"
            @contextmenu="handleContextMenu($event, session)"
            @mousedown="e => handleLongPressStart(e, session)"
            @mouseup="handleLongPressEnd"
            @mouseleave="handleLongPressEnd"
            @touchstart="e => handleLongPressStart(e, session)"
            @touchend="handleLongPressEnd"
            @touchcancel="handleLongPressEnd"
          >
            <!-- 批量模式复选框 -->
            <div v-if="batchMode" class="conversation-checkbox">
              <el-checkbox
                :model-value="selectedSessions.has(session.id)"
                @click.stop="toggleSessionSelection(session.id)"
              />
            </div>

            <div class="conversation-avatar">
              <img
                v-if="session.shop_img"
                :src="session.shop_img"
                :alt="session.shop_name || translate('未知店铺')"
                class="shop-avatar"
                @error="e => handleShopImageError(e, session)"
              />
              <img
                v-else-if="getPlatformIcon(session.site_type)"
                :src="getPlatformIcon(session.site_type)!"
                :alt="getPlatformName(session.site_type)"
                class="platform-icon"
                @error="e => ((e.target as HTMLImageElement).style.display = 'none')"
              />
              <div v-else class="avatar-placeholder">
                <el-icon>
                  <User />
                </el-icon>
              </div>
              <div v-if="session.unread_count > 0" class="unread-dot">{{ session.unread_count }}</div>
            </div>
            <div class="conversation-content">
              <div class="conversation-top">
                <div class="shop-name">{{ session.customer_name || translate('未知客户') }}</div>
                <div class="platform-info">
                  <PlatformIcon :shop-type="session.site_type" :size="16" />
                  <el-tag size="small" class="platform-tag">
                    {{ session.shop_name || translate('未知店铺') }}
                  </el-tag>
                </div>
              </div>
              <div class="conversation-bottom">
                <div class="last-message">{{ session.last_message || translate('暂无消息') }}</div>
                <div class="conversation-time">{{ formatTime(session.last_message_time) }}</div>
              </div>
            </div>
          </div>
          <div v-if="conversationList.length === 0 && !sessionListLoading" class="empty-list">
            <el-empty :description="translate('暂无会话')" />
          </div>
          <!-- 加载更多提示 -->
          <div v-if="loadingMoreSessions" class="loading-more-sessions">
            <el-icon class="is-loading">
              <Loading />
            </el-icon>
            <span>{{ translate('加载更多会话...') }}</span>
          </div>
          <div v-else-if="!hasMoreSessions && conversationList.length > 0" class="no-more-sessions">
            {{ translate('没有更多会话了') }}
          </div>
        </div>

        <!-- 批量操作按钮栏 -->
        <div v-if="batchMode" class="batch-action-bar">
          <el-button
            type="danger"
            :disabled="selectedSessions.size === 0"
            :loading="batchCloseLoading"
            @click="handleBatchClose"
          >
            <el-icon>
              <CircleClose />
            </el-icon>
            {{ translate('批量关闭') }}
          </el-button>
          <el-button
            type="primary"
            :disabled="selectedSessions.size === 0"
            :loading="batchTransferLoading"
            @click="handleBatchTransfer"
          >
            <el-icon>
              <Switch />
            </el-icon>
            {{ translate('批量转交') }}
          </el-button>
        </div>
      </div>

      <!-- 右侧面板：空白状态或聊天窗口 -->
      <template v-if="!activeConversation">
        <div class="empty-right-panel">
          <el-empty :description="translate('请选择会话开始聊天')" />
        </div>
      </template>
      <template v-else>
        <!-- 聊天窗口 -->
        <div class="chat-panel">
          <!-- 聊天头部 -->
          <div class="chat-header">
            <div class="customer-info">
              <img
                v-if="getPlatformIcon(activeConversation.site_type)"
                :src="getPlatformIcon(activeConversation.site_type)!"
                :alt="getPlatformName(activeConversation.site_type)"
                class="platform-icon-header"
              />
              <div class="header-text">
                <span class="customer-name">{{
                  activeConversation.customer_name || activeConversation.customer_id || translate('未知客户')
                }}</span>
                <span class="shop-name-small">{{ shopConversationTitle }}</span>
              </div>
            </div>
            <el-button link class="detail-toggle-btn" @click="showCustomerDetail = !showCustomerDetail">
              <el-icon :size="20">
                <DArrowRight v-if="!showCustomerDetail" />
                <DArrowLeft v-else />
              </el-icon>
            </el-button>
          </div>

          <!-- 消息区域 -->
          <div ref="messagesRef" v-loading="messagesLoading" class="messages-container" @scroll="handleMessagesScroll">
            <div class="messages-list">
              <!-- 加载更多提示 -->
              <div v-if="loadingMoreMessages" class="loading-more-tip">
                <el-icon class="is-loading">
                  <Loading />
                </el-icon>
                <span>{{ translate('加载更多消息...') }}</span>
              </div>
              <!-- 没有更多消息提示 -->
              <div v-else-if="!hasMoreMessages && activeSessionMessages.length > 0" class="no-more-tip">
                {{ translate('没有更多消息了') }}
              </div>

              <div
                v-for="message in activeSessionMessages"
                :key="message.id"
                class="message-item"
                :class="message.direction === 1 ? 'customer' : 'agent'"
              >
                <div class="message-avatar">
                  <img
                    v-if="activeConversation && getPlatformIcon(activeConversation.site_type)"
                    :src="getPlatformIcon(activeConversation.site_type)!"
                    :alt="getPlatformName(activeConversation.site_type)"
                    class="platform-icon"
                  />
                  <div v-else class="avatar-placeholder">
                    <el-icon>
                      <User />
                    </el-icon>
                  </div>
                </div>
                <div class="message-content">
                  <div v-if="message.direction === 1" class="message-header">
                    {{ customerConversationTitle }}
                  </div>
                  <div class="message-bubble" :class="message.direction === 1 ? 'customer' : 'agent'">
                    <!-- 文本消息 -->
                    <template v-if="message.msg_type === ImMsgType.Text">
                      {{ message.content }}
                    </template>

                    <!-- 图片消息 -->
                    <template v-else-if="message.msg_type === ImMsgType.Image">
                      <div v-if="getMediaUrl(message)" class="media-image">
                        <el-image
                          :src="getMediaUrl(message)"
                          :preview-src-list="[getMediaUrl(message)]"
                          :hide-on-click-modal="true"
                          fit="cover"
                          lazy
                        >
                          <template #error>
                            <div class="image-error">
                              <el-icon>
                                <Picture />
                              </el-icon>
                              <span>{{ translate('图片加载失败') }}</span>
                            </div>
                          </template>
                        </el-image>
                      </div>
                      <div v-else class="image-error-placeholder">
                        <el-icon>
                          <Picture />
                        </el-icon>
                        <span>{{ translate('图片URL无效') }}</span>
                        <div v-if="message.content" class="error-detail">{{ message.content }}</div>
                      </div>
                    </template>

                    <!-- 视频消息 -->
                    <template v-else-if="message.msg_type === ImMsgType.Video">
                      <div v-if="getMediaUrl(message)" class="media-video">
                        <video
                          :src="getMediaUrl(message)"
                          :poster="getVideoThumbnail(message)"
                          controls
                          preload="metadata"
                        >
                          {{ translate('您的浏览器不支持视频播放') }}
                        </video>
                      </div>
                      <div v-else class="media-error-placeholder">
                        <el-icon>
                          <VideoPlay />
                        </el-icon>
                        <span>{{ translate('视频URL无效') }}</span>
                      </div>
                    </template>

                    <!-- 语音消息 -->
                    <template v-else-if="message.msg_type === ImMsgType.Voice">
                      <div
                        v-if="getMediaUrl(message)"
                        class="media-audio"
                        :class="{ playing: currentPlayingAudioId === 'audio-' + message.id }"
                      >
                        <el-icon class="audio-icon">
                          <Headset />
                        </el-icon>
                        <div class="audio-content">
                          <div class="audio-text">
                            <template v-if="loadingAudioId === 'audio-' + message.id">
                              {{ translate('加载中...') }}
                            </template>
                            <template v-else-if="currentPlayingAudioId === 'audio-' + message.id">
                              {{ translate('正在播放...') }}
                            </template>
                            <template v-else>
                              {{ translate('语音消息') }}
                            </template>
                          </div>
                          <div class="audio-actions">
                            <el-button
                              v-if="currentPlayingAudioId === 'audio-' + message.id"
                              size="small"
                              type="danger"
                              @click.stop="playAudio(message)"
                            >
                              {{ translate('停止') }}
                            </el-button>
                            <el-button
                              v-else
                              size="small"
                              type="primary"
                              :icon="VideoPlay"
                              :loading="loadingAudioId === 'audio-' + message.id"
                              @click.stop="playAudio(message)"
                            >
                              {{ translate('播放') }}
                            </el-button>
                            <el-button size="small" :icon="Download" @click.stop="downloadFile(message)">
                              {{ translate('下载') }}
                            </el-button>
                          </div>
                        </div>
                      </div>
                      <div v-else class="media-error-placeholder">
                        <el-icon>
                          <Headset />
                        </el-icon>
                        <span>{{ translate('语音URL无效') }}</span>
                      </div>
                    </template>

                    <!-- 文件消息 -->
                    <template v-else-if="message.msg_type === ImMsgType.File">
                      <div v-if="getMediaUrl(message)" class="media-file" @click="downloadFile(message)">
                        <el-icon class="file-icon">
                          <Document />
                        </el-icon>
                        <div class="file-info">
                          <div class="file-name">{{ getFileName(message) }}</div>
                          <div class="file-action">
                            <el-icon>
                              <Download />
                            </el-icon>
                            {{ translate('下载') }}
                          </div>
                        </div>
                      </div>
                      <div v-else class="media-error-placeholder">
                        <el-icon>
                          <Document />
                        </el-icon>
                        <span>{{ translate('文件URL无效') }}</span>
                      </div>
                    </template>

                    <!-- 订单卡片消息 -->
                    <template v-else-if="message.msg_type === ImMsgType.OrderCard">
                      <div class="order-card">
                        <el-icon class="order-icon">
                          <ShoppingCart />
                        </el-icon>
                        <div class="order-content">
                          {{ message.content }}
                        </div>
                      </div>
                    </template>

                    <!-- 未知类型消息 -->
                    <template v-else>
                      <div class="unknown-message">
                        {{ message.content || translate('不支持的消息类型') }}
                      </div>
                    </template>
                  </div>
                  <div class="message-time">{{ formatTime(message.sent_at) }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 输入区域 -->
          <div ref="inputAreaRef" class="input-area" :style="{ height: `${inputAreaHeight}px` }">
            <div class="input-resize-handle" @mousedown="handleInputResizeMouseDown" />
            <!-- 工具栏 -->
            <div class="input-toolbar">
              <div class="toolbar-left">
                <!-- Emoji 表情 -->
                <el-popover placement="top-start" :width="320" trigger="click">
                  <template #reference>
                    <el-button link class="toolbar-btn emoji-btn">
                      <span class="emoji-icon">😀</span>
                    </el-button>
                  </template>
                  <div class="emoji-picker">
                    <div v-for="emoji in emojiList" :key="emoji" class="emoji-item" @click="insertEmoji(emoji)">
                      {{ emoji }}
                    </div>
                  </div>
                </el-popover>

                <!-- 图片上传 -->
                <div class="toolbar-btn upload-trigger" @click="triggerImageUpload">
                  <el-icon v-if="!uploadingImage" :size="18">
                    <Picture />
                  </el-icon>
                  <el-icon v-else class="is-loading" :size="18">
                    <Loading />
                  </el-icon>
                </div>

                <!-- 视频上传 -->
                <div class="toolbar-btn upload-trigger" @click="triggerVideoUpload">
                  <el-icon v-if="!uploadingVideo" :size="18">
                    <VideoCamera />
                  </el-icon>
                  <el-icon v-else class="is-loading" :size="18">
                    <Loading />
                  </el-icon>
                </div>

                <!-- 录音 -->
                <el-button link class="toolbar-btn" :class="{ recording: isRecording }" @click="toggleRecording">
                  <el-icon :size="18">
                    <Microphone />
                  </el-icon>
                </el-button>
              </div>

              <!-- 发送按钮 -->
              <el-button type="primary" size="small" :disabled="!inputMessage.trim()" @click="sendMessage">
                <el-icon>
                  <Position />
                </el-icon>
                {{ translate('发送') }}
              </el-button>
            </div>

            <!-- 录音提示 -->
            <div v-if="isRecording" class="recording-indicator">
              <div class="recording-dot" />
              <span>{{ translate('正在录音...') }} {{ recordingTime }}s</span>
              <el-button size="small" type="danger" @click="stopRecording">
                {{ translate('停止录音') }}
              </el-button>
            </div>

            <!-- 输入框 -->
            <div ref="inputWrapperRef" class="input-wrapper">
              <el-input
                ref="inputTextareaRef"
                v-model="inputMessage"
                type="textarea"
                class="input-textarea"
                :placeholder="translate('点击输入 (Shift + Enter换行、Enter发送，Ctrl+V粘贴截图)')"
                :rows="3"
                @keydown.enter="handleEnterKey"
                @paste="handlePaste"
                @input="handleMessageInput"
                @keydown.down.prevent="handleAutocompleteKeyDown"
                @keydown.up.prevent="handleAutocompleteKeyUp"
              />
            </div>
          </div>
        </div>

        <!-- 输入联想下拉列表 - 使用 teleport 传送到 body -->
        <teleport to="body">
          <div
            v-if="quickReplyAutoComplete && autocompleteVisible && autocompleteMatches.length > 0"
            class="autocomplete-dropdown-overlay"
            :style="autocompletePosition"
          >
            <div
              v-for="(match, index) in autocompleteMatches"
              :key="match.id"
              :class="['autocomplete-item', { active: autocompleteSelectedIndex === index }]"
              @click="handleSelectAutocomplete(match)"
              @mouseenter="autocompleteSelectedIndex = index"
            >
              <div class="item-left">
                <span v-if="match.shortcut" class="item-shortcut">{{ match.shortcut }}</span>
                <span v-if="match.shortcut" class="item-separator">-</span>
                <span class="item-content" v-html="highlightKeyword(match.content, inputMessage.trim())" />
              </div>
              <div class="item-right">
                <span class="item-type">{{ match.type === 1 ? translate('个人话术') : translate('团队话术') }}</span>
                <span v-if="match.group_name" class="item-separator">-</span>
                <span v-if="match.group_name" class="item-group">{{ match.group_name }}</span>
              </div>
            </div>
          </div>
        </teleport>

        <!-- 最右侧面板：顾客详情和快捷回复 -->
        <div v-show="showCustomerDetail && activeConversation" class="customer-detail-panel">
          <!-- 标签页切换 -->
          <div class="detail-tabs">
            <div
              :class="['detail-tab-item', { active: activeDetailTab === 'customer' }]"
              @click="activeDetailTab = 'customer'"
            >
              {{ translate('顾客详情') }}
            </div>
            <div
              :class="['detail-tab-item', { active: activeDetailTab === 'quick-reply' }]"
              @click="activeDetailTab = 'quick-reply'"
            >
              {{ translate('快捷回复') }}
            </div>
          </div>

          <!-- 顾客详情内容 -->
          <div v-if="activeDetailTab === 'customer'" class="customer-detail-content">
            <!-- 标签 -->
            <div class="detail-section">
              <div class="section-title">{{ translate('标签') }}</div>
              <div class="tags-container">
                <el-tag
                  v-for="(tag, index) in customerTags"
                  :key="index"
                  size="small"
                  closable
                  class="customer-tag"
                  @close="handleTagClose(tag)"
                >
                  {{ tag }}
                </el-tag>
                <el-input
                  v-if="showTagInput"
                  ref="tagInputRef"
                  v-model="newTagInput"
                  size="small"
                  class="tag-input"
                  maxlength="10"
                  @blur="handleTagInputConfirm"
                  @keyup.enter="handleTagInputConfirm"
                />
                <el-button v-else size="small" type="primary" text @click="handleAddTag">
                  <el-icon>
                    <Plus />
                  </el-icon>
                  {{ translate('添加标签') }}
                </el-button>
              </div>
            </div>

            <!-- 备注 -->
            <div class="detail-section">
              <div class="section-title">{{ translate('备注') }}</div>
              <div class="remarks-container">
                <el-input
                  v-model="customerRemarks"
                  type="textarea"
                  :rows="4"
                  :placeholder="translate('请输入备注信息')"
                  resize="none"
                  maxlength="500"
                  show-word-limit
                />
                <el-button
                  type="primary"
                  size="small"
                  style="margin-top: 8px; width: 100%"
                  :loading="savingRemarks"
                  @click="handleSaveRemarks"
                >
                  {{ translate('保存备注') }}
                </el-button>
              </div>
            </div>

            <!-- 订单信息 -->
            <div v-if="activeConversation?.order_info" class="detail-section order-info-section">
              <div class="section-title">{{ translate('订单信息') }}</div>
              <div class="order-info-container">
                <!-- 订单基本信息 -->
                <div class="info-group">
                  <div class="info-row">
                    <span class="info-label">{{ translate('订单号') }}:</span>
                    <span class="info-value">{{ activeConversation.order_info.SiteOrderId }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">{{ translate('状态') }}:</span>
                    <span class="info-value status">{{ activeConversation.order_info.StatusDesc }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">{{ translate('下单时间') }}:</span>
                    <span class="info-value">{{ activeConversation.order_info.OrderTimeFmt }}</span>
                  </div>
                  <div v-if="activeConversation.order_info.ExpectTimeFmt" class="info-row">
                    <span class="info-label">{{ translate('预计送达') }}:</span>
                    <span class="info-value">{{ activeConversation.order_info.ExpectTimeFmt }}</span>
                  </div>
                </div>

                <!-- 收货信息 -->
                <div class="info-group">
                  <div class="group-title">{{ translate('收货信息') }}</div>
                  <div class="info-row">
                    <span class="info-label">{{ translate('收货人') }}:</span>
                    <span class="info-value">{{ activeConversation.order_info.RecipientName }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">{{ translate('电话') }}:</span>
                    <span class="info-value">{{ activeConversation.order_info.RecipientPhone }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">{{ translate('地址') }}:</span>
                    <span class="info-value address">{{ activeConversation.order_info.RecipientAddress }}</span>
                  </div>
                  <div v-if="activeConversation.order_info.DistanceText" class="info-row">
                    <span class="info-label">{{ translate('距离') }}:</span>
                    <span class="info-value">{{ activeConversation.order_info.DistanceText }}</span>
                  </div>
                </div>

                <!-- 商品信息 -->
                <div class="info-group">
                  <div class="group-title">{{ translate('商品信息') }}</div>
                  <div class="info-row">
                    <span class="info-value summary">{{ activeConversation.order_info.FoodSummary }}</span>
                  </div>
                  <div
                    v-if="activeConversation.order_info.FoodItems && activeConversation.order_info.FoodItems.length > 0"
                    class="food-items"
                  >
                    <div
                      v-for="(item, index) in activeConversation.order_info.FoodItems"
                      :key="index"
                      class="food-item"
                    >
                      <span class="food-name">{{ item.FoodName }}</span>
                      <span v-if="item.SpecInfo" class="food-spec">{{ item.SpecInfo }}</span>
                      <span class="food-quantity">×{{ item.Quantity }}</span>
                      <span class="food-price">¥{{ item.UnitPrice.toFixed(2) }}</span>
                    </div>
                  </div>
                </div>

                <!-- 金额信息 -->
                <div class="info-group">
                  <div class="group-title">{{ translate('金额信息') }}</div>
                  <div
                    v-if="
                      activeConversation.order_info.FoodAmount !== null &&
                      activeConversation.order_info.FoodAmount !== undefined
                    "
                    class="info-row"
                  >
                    <span class="info-label">{{ translate('商品金额') }}:</span>
                    <span class="info-value">¥{{ activeConversation.order_info.FoodAmount.toFixed(2) }}</span>
                  </div>
                  <div
                    v-if="
                      activeConversation.order_info.BoxFee !== null &&
                      activeConversation.order_info.BoxFee !== undefined
                    "
                    class="info-row"
                  >
                    <span class="info-label">{{ translate('打包费') }}:</span>
                    <span class="info-value">¥{{ activeConversation.order_info.BoxFee.toFixed(2) }}</span>
                  </div>
                  <div
                    v-if="
                      activeConversation.order_info.ShippingFee !== null &&
                      activeConversation.order_info.ShippingFee !== undefined
                    "
                    class="info-row"
                  >
                    <span class="info-label">{{ translate('配送费') }}:</span>
                    <span class="info-value">¥{{ activeConversation.order_info.ShippingFee.toFixed(2) }}</span>
                  </div>
                  <div class="info-row highlight">
                    <span class="info-label">{{ translate('实付金额') }}:</span>
                    <span class="info-value price">¥{{ activeConversation.order_info.UserPayAmount.toFixed(2) }}</span>
                  </div>
                  <div
                    v-if="
                      activeConversation.order_info.SettleAmount !== null &&
                      activeConversation.order_info.SettleAmount !== undefined
                    "
                    class="info-row"
                  >
                    <span class="info-label">{{ translate('商家收入') }}:</span>
                    <span class="info-value">¥{{ activeConversation.order_info.SettleAmount.toFixed(2) }}</span>
                  </div>
                </div>

                <!-- 配送信息 -->
                <div
                  v-if="activeConversation.order_info.DeliveryTag || activeConversation.order_info.RiderName"
                  class="info-group"
                >
                  <div class="group-title">{{ translate('配送信息') }}</div>
                  <div v-if="activeConversation.order_info.DeliveryTag" class="info-row">
                    <span class="info-label">{{ translate('配送方式') }}:</span>
                    <span class="info-value">{{ activeConversation.order_info.DeliveryTag }}</span>
                  </div>
                  <div v-if="activeConversation.order_info.RiderName" class="info-row">
                    <span class="info-label">{{ translate('配送员') }}:</span>
                    <span class="info-value">{{ activeConversation.order_info.RiderName }}</span>
                  </div>
                  <div v-if="activeConversation.order_info.DeliveryStatus" class="info-row">
                    <span class="info-label">{{ translate('配送状态') }}:</span>
                    <span class="info-value status">{{ activeConversation.order_info.DeliveryStatus }}</span>
                  </div>
                </div>

                <!-- 顾客备注 -->
                <div v-if="activeConversation.order_info.Remark" class="info-group">
                  <div class="group-title">{{ translate('顾客备注') }}</div>
                  <div class="info-row">
                    <span class="info-value remark">{{ activeConversation.order_info.Remark }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 快捷回复内容 -->
          <div v-if="activeDetailTab === 'quick-reply'" class="quick-reply-section">
            <!-- 顶部标题区域 -->
            <div class="quick-reply-header">
              <div class="header-left">
                <div class="title">{{ translate('快捷回复输入联想') }}</div>
                <div class="description">{{ translate('在输入时根据关键词快速找到回复话术') }}</div>
              </div>
              <div class="header-right">
                <el-switch v-model="quickReplyAutoComplete" />
              </div>
            </div>

            <!-- 标签页 -->
            <div class="quick-reply-tabs">
              <div
                :class="['quick-reply-tab', { active: activeQuickReplyTab === 'personal' }]"
                @click="activeQuickReplyTab = 'personal'"
              >
                {{ translate('个人话术') }}
              </div>
              <div
                :class="['quick-reply-tab', { active: activeQuickReplyTab === 'team' }]"
                @click="activeQuickReplyTab = 'team'"
              >
                {{ translate('团队话术') }}
              </div>
            </div>

            <!-- 搜索和操作栏 -->
            <div class="quick-reply-toolbar">
              <el-input
                v-model="quickReplySearchKeyword"
                :placeholder="translate('输入关键词，搜索快捷回复话术')"
                clearable
                class="search-input"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <div class="toolbar-buttons">
                <el-button type="primary" size="small" style="flex: 1" @click="handleAddGroup">
                  <el-icon><FolderAdd /></el-icon>
                  {{ translate('添加分组') }}
                </el-button>
                <el-button type="primary" size="small" style="flex: 1" @click="handleAddScript">
                  <el-icon><Plus /></el-icon>
                  {{ translate('新增话术') }}
                </el-button>
              </div>
            </div>

            <!-- 话术分组列表 -->
            <div v-loading="quickReplyLoading" class="quick-reply-groups">
              <div v-if="filteredQuickReplyGroups.length === 0" class="empty-state">
                <el-empty :description="translate('暂无话术')" />
              </div>
              <div v-for="(group, groupIndex) in filteredQuickReplyGroups" :key="group.groupName" class="reply-group">
                <!-- 分组标题 -->
                <div class="group-header">
                  <div class="group-title-area" @click="toggleGroup(group.groupName, group.groupId)">
                    <el-icon :class="['collapse-icon', { collapsed: group.collapsed }]">
                      <ArrowDown />
                    </el-icon>
                    <span class="group-name">{{ group.groupName || translate('未分组') }}</span>
                    <span class="group-count">({{ group.items.length }})</span>
                  </div>
                  <div v-if="group.groupName" class="group-actions">
                    <el-button
                      text
                      size="small"
                      :disabled="groupIndex === 0"
                      :title="translate('上移')"
                      @click.stop="handleMoveGroupUp(groupIndex)"
                    >
                      <el-icon><Top /></el-icon>
                    </el-button>
                    <el-button
                      text
                      size="small"
                      :disabled="groupIndex === filteredQuickReplyGroups.length - 1"
                      :title="translate('下移')"
                      @click.stop="handleMoveGroupDown(groupIndex)"
                    >
                      <el-icon><Bottom /></el-icon>
                    </el-button>
                    <el-button
                      text
                      size="small"
                      :title="translate('添加话术')"
                      @click.stop="handleAddScriptToGroup(group.groupName)"
                    >
                      <el-icon><Plus /></el-icon>
                    </el-button>
                    <el-button
                      text
                      size="small"
                      :title="translate('编辑分组')"
                      @click.stop="handleEditGroup(group.groupName)"
                    >
                      <el-icon><Edit /></el-icon>
                    </el-button>
                    <el-button
                      text
                      size="small"
                      type="danger"
                      :title="translate('删除分组')"
                      @click.stop="handleDeleteGroup(group.groupName)"
                    >
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                </div>

                <!-- 分组话术列表 -->
                <div v-show="!group.collapsed" class="group-items">
                  <div v-if="group.items.length === 0" class="empty-group">
                    <el-empty :description="translate('该分组暂无话术')" :image-size="60">
                      <el-button type="primary" size="small" @click="handleAddScriptToGroup(group.groupName)">
                        <el-icon><Plus /></el-icon>
                        {{ translate('添加话术') }}
                      </el-button>
                    </el-empty>
                  </div>
                  <div v-for="item in group.items" :key="item.id" class="reply-item">
                    <div class="item-content" @click="handleQuickSend(item.content)">{{ item.content }}</div>
                    <div class="item-actions">
                      <el-button
                        text
                        size="small"
                        class="send-btn"
                        :title="translate('一键发送')"
                        @click.stop="handleQuickSend(item.content)"
                      >
                        <el-icon><Promotion /></el-icon>
                      </el-button>
                      <el-dropdown trigger="click" @command="cmd => handleItemCommand(cmd, item)">
                        <el-button text size="small" class="more-btn">
                          <el-icon><MoreFilled /></el-icon>
                        </el-button>
                        <template #dropdown>
                          <el-dropdown-menu>
                            <el-dropdown-item command="copy">
                              <el-icon><DocumentCopy /></el-icon>
                              {{ translate('复制') }}
                            </el-dropdown-item>
                            <el-dropdown-item command="edit">
                              <el-icon><Edit /></el-icon>
                              {{ translate('编辑') }}
                            </el-dropdown-item>
                            <el-dropdown-item command="delete" divided>
                              <el-icon><Delete /></el-icon>
                              {{ translate('删除') }}
                            </el-dropdown-item>
                          </el-dropdown-menu>
                        </template>
                      </el-dropdown>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- 右键菜单 -->
    <teleport to="body">
      <div
        v-if="contextMenuVisible"
        class="context-menu"
        :style="{ left: contextMenuPosition.x + 'px', top: contextMenuPosition.y + 'px' }"
        @click.stop
      >
        <div class="context-menu-item" @click="handleCloseSession">
          {{ translate('关闭会话') }}
        </div>
        <div class="context-menu-item" @click="handleTransferSession">
          {{ translate('转交会话') }}
        </div>
      </div>
      <!-- 点击外部关闭菜单 -->
      <div v-if="contextMenuVisible" class="context-menu-overlay" @click="closeContextMenu" />
    </teleport>

    <!-- 转交会话对话框 -->
    <el-dialog v-model="transferDialogVisible" :title="translate('转交会话')" width="500px" append-to-body>
      <el-form label-width="100px">
        <el-form-item :label="translate('选择客服')">
          <el-select v-model="selectedAdminId" :placeholder="translate('请选择目标客服')" style="width: 100%">
            <el-option v-for="admin in onlineAdmins" :key="admin.id" :label="admin.userName" :value="admin.id">
              <span>{{ admin.userName }}</span>
              <span v-if="admin.isOnline" style="color: var(--el-color-success); margin-left: 8px">●</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="translate('转交备注')">
          <el-input
            v-model="transferRemark"
            type="textarea"
            :rows="3"
            :placeholder="translate('请输入转交备注（可选）')"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleCancelTransfer">{{ translate('取消') }}</el-button>
        <el-button
          type="primary"
          :loading="batchMode ? batchTransferLoading : transferLoading"
          @click="batchMode ? handleConfirmBatchTransfer() : handleConfirmTransfer()"
        >
          {{ translate('确定') }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 新增/编辑分组对话框 -->
    <el-dialog
      v-model="groupDialogVisible"
      :title="editingGroupName ? translate('编辑分组') : translate('新增分组')"
      width="400px"
      append-to-body
    >
      <el-form label-width="80px">
        <el-form-item :label="translate('分组名称')" required>
          <el-input v-model="groupFormName" :placeholder="translate('请输入分组名称')" maxlength="50" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="groupDialogVisible = false">{{ translate('取消') }}</el-button>
        <el-button type="primary" :loading="groupSaving" @click="handleSaveGroup">
          {{ translate('保存') }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 新增/编辑话术对话框 -->
    <el-dialog
      v-model="scriptDialogVisible"
      :title="editingScriptId ? translate('编辑话术') : translate('新增话术')"
      width="600px"
      append-to-body
    >
      <el-form :model="scriptForm" label-width="100px">
        <el-form-item :label="translate('快捷命令')">
          <el-input
            v-model="scriptForm.shortcut"
            :placeholder="translate('输入快捷命令，如：abc（输入/abc快速匹配）')"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>
        <el-form-item :label="translate('话术内容')" required>
          <el-input
            v-model="scriptForm.content"
            type="textarea"
            :rows="6"
            :placeholder="translate('请输入话术内容')"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        <el-form-item :label="translate('所属分组')">
          <el-select
            v-model="scriptForm.group_name"
            :placeholder="translate('选择分组，留空表示未分组')"
            clearable
            filterable
            allow-create
            style="width: 100%"
          >
            <el-option v-for="group in allGroups" :key="group.id" :label="group.name" :value="group.name" />
          </el-select>
          <div style="color: var(--el-text-color-secondary); font-size: 12px; margin-top: 4px">
            {{ translate('可以选择已有分组，或输入新分组名称') }}
          </div>
        </el-form-item>
        <el-form-item :label="translate('话术类型')">
          <el-radio-group v-model="scriptForm.type">
            <el-radio :label="1">{{ translate('个人话术') }}</el-radio>
            <el-radio :label="2">{{ translate('团队话术') }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="scriptDialogVisible = false">{{ translate('取消') }}</el-button>
        <el-button type="primary" :loading="scriptSaving" @click="handleSaveScript">
          {{ translate('保存') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
export default {
  name: 'CustomerServiceChat'
}
</script>

<script lang="ts" setup>
import { ref, watch, onMounted, onUnmounted, nextTick, computed } from 'vue'
import {
  Plus,
  Position,
  User,
  Headset,
  Document,
  Download,
  Picture,
  ShoppingCart,
  VideoPlay,
  VideoCamera,
  Microphone,
  Loading,
  Close,
  CircleClose,
  Switch,
  DArrowLeft,
  DArrowRight,
  Search,
  ArrowDown,
  Promotion,
  Edit,
  Delete,
  FolderAdd,
  Top,
  Bottom,
  MoreFilled,
  DocumentCopy
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
// import { useSiteTypeStore } from '/@/store/modules/siteType'
// 项目中没有 siteTypeStore，暂时移除平台图标功能
import type { SessionEvent } from '/@/customer-service/utils/signalRManager'
import { signalRManager } from '/@/customer-service/utils/signalRManager'
import { apiManager } from '/@/TsModel/Api/ApiManager'
import { useAclStore } from '/@/store/modules/acl'
import { useUserStore } from '/@/store/modules/user'
import type { ImMessage } from '@/TsModel/Alien/Entity/Messages/ImMessage'
import type { t_wmt_im_session } from '@/TsModel/Alien/Entity/Tables/IM/t_wmt_im_session'
import type { t_wmt_im_message } from '@/TsModel/Alien/Entity/Tables/IM/t_wmt_im_message'
import type { ReplyMessageRequest } from '@/TsModel/Alien/Faster/Controllers/IM/ReplyMessageRequest'
import type { TagRequest } from '@/TsModel/Alien/Faster/Controllers/IM/TagRequest'
import type { RemarksRequest } from '@/TsModel/Alien/Faster/Controllers/IM/RemarksRequest'
import type { CloseSessionRequest } from '@/TsModel/Alien/Faster/Controllers/IM/CloseSessionRequest'
import type { TransferSessionRequest } from '@/TsModel/Alien/Faster/Controllers/IM/TransferSessionRequest'
import type { OnlineAdminItemVo } from '@/TsModel/Alien/Faster/Controllers/IM/OnlineAdminItemVo'
import type { QuickReplyVo } from '@/TsModel/Alien/Faster/Controllers/IM/QuickReplyVo'
import { QuickReplyType } from '@/TsModel/Alien/Entity/Enums/IM/QuickReplyType'
import { GroupType } from '@/TsModel/Alien/Entity/Enums/GroupType'
import type { t_wmt_group } from '@/TsModel/Alien/Entity/Tables/t_wmt_group'
import { ImMsgType } from '@/TsModel/Alien/Entity/Enums/IM/ImMsgType'
import BenzAMRRecorder from 'benz-amr-recorder'
import { imEventBus } from '/@/customer-service/utils/imEventBus'
import PlatformIcon from '/@/components/PlatformIcon/index.vue'

defineOptions({
  name: 'CustomerServiceChat'
})

// 移除国际化支持，直接使用中文
const translate = (text: string) => text

// 定义 emits
const emit = defineEmits<{
  'auto-height-toggle': [enabled: boolean]
}>()

// const siteTypeStore = useSiteTypeStore()
const aclStore = useAclStore()
const userStore = useUserStore()

// 判断当前用户是否是客服
const isCustomerService = computed(() => {
  return aclStore.getRole.includes('KEFU')
})

// IM客服开关相关状态
const imServiceEnabled = ref(false)
const enableImServiceLoading = ref(false)

// 获取平台图标（暂未实现）
const getPlatformIcon = (siteType: number) => {
  // TODO: 实现平台图标获取
  return null
}

// 获取平台名称
const getPlatformName = (siteType: number) => {
  const platformNames: Record<number, string> = {
    1: '美团',
    2: '饿了么',
    3: '美团闪购',
    4: '美团医药',
    5: '饿百零售',
    6: '京东到家',
    7: '抖店即时零售',
    8: '饿了么官方'
  }
  return platformNames[siteType] || '未知平台'
}

const handleShopImageError = (event: Event, session: CustomerServiceSession) => {
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
  session.shop_img = ''
}

/**
 * 处理开启IM客服功能
 */
const handleEnableImService = async () => {
  if (!imServiceEnabled.value) {
    // 如果是关闭操作,直接返回(不支持关闭)
    imServiceEnabled.value = true
    ElMessage.warning('IM客服功能开启后不能关闭')
    return
  }

  enableImServiceLoading.value = true
  try {
    // 调用开启IM客服功能接口
    const result = await apiManager.imAdminApi.EnableImService()

    if (result) {
      ElMessage.success('成功开启IM客服功能!正在连接客服系统...')

      // 更新用户角色信息
      // 重新获取用户信息以更新角色
      await userStore.getUserInfo()

      // 自动连接SignalR
      await connectToSignalR()

      // 刷新会话列表
      await refreshSessionData({ refreshTotals: true })
    } else {
      throw new Error('开启失败')
    }
  } catch (error: any) {
    imServiceEnabled.value = false

    // 检查错误信息是否包含"上级禁止"相关提示
    const errorMsg = error?.message || '开启IM客服功能失败'
    if (errorMsg.includes('上级') || errorMsg.includes('禁止') || errorMsg.includes('未分配')) {
      ElMessage.error('您的上级已限制下级自主开启IM客服功能,请联系上级为您分配客服角色')
    } else {
      ElMessage.error(errorMsg)
    }
  } finally {
    enableImServiceLoading.value = false
  }
}

/**
 * 连接到SignalR
 */
const connectToSignalR = async () => {
  try {
    // 从localStorage获取用户信息
    const userInfoStr = localStorage.getItem('userInfo')
    if (!userInfoStr) {
      console.error('用户信息不存在,无法连接SignalR')
      return
    }

    const userInfo = JSON.parse(userInfoStr)
    const userId = userInfo?.admin?.id

    if (!userId) {
      console.error('用户ID不存在,无法连接SignalR')
      return
    }

    // 连接到IM Hub
    const connected = await signalRManager.connect(userId)
    if (connected) {
      console.log('成功连接到SignalR IM Hub')
    } else {
      console.error('连接到SignalR IM Hub失败')
    }
  } catch (error) {
    console.error('连接SignalR失败:', error)
  }
}

// 响应式数据 - DOM引用
const messagesRef = ref<HTMLElement>()
const inputTextareaRef = ref<HTMLElement>()
const inputAreaRef = ref<HTMLElement>()
const conversationListRef = ref<HTMLElement>()
const currentPlayingAudioId = ref<string>('')
const amrPlayer = ref<any>(null)
const loadingAudioId = ref<string>('')

type SessionTab = 'unreplied' | 'all'

interface CustomerServiceSession extends t_wmt_im_session {
  shop_name?: string | null
  shop_img?: string | null
}

const transformSession = (session: t_wmt_im_session): CustomerServiceSession => {
  return session as CustomerServiceSession
}

const transformSessions = (sessions?: t_wmt_im_session[] | null): CustomerServiceSession[] => {
  if (!sessions || sessions.length === 0) {
    return []
  }
  return sessions.map(item => transformSession(item))
}

// 会话相关
const activeTab = ref<SessionTab>('unreplied')
const activeConversation = ref<CustomerServiceSession | null>(null)
const activeSessionMessages = ref<t_wmt_im_message[]>([])
const inputMessage = ref('')
const sessionListLoading = ref(false)
const messagesLoading = ref(false)

// 会话列表分页相关
const sessionCurrentPage = ref(1)
const sessionPageSize = ref(20)
const hasMoreSessions = ref(true)
const loadingMoreSessions = ref(false)

// 游标分页相关
const hasMoreMessages = ref(true)
const loadingMoreMessages = ref(false)
const isFirstLoad = ref(true)

// 顾客详情相关
const customerTags = ref<string[]>([])
const customerRemarks = ref('')
const newTagInput = ref('')
const showTagInput = ref(false)
const tagInputRef = ref()
const savingRemarks = ref(false)
const showCustomerDetail = ref(true)

// 快捷回复相关
const activeDetailTab = ref<'customer' | 'quick-reply'>('customer')
const activeQuickReplyTab = ref<'personal' | 'team'>('personal')
const quickReplySearchKeyword = ref('')
const quickReplyAutoComplete = ref(true)
const quickReplyLoading = ref(false)
const allQuickReplies = ref<QuickReplyVo[]>([])
const allGroups = ref<t_wmt_group[]>([])
const groupCollapsedState = ref<Map<string, boolean>>(new Map()) // 存储每个分组的折叠状态

interface QuickReplyGroup {
  groupName: string
  groupId?: string
  items: QuickReplyVo[]
  collapsed: boolean
}

// 输入联想相关
const autocompleteMatches = ref<QuickReplyVo[]>([])
const autocompleteVisible = ref(false)
const autocompleteSelectedIndex = ref(-1)
const inputWrapperRef = ref<HTMLElement | null>(null)
const autocompletePosition = ref({
  left: '0px',
  top: '0px',
  width: '0px'
})

// 话术增删改查相关
const scriptDialogVisible = ref(false)
const scriptSaving = ref(false)
const editingScriptId = ref<string | null>(null)
const scriptForm = ref({
  shortcut: '',
  content: '',
  group_name: '',
  type: 1 as QuickReplyType
})

// 分组管理相关
const groupDialogVisible = ref(false)
const groupSaving = ref(false)
const editingGroupName = ref<string | null>(null)
const groupFormName = ref('')

// 右键菜单相关
const contextMenuVisible = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })
const contextMenuSession = ref<CustomerServiceSession | null>(null)

// 转交会话对话框相关
const transferDialogVisible = ref(false)
const onlineAdmins = ref<OnlineAdminItemVo[]>([])
const selectedAdminId = ref('')
const transferRemark = ref('')
const transferLoading = ref(false)

// 批量操作相关
const batchMode = ref(false)
const selectedSessions = ref<Set<string>>(new Set())
const longPressTimer = ref<number | null>(null)
const longPressDuration = 500
const batchCloseLoading = ref(false)
const batchTransferLoading = ref(false)
const justEnteredBatchMode = ref(false)

// 多媒体消息相关
const uploadingImage = ref(false)
const uploadingVideo = ref(false)
const isRecording = ref(false)
const recordingTime = ref(0)
const mediaRecorder = ref<MediaRecorder | null>(null)
const recordedChunks = ref<Blob[]>([])
const recordingTimer = ref<number | null>(null)
const inputAreaHeight = ref<number>(220)
const isResizingInputArea = ref(false)
let resizeStartY = 0
let resizeStartHeight = 0
const INPUT_AREA_MIN_HEIGHT = 160
const INPUT_AREA_MAX_HEIGHT = 360

let messageOff: (() => void) | null = null
let sessionEventOff: (() => void) | null = null
let signalRMessageOff: (() => void) | null = null
let signalRSessionEventOff: (() => void) | null = null

// Emoji 表情列表
const emojiList = ref([
  '😀',
  '😃',
  '😄',
  '😁',
  '😆',
  '😅',
  '🤣',
  '😂',
  '🙂',
  '🙃',
  '😉',
  '😊',
  '😇',
  '🥰',
  '😍',
  '🤩',
  '😘',
  '😗',
  '😚',
  '😙',
  '😋',
  '😛',
  '😜',
  '🤪',
  '😝',
  '🤑',
  '🤗',
  '🤭',
  '🤫',
  '🤔',
  '🤐',
  '🤨',
  '😐',
  '😑',
  '😶',
  '😏',
  '😒',
  '🙄',
  '😬',
  '🤥',
  '😌',
  '😔',
  '😪',
  '🤤',
  '😴',
  '😷',
  '🤒',
  '🤕',
  '🤢',
  '🤮',
  '🤧',
  '🥵',
  '🥶',
  '😶‍🌫️',
  '🥴',
  '😵',
  '🤯',
  '🤠',
  '🥳',
  '😎',
  '🤓',
  '🧐',
  '😕',
  '😟',
  '🙁',
  '☹️',
  '😮',
  '😯',
  '😲',
  '😳',
  '🥺',
  '😦',
  '😧',
  '😨',
  '😰',
  '😥',
  '😢',
  '😭',
  '😱',
  '😖',
  '😣',
  '😞',
  '😓',
  '😩',
  '😫',
  '🥱',
  '😤',
  '😡',
  '😠',
  '🤬',
  '👍',
  '👎',
  '👌',
  '✌️',
  '🤞',
  '🤝',
  '🙏',
  '💪',
  '👏',
  '🎉'
])

// 会话列表数据
const conversationList = ref<CustomerServiceSession[]>([])
const pendingSessionTotal = ref(0)
const allSessionTotal = ref(0)

const customerConversationTitle = computed(() => {
  const customerName = activeConversation.value?.customer_name
  return customerName ? `${customerName}` : translate('未知客户')
})

const shopConversationTitle = computed(() => {
  const shopName = activeConversation.value?.shop_name
  return shopName ? `${shopName}` : translate('未知店铺')
})

const updateSessionTotalByTab = (tab: SessionTab, total?: number) => {
  if (typeof total !== 'number') {
    return
  }

  if (tab === 'unreplied') {
    pendingSessionTotal.value = total
  } else {
    allSessionTotal.value = total
  }
}

const getOnlyServingByTab = (tab: SessionTab): boolean => {
  return tab === 'unreplied'
}

interface FetchSessionListOptions {
  refreshOtherTotals?: boolean
}

// 获取会话列表（重置并加载第一页）
const fetchSessionList = async ({ refreshOtherTotals = false }: FetchSessionListOptions = {}) => {
  sessionCurrentPage.value = 1
  hasMoreSessions.value = true
  conversationList.value = []

  sessionListLoading.value = true
  try {
    const onlyServing = getOnlyServingByTab(activeTab.value)

    const result = await apiManager.imSessionApi.GetSessionList(
      sessionCurrentPage.value,
      sessionPageSize.value,
      undefined,
      onlyServing
    )

    conversationList.value = transformSessions(result.rows)

    if (!result.rows || result.rows.length < sessionPageSize.value) {
      hasMoreSessions.value = false
    }
    updateSessionTotalByTab(activeTab.value, result.total)

    if (refreshOtherTotals) {
      const otherTab: SessionTab = activeTab.value === 'unreplied' ? 'all' : 'unreplied'
      await fetchSessionTotalByTab(otherTab)
    }
  } catch (error) {
    conversationList.value = []
    hasMoreSessions.value = false
  } finally {
    sessionListLoading.value = false
  }
}

// 加载更多会话
const loadMoreSessions = async () => {
  if (!hasMoreSessions.value || loadingMoreSessions.value) {
    return
  }

  loadingMoreSessions.value = true
  try {
    sessionCurrentPage.value++

    const onlyServing = getOnlyServingByTab(activeTab.value)

    const result = await apiManager.imSessionApi.GetSessionList(
      sessionCurrentPage.value,
      sessionPageSize.value,
      undefined,
      onlyServing
    )

    if (result.rows && result.rows.length > 0) {
      conversationList.value = [...conversationList.value, ...transformSessions(result.rows)]
    }

    if (!result.rows || result.rows.length < sessionPageSize.value) {
      hasMoreSessions.value = false
    }
    updateSessionTotalByTab(activeTab.value, result.total)
  } catch (error) {
    console.error('加载更多会话失败:', error)
    sessionCurrentPage.value--
  } finally {
    loadingMoreSessions.value = false
  }
}

const fetchSessionTotalByTab = async (tab: SessionTab) => {
  try {
    const onlyServing = getOnlyServingByTab(tab)
    const result = await apiManager.imSessionApi.GetSessionList(1, 1, undefined, onlyServing)
    updateSessionTotalByTab(tab, result.total)
  } catch (error) {
    console.error('获取会话统计失败:', error)
  }
}

interface RefreshOptions {
  refreshTotals?: boolean
}

const refreshSessionData = async ({ refreshTotals = false }: RefreshOptions = {}) => {
  await fetchSessionList({ refreshOtherTotals: refreshTotals })
}

// 选择会话
const selectConversation = async (session: CustomerServiceSession) => {
  if (!session) return

  try {
    messagesLoading.value = true
    isFirstLoad.value = true
    hasMoreMessages.value = true

    if (session.unread_count > 0) {
      try {
        await apiManager.imManageApi.MarkSessionRead(session.id)
        session.unread_count = 0
      } catch (error) {
        // 不影响后续操作
      }
    }

    const sessionDetail = transformSession(await apiManager.imSessionApi.GetSessionDetail(session.id))
    activeConversation.value = sessionDetail

    const messages = await apiManager.imSessionApi.GetSessionMessagesStream(session.id, undefined)
    activeSessionMessages.value = messages ? [...messages].reverse() : []

    if (messages.length < 50) {
      hasMoreMessages.value = false
    }

    customerTags.value = sessionDetail.tags || []
    customerRemarks.value = sessionDetail.remarks || ''

    nextTick(() => {
      scrollToBottom()
      isFirstLoad.value = false
    })
  } catch (error) {
    ElMessage.error(translate('加载会话失败'))
  } finally {
    messagesLoading.value = false
  }
}

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim() || !activeConversation.value) return

  const messageContent = inputMessage.value.trim()

  try {
    const replyRequest: ReplyMessageRequest = {
      Content: messageContent,
      MsgType: 1
    }

    await apiManager.imSessionApi.ReplyToCustomer(activeConversation.value.id, replyRequest)

    inputMessage.value = ''

    nextTick(() => {
      scrollToBottom()
    })
  } catch (error) {
    ElMessage.error(translate('发送消息失败'))
  }
}

// 处理Enter键
const handleEnterKey = (event: KeyboardEvent | Event) => {
  const keyboardEvent = event as KeyboardEvent
  if (keyboardEvent.shiftKey) {
    return
  }

  // 如果下拉列表可见且有选中项，则插入选中项
  if (autocompleteVisible.value && autocompleteSelectedIndex.value >= 0) {
    const match = autocompleteMatches.value[autocompleteSelectedIndex.value]
    if (match) {
      keyboardEvent.preventDefault()
      handleSelectAutocomplete(match)
      return
    }
  }

  keyboardEvent.preventDefault()
  sendMessage()
}

// 快捷回复相关功能

// 加载快捷回复列表
const loadQuickReplies = async () => {
  try {
    quickReplyLoading.value = true

    // 同时加载话术和分组
    const [replies, groups] = await Promise.all([
      apiManager.imQuickReplyApi.GetQuickReplyList(),
      apiManager.groupApi.GetGroups(GroupType.IM话术分类, true, undefined)
    ])

    allQuickReplies.value = replies || []

    // 提取分组数据（TreeData 转为普通数组）
    allGroups.value = groups ? flattenTreeData(groups) : []
  } catch (error) {
    console.error('加载快捷回复失败:', error)
    ElMessage.error(translate('加载快捷回复失败'))
  } finally {
    quickReplyLoading.value = false
  }
}

// 将 TreeData 展平为数组
const flattenTreeData = (treeData: any[]): t_wmt_group[] => {
  const result: t_wmt_group[] = []

  const flatten = (nodes: any[]) => {
    for (const node of nodes) {
      // API 返回的数据中，分组信息在 Member 字段中
      if (node.Member) {
        result.push(node.Member)
      } else if (node.data) {
        // 兼容其他可能的数据结构
        result.push(node.data)
      }
      if (node.children && node.children.length > 0) {
        flatten(node.children)
      }
    }
  }

  flatten(treeData)
  return result
}

// 根据当前标签页和搜索关键词过滤话术
const filteredQuickReplyGroups = computed(() => {
  // 先过滤类型
  let filtered = allQuickReplies.value.filter(item => {
    if (activeQuickReplyTab.value === 'personal') {
      return item.type === QuickReplyType.Personal
    } else {
      return item.type === QuickReplyType.Team
    }
  })

  // 再过滤搜索关键词
  if (quickReplySearchKeyword.value.trim()) {
    const keyword = quickReplySearchKeyword.value.trim().toLowerCase()
    filtered = filtered.filter(
      item =>
        item.content.toLowerCase().includes(keyword) ||
        (item.shortcut && item.shortcut.toLowerCase().includes(keyword)) ||
        (item.group_name && item.group_name.toLowerCase().includes(keyword))
    )
  }

  // 按分组聚合（使用 group 字段关联分组ID）
  const groupMap = new Map<string, { groupName: string; groupId?: string; items: QuickReplyVo[] }>()

  // 首先，将所有分组添加到 Map 中（包括空分组）
  allGroups.value.forEach(group => {
    if (!groupMap.has(group.id)) {
      groupMap.set(group.id, {
        groupName: group.name,
        groupId: group.id,
        items: []
      })
    }
  })

  // 然后，将话术分配到对应的分组
  filtered.forEach(item => {
    const groupId = item.group || ''
    const groupName = item.group_name || ''

    if (!groupMap.has(groupId)) {
      // 如果分组不存在（比如未分组的话术），创建一个临时分组
      groupMap.set(groupId, {
        groupName,
        groupId: groupId || undefined,
        items: []
      })
    }
    groupMap.get(groupId)!.items.push(item)
  })

  // 转换为数组格式并排序
  const groups: QuickReplyGroup[] = []

  groupMap.forEach(value => {
    groups.push({
      groupName: value.groupName,
      groupId: value.groupId,
      items: value.items.sort((a, b) => a.sort_order - b.sort_order),
      collapsed: false // 临时值，后面会根据状态更新
    })
  })

  // 按分组 index 排序，没有 index 的按名称排序，未分组放最后
  const sortedGroups = groups.sort((a, b) => {
    // 未分组永远放最后
    if (!a.groupName) return 1
    if (!b.groupName) return -1

    // 获取分组的 index 值
    const aGroupData = allGroups.value.find(g => g.id === a.groupId)
    const bGroupData = allGroups.value.find(g => g.id === b.groupId)

    const aIndex = aGroupData?.index
    const bIndex = bGroupData?.index

    // 如果都有 index，按 index 排序
    if (aIndex != null && bIndex != null) {
      return aIndex - bIndex
    }

    // 如果只有一个有 index，有 index 的在前
    if (aIndex != null) return -1
    if (bIndex != null) return 1

    // 都没有 index，按名称排序
    return a.groupName.localeCompare(b.groupName, 'zh-CN')
  })

  // 设置折叠状态（第一个分组展开，其他折叠）
  sortedGroups.forEach((group, index) => {
    const groupKey = group.groupId || group.groupName || 'ungrouped'

    // 如果该分组没有折叠状态记录，设置默认值
    if (!groupCollapsedState.value.has(groupKey)) {
      // 第一个分组默认展开(false)，其他分组默认折叠(true)
      groupCollapsedState.value.set(groupKey, index !== 0)
    }

    // 从状态中读取折叠值
    group.collapsed = groupCollapsedState.value.get(groupKey) || false
  })

  return sortedGroups
})

// 切换分组折叠状态
const toggleGroup = (groupName: string, groupId?: string) => {
  const groupKey = groupId || groupName || 'ungrouped'
  const currentState = groupCollapsedState.value.get(groupKey) || false
  groupCollapsedState.value.set(groupKey, !currentState)
}

// 一键发送
const handleQuickSend = async (content: string) => {
  if (!activeConversation.value) {
    ElMessage.warning(translate('请先选择会话'))
    return
  }

  const originalInput = inputMessage.value
  inputMessage.value = content

  try {
    await sendMessage()
  } catch (error) {
    // 发送失败时恢复原输入
    inputMessage.value = originalInput
  }
}

// 搜索匹配的话术
const searchQuickReply = (keyword: string, isSlashCommand: boolean) => {
  if (!keyword || keyword.trim().length === 0) {
    autocompleteMatches.value = []
    autocompleteVisible.value = false
    return
  }

  const matches: QuickReplyVo[] = []
  const lowerKeyword = keyword.toLowerCase()

  // 只搜索当前标签页的话术
  const currentReplies = allQuickReplies.value.filter(item => {
    if (activeQuickReplyTab.value === 'personal') {
      return item.type === QuickReplyType.Personal
    } else {
      return item.type === QuickReplyType.Team
    }
  })

  if (isSlashCommand) {
    // 快捷命令匹配：匹配 shortcut 字段
    currentReplies.forEach(item => {
      if (item.shortcut && item.shortcut.toLowerCase().includes(lowerKeyword)) {
        matches.push(item)
      }
    })
  } else {
    // 全文搜索：匹配 content 字段
    currentReplies.forEach(item => {
      if (item.content && item.content.toLowerCase().includes(lowerKeyword)) {
        matches.push(item)
      }
    })
  }

  // 限制最多显示10条
  autocompleteMatches.value = matches.slice(0, 10)
  autocompleteVisible.value = matches.length > 0
  autocompleteSelectedIndex.value = -1

  // 计算下拉框位置
  if (autocompleteVisible.value) {
    nextTick(() => {
      updateAutocompletePosition()
    })
  }
}

// 更新自动完成下拉框的位置
const updateAutocompletePosition = () => {
  if (!inputWrapperRef.value) return

  const rect = inputWrapperRef.value.getBoundingClientRect()

  autocompletePosition.value = {
    left: `${rect.left}px`,
    top: `${rect.top - 8}px`, // 距离输入框上方8px
    width: `${rect.width}px`
  }
}

// 处理消息输入
const handleMessageInput = () => {
  if (!quickReplyAutoComplete.value) {
    autocompleteVisible.value = false
    return
  }

  const input = inputMessage.value.trim()

  if (input.startsWith('/')) {
    // 快捷命令匹配
    const keyword = input.substring(1)
    searchQuickReply(keyword, true)
  } else {
    // 全文搜索
    searchQuickReply(input, false)
  }
}

// 处理键盘向下导航
const handleAutocompleteKeyDown = () => {
  if (!autocompleteVisible.value || autocompleteMatches.value.length === 0) {
    return
  }
  if (autocompleteSelectedIndex.value < autocompleteMatches.value.length - 1) {
    autocompleteSelectedIndex.value++
    // 立即滚动到选中项
    nextTick(() => {
      scrollToSelectedItem()
    })
  }
}

// 处理键盘向上导航
const handleAutocompleteKeyUp = () => {
  if (!autocompleteVisible.value || autocompleteMatches.value.length === 0) {
    return
  }
  if (autocompleteSelectedIndex.value > 0) {
    autocompleteSelectedIndex.value--
    // 立即滚动到选中项
    nextTick(() => {
      scrollToSelectedItem()
    })
  } else {
    autocompleteSelectedIndex.value = -1
  }
}

// 滚动到选中的自动完成项
const scrollToSelectedItem = () => {
  const dropdown = document.querySelector('.autocomplete-dropdown-overlay')
  if (!dropdown) return

  const selectedItem = dropdown.querySelector('.autocomplete-item.active')
  if (!selectedItem) return

  selectedItem.scrollIntoView({
    block: 'nearest',
    behavior: 'auto' // 使用 auto 替代 smooth，响应更快
  })
}

// 选择联想项
const handleSelectAutocomplete = (match: QuickReplyVo) => {
  inputMessage.value = match.content
  autocompleteVisible.value = false
  autocompleteMatches.value = []
  autocompleteSelectedIndex.value = -1
}

// 高亮关键词
const highlightKeyword = (text: string, keyword: string): string => {
  if (!keyword || !text || keyword.trim().length === 0) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  const escapeHtml = (str: string) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  const escapeRegex = (str: string) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  const escapedText = escapeHtml(text)
  const escapedKeyword = escapeRegex(escapeHtml(keyword.trim()))

  try {
    const regex = new RegExp(`(${escapedKeyword})`, 'gi')
    return escapedText.replace(regex, '<span class="keyword-highlight">$1</span>')
  } catch (error) {
    console.error('高亮关键词失败:', error)
    return escapedText
  }
}

// 分组管理功能

// 添加分组
const handleAddGroup = () => {
  editingGroupName.value = null
  groupFormName.value = ''
  groupDialogVisible.value = true
}

// 编辑分组
const handleEditGroup = (groupName: string) => {
  editingGroupName.value = groupName
  groupFormName.value = groupName
  groupDialogVisible.value = true
}

// 保存分组
const handleSaveGroup = async () => {
  const newGroupName = groupFormName.value.trim()

  if (!newGroupName) {
    ElMessage.warning(translate('请输入分组名称'))
    return
  }

  try {
    groupSaving.value = true

    if (editingGroupName.value) {
      // 编辑分组：找到对应的分组并更新
      const group = allGroups.value.find(g => g.name === editingGroupName.value)

      if (!group) {
        ElMessage.error(translate('分组不存在'))
        return
      }

      // 更新分组名称
      await apiManager.groupApi.UpdateGroup({
        ...group,
        name: newGroupName
      })

      // 批量更新该分组下所有话术的 group_name
      const itemsInGroup = allQuickReplies.value.filter(item => item.group === group.id)

      for (const item of itemsInGroup) {
        await apiManager.imQuickReplyApi.UpdateQuickReply({
          id: item.id,
          group_name: newGroupName
        })
      }

      ElMessage.success(translate('分组更新成功'))
    } else {
      // 新增分组：调用 GroupApi 创建分组
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
      const userId = userInfo?.admin?.id || ''

      const newGroup: t_wmt_group = {
        id: '', // 后端生成
        type: GroupType.IM话术分类,
        user: userId,
        name: newGroupName,
        Parent: undefined,
        AllParent: undefined,
        avtag: true,
        notes: '',
        crtim: undefined,
        uptim: undefined
      }

      const createdGroup = await apiManager.groupApi.AddGroup(newGroup)
      ElMessage.success(translate('分组创建成功'))

      // 重新加载分组列表
      allGroups.value.push(createdGroup)
    }

    // 重新加载话术列表
    await loadQuickReplies()
    groupDialogVisible.value = false
  } catch (error) {
    console.error('保存分组失败:', error)
  } finally {
    groupSaving.value = false
  }
}

// 删除分组
const handleDeleteGroup = async (groupName: string) => {
  try {
    const group = allGroups.value.find(g => g.name === groupName)

    if (!group) {
      ElMessage.error(translate('分组不存在'))
      return
    }

    const itemsInGroup = allQuickReplies.value.filter(item => item.group === group.id)

    await ElMessageBox.confirm(
      translate(`确定要删除分组"${groupName}"吗？该分组下有${itemsInGroup.length}条话术，删除后话术将移至未分组。`),
      translate('提示'),
      {
        confirmButtonText: translate('确定'),
        cancelButtonText: translate('取消'),
        type: 'warning'
      }
    )

    // 删除分组
    await apiManager.groupApi.DeleteGroup(group.id)

    // 将该分组下所有话术移至未分组
    for (const item of itemsInGroup) {
      await apiManager.imQuickReplyApi.UpdateQuickReply({
        id: item.id,
        group: null,
        group_name: null
      })
    }

    ElMessage.success(translate('分组删除成功'))
    await loadQuickReplies()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除分组失败:', error)
    }
  }
}

// 分组上移
const handleMoveGroupUp = async (groupIndex: number) => {
  if (groupIndex === 0) return

  try {
    const groups = filteredQuickReplyGroups.value
    const currentGroup = groups[groupIndex]
    const prevGroup = groups[groupIndex - 1]

    if (!currentGroup.groupId || !prevGroup.groupId) {
      ElMessage.warning(translate('无法移动未分组'))
      return
    }

    // 获取上一个分组的数据
    const prevGroupData = allGroups.value.find(g => g.id === prevGroup.groupId)

    if (!prevGroupData) {
      ElMessage.error(translate('分组数据不存在'))
      return
    }

    const targetIndex = prevGroupData.index ?? groupIndex - 1

    // 将当前分组的 index 设置为上一个分组的 index
    // 后端会自动处理其他分组的排序
    await apiManager.groupApi.UpdateGroupIndex(currentGroup.groupId, targetIndex)

    ElMessage.success(translate('分组上移成功'))

    // 重新加载以刷新排序
    await loadQuickReplies()
  } catch (error) {
    console.error('分组上移失败:', error)
    ElMessage.error(translate('分组上移失败'))
  }
}

// 分组下移
const handleMoveGroupDown = async (groupIndex: number) => {
  const groups = filteredQuickReplyGroups.value
  if (groupIndex >= groups.length - 1) return

  try {
    const currentGroup = groups[groupIndex]
    const nextGroup = groups[groupIndex + 1]

    if (!currentGroup.groupId || !nextGroup.groupId) {
      ElMessage.warning(translate('无法移动未分组'))
      return
    }

    // 获取下一个分组的数据
    const nextGroupData = allGroups.value.find(g => g.id === nextGroup.groupId)

    if (!nextGroupData) {
      ElMessage.error(translate('分组数据不存在'))
      return
    }

    const targetIndex = (nextGroupData.index ?? groupIndex + 1) + 1

    // 将当前分组的 index 设置为下一个分组的 index + 1
    // 后端会自动处理其他分组的排序
    await apiManager.groupApi.UpdateGroupIndex(currentGroup.groupId, targetIndex)

    ElMessage.success(translate('分组下移成功'))

    // 重新加载以刷新排序
    await loadQuickReplies()
  } catch (error) {
    console.error('分组下移失败:', error)
    ElMessage.error(translate('分组下移失败'))
  }
}

// 添加话术到指定分组
const handleAddScriptToGroup = (groupName: string) => {
  const group = allGroups.value.find(g => g.name === groupName)

  editingScriptId.value = null
  scriptForm.value = {
    shortcut: '',
    content: '',
    group_name: groupName,
    type: activeQuickReplyTab.value === 'personal' ? QuickReplyType.Personal : QuickReplyType.Team
  }

  // 如果找到分组，保存分组ID
  if (group) {
    ;(scriptForm.value as any).group_id = group.id
  }

  scriptDialogVisible.value = true
}

// 话术操作菜单处理
const handleItemCommand = async (command: string, item: QuickReplyVo) => {
  switch (command) {
    case 'copy':
      try {
        await navigator.clipboard.writeText(item.content)
        ElMessage.success(translate('复制成功'))
      } catch (error) {
        // 降级方案
        const textarea = document.createElement('textarea')
        textarea.value = item.content
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        ElMessage.success(translate('复制成功'))
      }
      break
    case 'edit':
      handleEditScript(item)
      break
    case 'delete':
      await handleDeleteScript(item)
      break
  }
}

// 话术增删改查功能

// 新增话术
const handleAddScript = () => {
  editingScriptId.value = null
  scriptForm.value = {
    shortcut: '',
    content: '',
    group_name: '',
    type: activeQuickReplyTab.value === 'personal' ? QuickReplyType.Personal : QuickReplyType.Team
  }
  scriptDialogVisible.value = true
}

// 编辑话术
const handleEditScript = (item: QuickReplyVo) => {
  editingScriptId.value = item.id
  scriptForm.value = {
    shortcut: item.shortcut || '',
    content: item.content || '',
    group_name: item.group_name || '',
    type: item.type
  }

  // 保存分组ID
  if (item.group) {
    ;(scriptForm.value as any).group_id = item.group
  }

  scriptDialogVisible.value = true
}

// 保存话术
const handleSaveScript = async () => {
  if (!scriptForm.value.content.trim()) {
    ElMessage.warning(translate('请输入话术内容'))
    return
  }

  try {
    scriptSaving.value = true

    // 查找或创建分组
    let groupId: string | null = null
    let groupName: string | null = null

    if (scriptForm.value.group_name.trim()) {
      groupName = scriptForm.value.group_name.trim()

      // 如果有分组ID，直接使用
      if ((scriptForm.value as any).group_id) {
        groupId = (scriptForm.value as any).group_id
      } else {
        // 通过分组名称查找
        const existingGroup = allGroups.value.find(g => g.name === groupName)

        if (existingGroup) {
          groupId = existingGroup.id
        } else {
          // 分组不存在，创建新分组
          const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
          const userId = userInfo?.admin?.id || ''

          const newGroup: t_wmt_group = {
            id: '',
            type: GroupType.IM话术分类,
            user: userId,
            name: groupName,
            Parent: undefined,
            AllParent: undefined,
            avtag: true,
            notes: '',
            crtim: undefined,
            uptim: undefined
          }

          const createdGroup = await apiManager.groupApi.AddGroup(newGroup)
          groupId = createdGroup.id
          allGroups.value.push(createdGroup)
        }
      }
    }

    if (editingScriptId.value) {
      // 编辑
      await apiManager.imQuickReplyApi.UpdateQuickReply({
        id: editingScriptId.value,
        shortcut: scriptForm.value.shortcut.trim() || null,
        content: scriptForm.value.content.trim(),
        group: groupId,
        group_name: groupName
      })
      ElMessage.success(translate('话术更新成功'))
    } else {
      // 新增
      await apiManager.imQuickReplyApi.CreateQuickReply({
        shortcut: scriptForm.value.shortcut.trim() || '',
        content: scriptForm.value.content.trim(),
        type: scriptForm.value.type,
        group: groupId,
        group_name: groupName
      })
      ElMessage.success(translate('话术新增成功'))
    }

    // 重新加载话术列表
    await loadQuickReplies()
    scriptDialogVisible.value = false
  } catch (error) {
    console.error('保存话术失败:', error)
  } finally {
    scriptSaving.value = false
  }
}

// 删除话术
const handleDeleteScript = async (item: QuickReplyVo) => {
  try {
    await ElMessageBox.confirm(translate('确定要删除这条话术吗？'), translate('提示'), {
      confirmButtonText: translate('确定'),
      cancelButtonText: translate('取消'),
      type: 'warning'
    })

    await apiManager.imQuickReplyApi.DeleteQuickReply(item.id)
    ElMessage.success(translate('删除成功'))

    // 重新加载话术列表
    await loadQuickReplies()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除话术失败:', error)
    }
  }
}

// 处理Enter键（更新后的版本）

// 插入Emoji
const insertEmoji = (emoji: string) => {
  inputMessage.value += emoji
}

// 处理粘贴事件
const handlePaste = async (event: ClipboardEvent) => {
  if (!activeConversation.value) {
    return
  }

  const items = event.clipboardData?.items
  if (!items) {
    return
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i]

    if (item.type.indexOf('image') !== -1) {
      event.preventDefault()

      const file = item.getAsFile()
      if (!file) {
        continue
      }

      if (file.size > 10 * 1024 * 1024) {
        ElMessage.error(translate('图片大小不能超过10MB'))
        return
      }

      uploadingImage.value = true
      try {
        const formData = new FormData()
        formData.append('file', file)
        const result = await apiManager.apifileApi.Upload(formData)

        if (!result || !result.url) {
          throw new Error('上传失败')
        }

        const replyRequest: ReplyMessageRequest = {
          Content: translate('图片'),
          MsgType: ImMsgType.Image,
          MediaUrls: [result.url]
        }

        await apiManager.imSessionApi.ReplyToCustomer(activeConversation.value.id, replyRequest)

        ElMessage.success(translate('图片发送成功'))

        nextTick(() => {
          scrollToBottom()
        })
      } catch (error) {
        ElMessage.error(translate('图片发送失败'))
        console.error('粘贴图片上传失败:', error)
      } finally {
        uploadingImage.value = false
      }

      break
    }
  }
}

// 触发图片上传
const triggerImageUpload = () => {
  if (!activeConversation.value) {
    ElMessage.warning(translate('请先选择会话'))
    return
  }
  if (uploadingImage.value) {
    return
  }

  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.style.display = 'none'

  document.body.appendChild(input)

  input.onchange = async (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]

    document.body.removeChild(input)

    if (!file || !activeConversation.value) {
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      ElMessage.error(translate('图片大小不能超过10MB'))
      return
    }

    uploadingImage.value = true
    try {
      const formData = new FormData()
      formData.append('file', file)
      const result = await apiManager.apifileApi.Upload(formData)

      if (!result || !result.url) {
        throw new Error('上传失败')
      }

      const replyRequest: ReplyMessageRequest = {
        Content: translate('图片'),
        MsgType: ImMsgType.Image,
        MediaUrls: [result.url]
      }

      await apiManager.imSessionApi.ReplyToCustomer(activeConversation.value!.id, replyRequest)

      ElMessage.success(translate('图片发送成功'))

      nextTick(() => {
        scrollToBottom()
      })
    } catch (error) {
      ElMessage.error(translate('图片发送失败'))
      console.error('图片上传失败:', error)
    } finally {
      uploadingImage.value = false
    }
  }

  input.oncancel = () => {
    document.body.removeChild(input)
  }

  input.click()
}

// 触发视频上传
const triggerVideoUpload = () => {
  if (!activeConversation.value) {
    ElMessage.warning(translate('请先选择会话'))
    return
  }
  if (uploadingVideo.value) {
    return
  }

  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'video/*'
  input.style.display = 'none'

  document.body.appendChild(input)

  input.onchange = async (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]

    document.body.removeChild(input)

    if (!file || !activeConversation.value) {
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      ElMessage.error(translate('视频大小不能超过50MB'))
      return
    }

    uploadingVideo.value = true
    try {
      const formData = new FormData()
      formData.append('file', file)
      const result = await apiManager.apifileApi.Upload(formData)

      if (!result || !result.url) {
        throw new Error('上传失败')
      }

      const replyRequest: ReplyMessageRequest = {
        Content: translate('视频'),
        MsgType: ImMsgType.Video,
        MediaUrls: [result.url]
      }

      await apiManager.imSessionApi.ReplyToCustomer(activeConversation.value!.id, replyRequest)

      ElMessage.success(translate('视频发送成功'))

      nextTick(() => {
        scrollToBottom()
      })
    } catch (error) {
      ElMessage.error(translate('视频发送失败'))
      console.error('视频上传失败:', error)
    } finally {
      uploadingVideo.value = false
    }
  }

  input.oncancel = () => {
    document.body.removeChild(input)
  }

  input.click()
}

// 切换录音状态
const toggleRecording = () => {
  if (!activeConversation.value) {
    ElMessage.warning(translate('请先选择会话'))
    return
  }

  if (isRecording.value) {
    stopRecording()
  } else {
    startRecording()
  }
}

// 开始录音
const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

    const options = { mimeType: 'audio/webm' }
    mediaRecorder.value = new MediaRecorder(stream, options)
    recordedChunks.value = []

    mediaRecorder.value.ondataavailable = event => {
      if (event.data.size > 0) {
        recordedChunks.value.push(event.data)
      }
    }

    mediaRecorder.value.onstop = async () => {
      stream.getTracks().forEach(track => track.stop())
      await handleRecordingComplete()
    }

    mediaRecorder.value.start()
    isRecording.value = true
    recordingTime.value = 0

    recordingTimer.value = window.setInterval(() => {
      recordingTime.value++

      if (recordingTime.value >= 60) {
        stopRecording()
        ElMessage.warning(translate('录音时间不能超过60秒'))
      }
    }, 1000)

    ElMessage.success(translate('开始录音'))
  } catch (error) {
    ElMessage.error(translate('无法访问麦克风，请检查权限设置'))
    console.error('录音失败:', error)
  }
}

// 停止录音
const stopRecording = () => {
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop()
    isRecording.value = false

    if (recordingTimer.value) {
      clearInterval(recordingTimer.value)
      recordingTimer.value = null
    }
  }
}

// 处理录音完成
const handleRecordingComplete = async () => {
  if (recordedChunks.value.length === 0 || !activeConversation.value) {
    return
  }

  try {
    const audioBlob = new Blob(recordedChunks.value, { type: 'audio/webm' })

    const formData = new FormData()
    formData.append('file', audioBlob, `recording_${Date.now()}.webm`)

    const result = await apiManager.apifileApi.Upload(formData)

    if (!result || !result.url) {
      throw new Error('上传失败')
    }

    const replyRequest: ReplyMessageRequest = {
      Content: translate('语音消息'),
      MsgType: ImMsgType.Voice,
      MediaUrls: [result.url]
    }

    await apiManager.imSessionApi.ReplyToCustomer(activeConversation.value.id, replyRequest)

    ElMessage.success(translate('语音发送成功'))

    nextTick(() => {
      scrollToBottom()
    })
  } catch (error) {
    ElMessage.error(translate('语音发送失败'))
    console.error('发送语音失败:', error)
  } finally {
    recordedChunks.value = []
  }
}

// 滚动到底部
const scrollToBottom = () => {
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  }
}

// 加载更多历史消息
const loadMoreMessages = async () => {
  if (!activeConversation.value || !hasMoreMessages.value || loadingMoreMessages.value || isFirstLoad.value) {
    return
  }

  if (activeSessionMessages.value.length === 0) {
    return
  }

  try {
    loadingMoreMessages.value = true

    const oldestMessage = activeSessionMessages.value[0]
    const beforeTime = oldestMessage.sent_at

    const scrollContainer = messagesRef.value
    if (!scrollContainer) return

    const oldScrollHeight = scrollContainer.scrollHeight

    const messages = await apiManager.imSessionApi.GetSessionMessagesStream(activeConversation.value.id, beforeTime)

    if (messages.length < 50) {
      hasMoreMessages.value = false
    }

    if (messages.length > 0) {
      const reversedMessages = [...messages].reverse()
      activeSessionMessages.value = [...reversedMessages, ...activeSessionMessages.value]

      nextTick(() => {
        if (scrollContainer) {
          const newScrollHeight = scrollContainer.scrollHeight
          scrollContainer.scrollTop = newScrollHeight - oldScrollHeight
        }
      })
    }
  } catch (error) {
    console.error('加载更多消息失败:', error)
  } finally {
    loadingMoreMessages.value = false
  }
}

// 监听消息滚动
const handleMessagesScroll = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target) return

  if (target.scrollTop < 50 && hasMoreMessages.value && !loadingMoreMessages.value && !isFirstLoad.value) {
    loadMoreMessages()
  }
}

// 监听会话列表滚动
const handleConversationListScroll = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target) return

  const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight
  if (scrollBottom < 50 && hasMoreSessions.value && !loadingMoreSessions.value) {
    loadMoreSessions()
  }
}

// 格式化时间
const formatTime = (dateTime: Date | string | null | undefined) => {
  if (!dateTime) return ''
  const date = new Date(dateTime)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  if (messageDate.getTime() === today.getTime()) {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 添加标签
const handleAddTag = () => {
  showTagInput.value = true
  nextTick(() => {
    tagInputRef.value?.focus()
  })
}

// 确认添加标签
const handleTagInputConfirm = async () => {
  const tagValue = newTagInput.value.trim()
  if (!tagValue || !activeConversation.value) {
    showTagInput.value = false
    newTagInput.value = ''
    return
  }

  if (customerTags.value.includes(tagValue)) {
    ElMessage.warning(translate('标签已存在'))
    newTagInput.value = ''
    return
  }

  try {
    const tagRequest: TagRequest = {
      Tag: tagValue
    }
    await apiManager.imSessionApi.AddTag(activeConversation.value.id, tagRequest)

    customerTags.value.push(tagValue)
    ElMessage.success(translate('添加标签成功'))
  } catch (error) {
    ElMessage.error(translate('添加标签失败'))
  } finally {
    showTagInput.value = false
    newTagInput.value = ''
  }
}

// 删除标签
const handleTagClose = async (tag: string) => {
  if (!activeConversation.value) return

  try {
    await apiManager.imSessionApi.RemoveTag(activeConversation.value.id, tag)

    customerTags.value = customerTags.value.filter(t => t !== tag)
    ElMessage.success(translate('删除标签成功'))
  } catch (error) {
    ElMessage.error(translate('删除标签失败'))
  }
}

// 保存备注
const handleSaveRemarks = async () => {
  if (!activeConversation.value) return

  savingRemarks.value = true
  try {
    const remarksRequest: RemarksRequest = {
      Remarks: customerRemarks.value
    }
    await apiManager.imSessionApi.UpdateRemarks(activeConversation.value.id, remarksRequest)

    ElMessage.success(translate('保存备注成功'))
  } catch (error) {
    ElMessage.error(translate('保存备注失败'))
  } finally {
    savingRemarks.value = false
  }
}

// 显示右键菜单
const handleContextMenu = (event: MouseEvent, session: CustomerServiceSession) => {
  event.preventDefault()
  contextMenuSession.value = session
  contextMenuPosition.value = { x: event.clientX, y: event.clientY }
  contextMenuVisible.value = true
}

// 关闭右键菜单
const closeContextMenu = () => {
  contextMenuVisible.value = false
}

// 关闭会话
const handleCloseSession = async () => {
  if (!contextMenuSession.value) return

  try {
    await ElMessageBox.prompt(translate('请输入完结说明'), translate('关闭会话'), {
      confirmButtonText: translate('确定'),
      cancelButtonText: translate('取消'),
      inputPattern: /.+/,
      inputErrorMessage: translate('完结说明不能为空')
    }).then(async ({ value }) => {
      const closeRequest: CloseSessionRequest = {
        CloseReason: value
      }
      await apiManager.imSessionApi.CloseSession(contextMenuSession.value!.id, closeRequest)

      ElMessage.success(translate('关闭会话成功'))
      await refreshSessionData({ refreshTotals: true })
      if (activeConversation.value?.id === contextMenuSession.value!.id) {
        activeConversation.value = null
        activeSessionMessages.value = []
      }
    })
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(translate('关闭会话失败'))
    }
  } finally {
    closeContextMenu()
  }
}

// 转交会话
const handleTransferSession = async () => {
  if (!contextMenuSession.value) return

  try {
    const result = await apiManager.imAdminApi.GetOnlineAdmins()
    onlineAdmins.value = result.admins || []

    if (onlineAdmins.value.length === 0) {
      ElMessage.warning(translate('当前没有其他在线客服'))
      closeContextMenu()
      return
    }

    transferDialogVisible.value = true
    closeContextMenu()
  } catch (error) {
    ElMessage.error(translate('获取在线客服列表失败'))
    closeContextMenu()
  }
}

// 确认转交会话
const handleConfirmTransfer = async () => {
  if (!selectedAdminId.value) {
    ElMessage.warning(translate('请选择目标客服'))
    return
  }

  if (!contextMenuSession.value) return

  transferLoading.value = true
  try {
    const transferRequest: TransferSessionRequest = {
      ToAdminId: selectedAdminId.value,
      Remark: transferRemark.value || null
    }
    await apiManager.imSessionApi.TransferSession(contextMenuSession.value.id, transferRequest)

    ElMessage.success(translate('转交会话成功'))
    await refreshSessionData({ refreshTotals: true })
    if (activeConversation.value?.id === contextMenuSession.value.id) {
      activeConversation.value = null
      activeSessionMessages.value = []
    }
    transferDialogVisible.value = false
    selectedAdminId.value = ''
    transferRemark.value = ''
  } catch (error) {
    ElMessage.error(translate('转交会话失败'))
  } finally {
    transferLoading.value = false
  }
}

// 取消转交
const handleCancelTransfer = () => {
  transferDialogVisible.value = false
  selectedAdminId.value = ''
  transferRemark.value = ''
}

// 长按开始
const handleLongPressStart = (event: MouseEvent | TouchEvent, session: CustomerServiceSession) => {
  if (batchMode.value) {
    return
  }

  event.preventDefault()

  longPressTimer.value = window.setTimeout(() => {
    batchMode.value = true
    justEnteredBatchMode.value = true
    selectedSessions.value.add(session.id)
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }
  }, longPressDuration)
}

// 长按结束
const handleLongPressEnd = () => {
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }
}

// 处理会话点击
const handleConversationClick = (session: CustomerServiceSession) => {
  if (justEnteredBatchMode.value) {
    justEnteredBatchMode.value = false
    return
  }

  if (batchMode.value) {
    toggleSessionSelection(session.id)
  } else {
    selectConversation(session)
  }
}

// 切换会话选中状态
const toggleSessionSelection = (sessionId: string) => {
  if (!batchMode.value) {
    return
  }

  if (selectedSessions.value.has(sessionId)) {
    selectedSessions.value.delete(sessionId)
  } else {
    selectedSessions.value.add(sessionId)
  }
}

// 退出批量操作模式
const exitBatchMode = () => {
  batchMode.value = false
  selectedSessions.value.clear()
  justEnteredBatchMode.value = false
}

// 全选/取消全选
const toggleSelectAll = () => {
  if (selectedSessions.value.size === conversationList.value.length) {
    selectedSessions.value.clear()
  } else {
    conversationList.value.forEach(session => {
      selectedSessions.value.add(session.id)
    })
  }
}

const clampHeight = (value: number) => {
  return Math.min(Math.max(value, INPUT_AREA_MIN_HEIGHT), INPUT_AREA_MAX_HEIGHT)
}

const handleInputResizeMouseMove = (event: MouseEvent) => {
  if (!isResizingInputArea.value) {
    return
  }
  const delta = resizeStartY - event.clientY
  const nextHeight = clampHeight(resizeStartHeight + delta)
  inputAreaHeight.value = nextHeight
}

const stopInputAreaResizing = () => {
  if (!isResizingInputArea.value) {
    return
  }
  isResizingInputArea.value = false
  window.removeEventListener('mousemove', handleInputResizeMouseMove)
  window.removeEventListener('mouseup', stopInputAreaResizing)
}

const handleInputResizeMouseDown = (event: MouseEvent) => {
  if (!inputAreaRef.value) {
    return
  }
  event.preventDefault()
  isResizingInputArea.value = true
  resizeStartY = event.clientY
  resizeStartHeight = inputAreaRef.value.offsetHeight
  window.addEventListener('mousemove', handleInputResizeMouseMove)
  window.addEventListener('mouseup', stopInputAreaResizing)
}

// 批量关闭会话
const handleBatchClose = async () => {
  if (selectedSessions.value.size === 0) {
    ElMessage.warning(translate('请至少选择一个会话'))
    return
  }

  try {
    const { value } = await ElMessageBox.prompt(translate('请输入完结说明'), translate('批量关闭会话'), {
      confirmButtonText: translate('确定'),
      cancelButtonText: translate('取消'),
      inputPattern: /.+/,
      inputErrorMessage: translate('完结说明不能为空')
    })

    batchCloseLoading.value = true

    const closePromises = Array.from(selectedSessions.value).map(sessionId => {
      const closeRequest: CloseSessionRequest = {
        CloseReason: value
      }
      return apiManager.imSessionApi.CloseSession(sessionId, closeRequest)
    })

    await Promise.all(closePromises)

    ElMessage.success(translate('批量关闭成功'))

    await refreshSessionData({ refreshTotals: true })

    if (activeConversation.value && selectedSessions.value.has(activeConversation.value.id)) {
      activeConversation.value = null
      activeSessionMessages.value = []
    }

    exitBatchMode()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(translate('批量关闭失败'))
    }
  } finally {
    batchCloseLoading.value = false
  }
}

// 批量转交会话
const handleBatchTransfer = async () => {
  if (selectedSessions.value.size === 0) {
    ElMessage.warning(translate('请至少选择一个会话'))
    return
  }

  try {
    const result = await apiManager.imAdminApi.GetOnlineAdmins()
    onlineAdmins.value = result.admins || []

    if (onlineAdmins.value.length === 0) {
      ElMessage.warning(translate('当前没有其他在线客服'))
      return
    }

    transferDialogVisible.value = true
  } catch (error) {
    ElMessage.error(translate('获取在线客服列表失败'))
  }
}

// 确认批量转交
const handleConfirmBatchTransfer = async () => {
  if (!selectedAdminId.value) {
    ElMessage.warning(translate('请选择目标客服'))
    return
  }

  batchTransferLoading.value = true
  try {
    const transferRequest: TransferSessionRequest = {
      ToAdminId: selectedAdminId.value,
      Remark: transferRemark.value || null
    }

    const transferPromises = Array.from(selectedSessions.value).map(sessionId => {
      return apiManager.imSessionApi.TransferSession(sessionId, transferRequest)
    })

    await Promise.all(transferPromises)

    ElMessage.success(translate('批量转交成功'))

    await refreshSessionData({ refreshTotals: true })

    if (activeConversation.value && selectedSessions.value.has(activeConversation.value.id)) {
      activeConversation.value = null
      activeSessionMessages.value = []
    }

    transferDialogVisible.value = false
    selectedAdminId.value = ''
    transferRemark.value = ''

    exitBatchMode()
  } catch (error) {
    ElMessage.error(translate('批量转交失败'))
  } finally {
    batchTransferLoading.value = false
  }
}

// 获取媒体URL
const getMediaUrl = (message: t_wmt_im_message): string => {
  if (!message.media_urls) {
    return ''
  }

  // 处理字符串格式
  if (typeof message.media_urls === 'string') {
    return message.media_urls
  }

  // 处理数组格式（根据 TsModel 定义，MediaUrls 是 string[]）
  let url = ''
  if (Array.isArray(message.media_urls)) {
    // 取数组第一个元素
    url = message.media_urls[0] || ''
  } else {
    // 兼容对象格式（旧数据可能是对象）
    const values = Object.values(message.media_urls)
    url = (values.find(v => v && typeof v === 'string') as string) || ''
  }

  if (!url) {
    return ''
  }

  let urlObj: URL | null = null

  try {
    urlObj = new URL(url)
  } catch {
    return url
  }

  const host = urlObj.host.toLowerCase()
  const isNeixinHost = host === 'file.neixin.cn' || host.endsWith('.file.neixin.cn')
  const elemeOssHosts = ['paas-file-eleme.oss-cn-zhangjiakou.aliyuncs.com']
  const isElemeOssHost = elemeOssHosts.some(elemeHost => host === elemeHost || host.endsWith(`.${elemeHost}`))

  const pathWithQuery = url.replace(/^https?:\/\/[^/]+/, '') || `${urlObj.pathname}${urlObj.search}`

  console.log('[调试-饿了么] URL处理:', {
    原始URL: url,
    host: host,
    是否饿了么OSS: isElemeOssHost
  })

  // 饿了么 OSS 签名 URL 可以直接访问，不需要代理
  // 注释掉代理逻辑，因为 Vite 中没有配置对应的代理服务器
  // if (isElemeOssHost) {
  //   const proxyUrl = `/proxy-eleme-media${pathWithQuery}`
  //   console.log('[调试-饿了么] 返回代理URL:', proxyUrl)
  //   return proxyUrl
  // }

  // 其他情况直接返回原始 URL（包括 file.neixin.cn）
  // 注释掉代理逻辑，因为 Vite 中没有配置对应的代理服务器
  // if (import.meta.env.DEV && isNeixinHost) {
  //   const siteType = message.site_type || 1
  //   const proxyUrl = `/proxy-media-${siteType}${pathWithQuery}`
  //   return proxyUrl
  // }

  console.log('[调试-饿了么] 返回原始URL:', url)
  return url
}

// 获取视频缩略图
const getVideoThumbnail = (message: t_wmt_im_message): string => {
  if (!message.media_urls || typeof message.media_urls === 'string') {
    return ''
  }

  // 处理数组格式（根据 TsModel 定义，视频消息的 MediaUrls 数组中，第二个元素是缩略图）
  if (Array.isArray(message.media_urls)) {
    return message.media_urls[1] || ''
  }

  // 兼容对象格式（旧数据可能是对象）
  const thumbnailKeys = ['thumbnail', 'thumb', 'poster', 'cover']
  for (const key of thumbnailKeys) {
    if (message.media_urls[key as any]) {
      return message.media_urls[key as any]
    }
  }

  return ''
}

// 获取文件名
const getFileName = (message: t_wmt_im_message): string => {
  // 处理对象格式（旧数据可能将文件名存储在对象中）
  if (
    message.media_urls &&
    typeof message.media_urls !== 'string' &&
    !Array.isArray(message.media_urls) &&
    (message.media_urls as any)['filename']
  ) {
    return (message.media_urls as any)['filename']
  }
  const url = getMediaUrl(message)
  if (url) {
    const parts = url.split('/')
    return parts[parts.length - 1] || translate('未知文件')
  }
  return translate('未知文件')
}

// 下载文件
const downloadFile = (message: t_wmt_im_message) => {
  const url = getMediaUrl(message)
  if (!url) {
    ElMessage.warning(translate('无可用下载链接'))
    return
  }
  window.open(url, '_blank')
}

// 播放语音 - 支持AMR格式
const playAudio = async (message: t_wmt_im_message) => {
  const audioUrl = getMediaUrl(message)
  if (!audioUrl) {
    ElMessage.warning(translate('无可用音频链接'))
    return
  }

  const audioId = 'audio-' + message.id

  // 如果正在播放同一个音频，则停止播放
  if (currentPlayingAudioId.value === audioId) {
    if (amrPlayer.value) {
      try {
        amrPlayer.value.stop()
      } catch (error) {
        console.error('停止播放失败:', error)
      }
      amrPlayer.value = null
    }
    currentPlayingAudioId.value = ''
    return
  }

  // 停止之前的播放
  if (amrPlayer.value) {
    try {
      amrPlayer.value.stop()
    } catch (error) {
      console.error('停止之前的播放失败:', error)
    }
    amrPlayer.value = null
  }

  loadingAudioId.value = audioId

  try {
    console.log('开始加载AMR音频:', audioUrl)

    amrPlayer.value = new BenzAMRRecorder()

    await amrPlayer.value.initWithUrl(audioUrl)
    console.log('AMR解码成功，音频时长:', amrPlayer.value.getDuration(), '秒')

    loadingAudioId.value = ''
    currentPlayingAudioId.value = audioId

    amrPlayer.value.onEnded(() => {
      console.log('AMR音频播放结束')
      currentPlayingAudioId.value = ''
    })

    amrPlayer.value.onStop(() => {
      console.log('AMR音频停止')
      currentPlayingAudioId.value = ''
    })

    amrPlayer.value.play()
    console.log('开始播放AMR音频')
  } catch (error) {
    console.error('播放音频失败:', error)
    ElMessage.warning(translate('语音播放失败，请尝试下载收听'))
    loadingAudioId.value = ''
    currentPlayingAudioId.value = ''
    amrPlayer.value = null
  }
}

// 更新会话列表中指定会话的信息
const updateSessionInList = (sessionId: string, updates: Partial<CustomerServiceSession>) => {
  const sessionIndex = conversationList.value.findIndex(s => s.id === sessionId)
  if (sessionIndex !== -1) {
    conversationList.value[sessionIndex] = {
      ...conversationList.value[sessionIndex],
      ...updates
    }

    const updatedSession = conversationList.value[sessionIndex]
    conversationList.value.splice(sessionIndex, 1)
    conversationList.value.unshift(updatedSession)

    return true
  }
  return false
}

// 将 ImMessage 转换为 t_wmt_im_message 格式
const convertImMessageToTableFormat = (message: ImMessage): t_wmt_im_message => {
  return {
    id: message.MsgUid,
    session_id: message.SessionId,
    shop_id: message.ShopId,
    site_type: message.SiteType,
    msg_uid: message.MsgUid,
    direction: message.Direction,
    msg_type: message.MsgType,
    trigger_type: 1,
    content: message.Content,
    media_urls: message.MediaUrls || null,
    sent_at: message.Timestamp,
    is_read: false,
    site_data: null as any,
    crtim: message.Timestamp,
    uptim: message.Timestamp,
    avtag: true,
    notes: null,
    ExTime: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
  } as unknown as t_wmt_im_message
}

// SignalR 消息接收处理
const handleSignalRMessage = async (message: ImMessage) => {
  console.log('[客服系统] 收到SignalR消息:', {
    messageSessionId: message.SessionId,
    messageSessionIdType: typeof message.SessionId,
    activeConversationId: activeConversation.value?.id,
    activeConversationIdType: typeof activeConversation.value?.id,
    isMatch: activeConversation.value && String(message.SessionId) === String(activeConversation.value.id),
    message
  })

  // 使用 String() 进行类型转换，确保比较的是字符串
  const isCurrentSession = activeConversation.value && String(message.SessionId) === String(activeConversation.value.id)

  if (isCurrentSession) {
    console.log('[客服系统] 消息属于当前会话，添加到聊天界面')
    const newMessage = convertImMessageToTableFormat(message)

    const messageExists = activeSessionMessages.value.some(m => m.msg_uid === newMessage.msg_uid)
    if (!messageExists) {
      activeSessionMessages.value.push(newMessage)

      nextTick(() => {
        scrollToBottom()
      })
    }

    updateSessionInList(message.SessionId, {
      last_message: message.MessagePreview,
      last_message_time: message.Timestamp
    })
  } else {
    console.log('[客服系统] 消息不属于当前会话，更新会话列表')
    const existingSession = conversationList.value.find(s => String(s.id) === String(message.SessionId))

    if (existingSession) {
      // 更新会话列表中的消息预览和未读数
      updateSessionInList(message.SessionId, {
        last_message: message.MessagePreview,
        last_message_time: message.Timestamp,
        unread_count: (existingSession.unread_count || 0) + 1
      })

      // 如果当前没有打开任何会话，自动打开这个有新消息的会话
      if (!activeConversation.value) {
        console.log('[客服系统] 当前没有打开会话，自动打开新消息所在的会话')
        // 等待一小段时间，让会话列表更新完成
        await nextTick()
        // 自动选择这个会话
        await selectConversation(existingSession)
      }
    } else {
      // 会话不在列表中，刷新会话列表
      await fetchSessionList()
    }
  }
}

// SignalR 会话事件处理
const handleSessionEvent = async (event: SessionEvent) => {
  console.log('收到会话事件:', event.type, event.data)

  switch (event.type) {
    case 'SessionAssigned':
      await fetchSessionList()
      break

    case 'SessionTransferred':
      if (event.data.IsTransferIn) {
        await fetchSessionList()
      } else {
        const sessionIndex = conversationList.value.findIndex(s => s.id === event.data.SessionId)
        if (sessionIndex !== -1) {
          conversationList.value.splice(sessionIndex, 1)
        }

        if (activeConversation.value && event.data.SessionId === activeConversation.value.id) {
          activeConversation.value = null
          activeSessionMessages.value = []
        }
      }
      break

    case 'SessionStatusChanged':
      updateSessionInList(event.data.SessionId, {
        status: event.data.Status,
        last_admin_reply_at: event.data.LastAdminReplyAt || undefined
      })

      if (activeConversation.value && event.data.SessionId === activeConversation.value.id) {
        activeConversation.value.status = event.data.Status
        if (event.data.LastAdminReplyAt) {
          activeConversation.value.last_admin_reply_at = event.data.LastAdminReplyAt
        }
      }
      break

    case 'SessionTagsUpdated':
      updateSessionInList(event.data.SessionId, {
        tags: event.data.Tags
      })

      if (activeConversation.value && event.data.SessionId === activeConversation.value.id) {
        activeConversation.value.tags = event.data.Tags
        customerTags.value = event.data.Tags || []
      }
      break

    case 'SessionRemarksUpdated':
      updateSessionInList(event.data.SessionId, {
        remarks: event.data.Remarks
      })

      if (activeConversation.value && event.data.SessionId === activeConversation.value.id) {
        activeConversation.value.remarks = event.data.Remarks
        customerRemarks.value = event.data.Remarks || ''
      }
      break
  }
}

// 监听标签页切换
watch(activeTab, async () => {
  await fetchSessionList()
})

// 初始化时注册SignalR消息监听并加载会话数据
onMounted(async () => {
  // 检查用户是否已经有客服角色,如果有就自动连接SignalR
  if (isCustomerService.value) {
    console.log('[客服系统] 用户已有客服角色,自动连接SignalR')
    await connectToSignalR()
  } else {
    console.log('[客服系统] 用户没有客服角色,需要手动开启IM客服功能')
    imServiceEnabled.value = false
  }

  // 加载会话列表及统计
  await refreshSessionData({ refreshTotals: true })

  // 加载快捷回复列表
  await loadQuickReplies()

  // 建立 signalRManager 到 imEventBus 的消息转发桥接
  // 当 signalRManager 收到消息时，转发到 imEventBus
  const handleSignalRBridgeMessage = (message: ImMessage) => {
    console.log('[客服系统] signalRManager 收到消息，转发到 imEventBus:', message)
    imEventBus.emitMessage(message)
  }
  signalRManager.onMessageReceived(handleSignalRBridgeMessage)
  // 保存清理函数
  signalRMessageOff = () => {
    signalRManager.offMessageReceived(handleSignalRBridgeMessage)
  }

  // 当 signalRManager 收到会话事件时，转发到 imEventBus
  const handleSignalRBridgeSessionEvent = (event: SessionEvent) => {
    console.log('[客服系统] signalRManager 收到会话事件，转发到 imEventBus:', event)
    imEventBus.emitSessionEvent(event)
  }
  signalRManager.onSessionEvent(handleSignalRBridgeSessionEvent)
  // 保存清理函数
  signalRSessionEventOff = () => {
    signalRManager.offSessionEvent(handleSignalRBridgeSessionEvent)
  }

  // 注册 imEventBus 消息接收回调
  messageOff = imEventBus.onMessage(handleSignalRMessage)
  sessionEventOff = imEventBus.onSessionEvent(handleSessionEvent)

  nextTick(() => {
    if (inputAreaRef.value) {
      inputAreaHeight.value = clampHeight(inputAreaRef.value.offsetHeight)
    }
  })
})

// 组件卸载时移除SignalR消息监听
onUnmounted(() => {
  // 移除 signalRManager 的回调
  signalRMessageOff?.()
  signalRSessionEventOff?.()
  signalRMessageOff = null
  signalRSessionEventOff = null

  // 移除 imEventBus 的回调
  messageOff?.()
  sessionEventOff?.()
  messageOff = null
  sessionEventOff = null

  // 停止并清理AMR播放器
  if (amrPlayer.value) {
    try {
      amrPlayer.value.stop()
    } catch (error) {
      // 忽略错误
    }
    amrPlayer.value = null
  }

  // 清理录音相关资源
  if (isRecording.value) {
    stopRecording()
  }
  if (recordingTimer.value) {
    clearInterval(recordingTimer.value)
  }

  stopInputAreaResizing()
})
</script>

<style lang="scss" scoped>
.customer-service-chat {
  flex: 1; // 使用 flex: 1 填充父容器（el-drawer__body）的剩余空间
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;

  .customer-service-content {
    flex: 1;
    display: flex;
    min-height: 0;
    height: 100%; // 明确设置高度为 100%
    background: var(--el-color-white);
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    overflow: hidden;

    .conversation-panel {
      width: 320px;
      min-width: 320px;
      background: var(--el-fill-color-light);
      border-right: 1px solid var(--el-border-color);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;

      .panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px;
        background: var(--el-color-white);
        border-bottom: 1px solid var(--el-border-color);
        height: 56px;

        .header-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
      }

      .conversation-tabs {
        display: flex;
        padding: 0 16px;
        border-bottom: 1px solid var(--el-border-color);
        height: 56px;
        align-items: center;

        .tab-item {
          flex: 1;
          padding: 16px 0;
          font-size: var(--el-font-size-medium);
          text-align: center;
          color: var(--el-text-color-regular);
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.3s ease;

          &.active {
            color: var(--el-color-primary);
            border-bottom-color: var(--el-color-primary);
          }

          &:hover {
            color: var(--el-color-primary);
          }
        }

        .im-service-switch {
          margin-left: auto;
          padding-left: 16px;
          flex-shrink: 0;
        }

        .batch-mode-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 0;

          .selected-count {
            flex: 1;
            text-align: center;
            font-size: var(--el-font-size-base);
            font-weight: 500;
            color: var(--el-color-primary);
          }
        }
      }

      .conversation-list {
        flex: 1;
        overflow-y: auto;
        padding: 8px 0;

        .empty-list {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
        }

        .loading-more-sessions,
        .no-more-sessions {
          text-align: center;
          padding: 12px 0;
          font-size: var(--el-font-size-small);
          color: var(--el-text-color-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .loading-more-sessions {
          .el-icon {
            font-size: 16px;
          }
        }

        .no-more-sessions {
          margin-top: 8px;
        }

        .conversation-item {
          display: flex;
          align-items: center;
          padding: 12px 8px;
          cursor: pointer;
          transition: background-color 0.3s ease;
          user-select: none;

          &:hover {
            background-color: var(--el-fill-color-light);
          }

          &.active {
            background-color: var(--el-color-primary-light-9);
          }

          &.selected {
            background-color: var(--el-color-primary-light-8);
            border-left: 3px solid var(--el-color-primary);
          }

          &.batch-mode {
            padding-left: 8px;
          }

          .conversation-checkbox {
            margin-right: 8px;
            flex-shrink: 0;
          }

          .conversation-avatar {
            position: relative;
            margin-right: 4px;

            .shop-avatar,
            .platform-icon {
              width: 36px;
              height: 36px;
              border-radius: 50%;
              object-fit: cover;
              background: var(--el-fill-color);
            }

            .avatar-placeholder {
              width: 36px;
              height: 36px;
              border-radius: 50%;
              background: var(--el-fill-color);
              display: flex;
              align-items: center;
              justify-content: center;
              color: var(--el-text-color-placeholder);
            }

            .unread-dot {
              position: absolute;
              top: -2px;
              right: -2px;
              min-width: 16px;
              height: 16px;
              padding: 0 4px;
              background: var(--el-color-danger);
              border-radius: 8px;
              border: 2px solid var(--el-color-white);
              font-size: 10px;
              color: var(--el-color-white);
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
            }
          }

          .conversation-content {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 4px;

            .conversation-top {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 8px;

              .shop-name {
                flex: 1;
                font-size: var(--el-font-size-small);
                color: var(--el-text-color-primary);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }

              .platform-info {
                display: flex;
                align-items: center;
                gap: 6px;
                flex-shrink: 0;

                .platform-icon-mini {
                  width: 18px;
                  height: 18px;
                  border-radius: 50%;
                  object-fit: cover;
                  background: var(--el-fill-color);
                }

                .platform-tag {
                  font-size: 10px;
                  height: 18px;
                  line-height: 18px;
                  padding: 0 4px;
                  border-radius: 2px;
                  flex-shrink: 0;
                  border: 1px solid var(--el-color-primary);
                  background: var(--el-color-primary-light-9);
                  color: var(--el-color-primary);
                  display: flex;
                  align-items: center;
                  gap: 4px;

                  .platform-icon-inline {
                    width: 14px;
                    height: 14px;
                    flex-shrink: 0;
                  }
                }
              }
            }

            .conversation-middle {
              display: flex;
              align-items: center;

              .customer-name {
                flex: 1;
                font-size: var(--el-font-size-small);
                font-weight: 500;
                color: var(--el-text-color-primary);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
            }

            .conversation-bottom {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 8px;

              .last-message {
                flex: 1;
                font-size: var(--el-font-size-extra-small);
                color: var(--el-text-color-regular);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }

              .conversation-time {
                font-size: var(--el-font-size-extra-small);
                color: var(--el-text-color-placeholder);
                white-space: nowrap;
                flex-shrink: 0;
              }
            }
          }
        }
      }

      .batch-action-bar {
        padding: 12px 16px;
        border-top: 1px solid var(--el-border-color);
        background: var(--el-fill-color-light);
        display: flex;
        gap: 12px;
        flex-shrink: 0;

        .el-button {
          flex: 1;
        }
      }
    }

    .empty-right-panel {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--el-color-white);
      border: 1px solid var(--el-border-color);
      border-radius: 4px;
      min-height: 0;
    }

    .chat-panel {
      flex: 1;
      min-width: 400px;
      background: var(--el-color-white);
      border-right: 1px solid var(--el-border-color);
      display: flex;
      flex-direction: column;

      .chat-header {
        height: 56px;
        padding: 0 20px;
        background: var(--el-fill-color-light);
        border-bottom: 1px solid var(--el-border-color);
        display: flex;
        justify-content: space-between;
        align-items: center;

        .customer-info {
          display: flex;
          align-items: center;
          gap: 12px;

          .platform-icon-header {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            object-fit: cover;
            background: var(--el-fill-color);
          }

          .header-text {
            display: flex;
            flex-direction: column;
            gap: 4px;

            .customer-name {
              font-size: var(--el-font-size-base);
              font-weight: 500;
              color: var(--el-text-color-primary);
            }

            .shop-name-small {
              font-size: 12px;
              color: var(--el-text-color-secondary);
            }
          }
        }

        .detail-toggle-btn {
          color: var(--el-text-color-regular);
          transition: all 0.3s ease;
          padding: 8px;

          &:hover {
            color: var(--el-color-primary);
            background: var(--el-fill-color);
            border-radius: 4px;
          }
        }
      }

      .messages-container {
        flex: 1;
        overflow-y: auto;
        padding: 20px;

        .empty-chat {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .messages-list {
          .loading-more-tip,
          .no-more-tip {
            text-align: center;
            padding: 12px 0;
            font-size: var(--el-font-size-small);
            color: var(--el-text-color-secondary);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }

          .loading-more-tip {
            .el-icon {
              font-size: 16px;
            }
          }

          .no-more-tip {
            margin-bottom: 12px;
          }

          .message-item {
            display: flex;
            margin-bottom: 16px;

            &.customer {
              .message-content {
                margin-left: 12px;
              }
            }

            &.agent {
              flex-direction: row-reverse;

              .message-content {
                margin-right: 12px;
                align-items: flex-end;
              }
            }

            .message-avatar {
              padding-top: 20px;

              .platform-icon {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                object-fit: cover;
                background: var(--el-fill-color);
              }

              .avatar-placeholder {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: var(--el-fill-color);
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--el-text-color-placeholder);
              }
            }

            .message-content {
              display: flex;
              flex-direction: column;
              align-items: flex-start;

              .message-header {
                font-size: var(--el-font-size-extra-small);
                color: var(--el-text-color-secondary);
                margin-bottom: 4px;
              }

              .message-bubble {
                max-width: 300px;
                padding: 12px 16px;
                border-radius: 12px;
                font-size: var(--el-font-size-small);
                line-height: 1.4;

                &.customer {
                  background: var(--el-fill-color-light);
                  color: var(--el-text-color-primary);
                }

                &.agent {
                  background: var(--el-color-primary);
                  color: var(--el-color-white);
                }

                &:has(.media-image),
                &:has(.media-video) {
                  padding: 4px;
                }

                .media-image {
                  padding: 0;
                  border-radius: 8px;
                  overflow: hidden;
                  max-width: 280px;

                  .el-image {
                    width: 100%;
                    max-height: 300px;
                    display: block;
                    cursor: pointer;
                    border-radius: 8px;
                  }

                  .image-error {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 40px 20px;
                    background: var(--el-fill-color-lighter);
                    color: var(--el-text-color-placeholder);
                    gap: 8px;

                    .el-icon {
                      font-size: 32px;
                    }
                  }
                }

                .image-error-placeholder {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  padding: 40px 20px;
                  background: var(--el-fill-color-lighter);
                  color: var(--el-text-color-placeholder);
                  gap: 8px;
                  border-radius: 8px;
                  min-width: 200px;

                  .el-icon {
                    font-size: 32px;
                  }

                  .error-detail {
                    margin-top: 8px;
                    font-size: var(--el-font-size-small);
                    text-align: center;
                    opacity: 0.8;
                  }
                }

                .media-error-placeholder {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  padding: 30px 20px;
                  background: var(--el-fill-color-lighter);
                  color: var(--el-text-color-placeholder);
                  gap: 8px;
                  border-radius: 8px;
                  min-width: 180px;

                  .el-icon {
                    font-size: 28px;
                  }
                }

                .media-video {
                  padding: 0;
                  border-radius: 8px;
                  overflow: hidden;
                  max-width: 300px;

                  video {
                    width: 100%;
                    max-height: 300px;
                    display: block;
                    border-radius: 8px;
                    background: var(--el-color-black);
                  }
                }

                .media-audio {
                  display: flex;
                  align-items: center;
                  gap: 12px;
                  padding: 12px;
                  min-width: 220px;

                  .audio-icon {
                    font-size: 28px;
                    flex-shrink: 0;
                    transition: all 0.3s ease;
                  }

                  .audio-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;

                    .audio-text {
                      font-size: var(--el-font-size-base);
                      font-weight: 500;
                    }

                    .audio-actions {
                      display: flex;
                      gap: 8px;
                    }
                  }

                  &.playing {
                    .audio-icon {
                      animation: audioPlaying 1s ease-in-out infinite;
                    }
                  }
                }

                @keyframes audioPlaying {
                  0%,
                  100% {
                    transform: scale(1);
                  }

                  50% {
                    transform: scale(1.15);
                  }
                }

                .media-file {
                  display: flex;
                  align-items: center;
                  gap: 12px;
                  padding: 8px;
                  cursor: pointer;
                  transition: all 0.3s ease;
                  border-radius: 8px;
                  min-width: 200px;

                  .file-icon {
                    font-size: 32px;
                    flex-shrink: 0;
                  }

                  .file-info {
                    flex: 1;

                    .file-name {
                      font-size: var(--el-font-size-base);
                      font-weight: 500;
                      margin-bottom: 4px;
                      word-break: break-all;
                    }

                    .file-action {
                      display: flex;
                      align-items: center;
                      gap: 4px;
                      font-size: var(--el-font-size-small);
                      opacity: 0.8;
                    }
                  }
                }

                &.customer .media-file:hover {
                  background: rgba(0, 0, 0, 0.05);
                }

                &.agent .media-file:hover {
                  background: rgba(255, 255, 255, 0.1);
                }

                .order-card {
                  display: flex;
                  align-items: center;
                  gap: 12px;
                  padding: 12px;
                  border: 1px solid rgba(255, 255, 255, 0.2);
                  border-radius: 8px;
                  min-width: 200px;

                  .order-icon {
                    font-size: 28px;
                    flex-shrink: 0;
                  }

                  .order-content {
                    flex: 1;
                    font-size: var(--el-font-size-base);
                  }
                }

                .unknown-message {
                  opacity: 0.7;
                  font-style: italic;
                }
              }

              .message-time {
                font-size: 11px;
                color: var(--el-text-color-placeholder);
                margin-top: 4px;
              }
            }
          }
        }
      }

      .input-area {
        padding: 1px 10px 5px;
        border-top: 1px solid var(--el-border-color);
        display: flex;
        flex-direction: column;
        gap: 2px;
        position: relative;
        overflow: hidden;

        .input-resize-handle {
          position: absolute;
          top: -6px;
          left: 0;
          right: 0;
          height: 12px;
          cursor: ns-resize;
          z-index: 1;
        }

        .input-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 0;

          .toolbar-left {
            display: flex;
            align-items: center;
            gap: 4px;
          }

          .toolbar-btn,
          .upload-trigger {
            color: var(--el-text-color-regular);
            transition: all 0.3s ease;
            padding: 4px 6px;
            cursor: pointer;
            min-width: auto;

            &:hover {
              color: var(--el-color-primary);
              transform: scale(1.1);
            }

            &.recording {
              color: var(--el-color-danger);
              animation: pulse 1.5s ease-in-out infinite;
            }

            .emoji-icon {
              font-size: 18px;
              display: inline-block;
              line-height: 1;
              transition: all 0.3s ease;
            }

            &.emoji-btn:hover .emoji-icon {
              transform: scale(1.15);
            }
          }

          .is-loading {
            animation: rotating 2s linear infinite;
          }

          @keyframes rotating {
            0% {
              transform: rotate(0deg);
            }

            100% {
              transform: rotate(360deg);
            }
          }
        }

        .recording-indicator {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: var(--el-color-danger-light-9);
          border-radius: 8px;
          border: 1px solid var(--el-color-danger-light-7);

          .recording-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: var(--el-color-danger);
            animation: blink 1s ease-in-out infinite;
          }

          span {
            flex: 1;
            color: var(--el-color-danger);
            font-weight: 500;
          }
        }

        .el-input {
          flex: 1;
        }

        .input-textarea {
          display: flex;
          flex: 1;

          :deep(textarea) {
            height: 100% !important;
            min-height: 96px;
            resize: none;
            overflow-y: auto;
          }
        }

        .input-wrapper {
          position: relative;
          flex: 1;
          display: flex;
        }
      }
    }

    .customer-detail-panel {
      width: 320px;
      min-width: 320px;
      background: var(--el-color-white);
      border-left: 1px solid var(--el-border-color);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;

      .detail-tabs {
        height: 48px;
        display: flex;
        background: var(--el-fill-color-light);
        border-bottom: 1px solid var(--el-border-color);

        .detail-tab-item {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 14px;
          color: var(--el-text-color-regular);
          transition: all 0.3s;
          position: relative;

          &:hover {
            color: var(--el-color-primary);
            background: var(--el-fill-color);
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
              background: var(--el-color-primary);
            }
          }
        }
      }

      .customer-detail-header {
        height: 56px;
        padding: 0 16px;
        background: var(--el-fill-color-light);
        border-bottom: 1px solid var(--el-border-color);
        display: flex;
        align-items: center;

        .title {
          font-size: var(--el-font-size-base);
          font-weight: 500;
          color: var(--el-text-color-primary);
        }
      }

      .customer-detail-content {
        flex: 1;
        overflow-y: auto;
        padding: 16px;

        .detail-section {
          margin-bottom: 24px;

          &:last-child {
            margin-bottom: 0;
          }

          .section-title {
            font-size: var(--el-font-size-base);
            font-weight: 500;
            color: var(--el-text-color-primary);
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid var(--el-border-color-lighter);
          }

          .tags-container {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            align-items: center;

            .customer-tag {
              margin: 0;
            }

            .tag-input {
              width: 100px;
            }
          }

          .remarks-container {
            display: flex;
            flex-direction: column;
          }

          .order-info-container {
            background: var(--el-fill-color-light);
            border-radius: 4px;
            padding: 12px;

            .info-group {
              margin-bottom: 16px;

              &:last-child {
                margin-bottom: 0;
              }

              .group-title {
                font-size: var(--el-font-size-small);
                font-weight: 500;
                color: var(--el-text-color-regular);
                margin-bottom: 8px;
                padding-left: 8px;
                border-left: 3px solid var(--el-color-primary);
              }

              .info-row {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                padding: 6px 0;
                font-size: var(--el-font-size-small);

                &.highlight {
                  background: var(--el-color-primary-light-9);
                  padding: 8px;
                  border-radius: 4px;
                  margin: 4px 0;
                }

                .info-label {
                  color: var(--el-text-color-regular);
                  min-width: 70px;
                  flex-shrink: 0;
                }

                .info-value {
                  color: var(--el-text-color-primary);
                  text-align: right;
                  word-break: break-all;
                  flex: 1;

                  &.status {
                    color: var(--el-color-primary);
                    font-weight: 500;
                  }

                  &.price {
                    color: var(--el-color-danger);
                    font-weight: 500;
                    font-size: var(--el-font-size-base);
                  }

                  &.address {
                    text-align: left;
                    margin-left: 8px;
                    line-height: 1.5;
                  }

                  &.summary {
                    color: var(--el-text-color-regular);
                    font-size: var(--el-font-size-small);
                  }

                  &.remark {
                    text-align: left;
                    color: var(--el-text-color-regular);
                    line-height: 1.5;
                    padding: 8px;
                    background: var(--el-color-warning-light-9);
                    border-radius: 4px;
                    font-style: italic;
                  }
                }
              }

              .food-items {
                margin-top: 8px;
                border-top: 1px solid var(--el-border-color-lighter);
                padding-top: 8px;

                .food-item {
                  display: flex;
                  align-items: center;
                  padding: 6px 0;
                  font-size: var(--el-font-size-small);
                  gap: 8px;

                  &:not(:last-child) {
                    border-bottom: 1px dashed var(--el-border-color-lighter);
                  }

                  .food-name {
                    flex: 1;
                    color: var(--el-text-color-primary);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                  }

                  .food-spec {
                    color: var(--el-text-color-secondary);
                    font-size: 12px;
                    flex-shrink: 0;
                  }

                  .food-quantity {
                    color: var(--el-text-color-regular);
                    flex-shrink: 0;
                    min-width: 30px;
                  }

                  .food-price {
                    color: var(--el-text-color-primary);
                    font-weight: 500;
                    flex-shrink: 0;
                    min-width: 50px;
                    text-align: right;
                  }
                }
              }
            }
          }
        }
      }

      // 快捷回复样式
      .quick-reply-section {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;

        .quick-reply-header {
          padding: 16px;
          border-bottom: 1px solid var(--el-border-color-lighter);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;

          .header-left {
            flex: 1;

            .title {
              font-size: 14px;
              font-weight: 500;
              color: var(--el-text-color-primary);
              margin-bottom: 4px;
            }

            .description {
              font-size: 12px;
              color: var(--el-text-color-secondary);
            }
          }

          .header-right {
            flex-shrink: 0;
          }
        }

        .quick-reply-tabs {
          display: flex;
          padding: 8px 16px;
          border-bottom: 1px solid var(--el-border-color-lighter);
          gap: 16px;

          .quick-reply-tab {
            padding: 6px 12px;
            cursor: pointer;
            font-size: 14px;
            color: var(--el-text-color-regular);
            border-radius: 4px;
            transition: all 0.3s;

            &:hover {
              background: var(--el-fill-color-light);
              color: var(--el-color-primary);
            }

            &.active {
              background: var(--el-color-primary-light-9);
              color: var(--el-color-primary);
              font-weight: 500;
            }
          }
        }

        .quick-reply-toolbar {
          padding: 12px 16px;
          border-bottom: 1px solid var(--el-border-color-lighter);

          .search-input {
            width: 100%;
            margin-bottom: 8px;
          }

          .toolbar-buttons {
            display: flex;
            gap: 8px;
          }
        }

        .quick-reply-groups {
          flex: 1;
          overflow-y: auto;
          padding: 8px 0;

          .empty-state {
            padding: 40px 16px;
            text-align: center;
          }

          .reply-group {
            margin-bottom: 4px;

            .group-header {
              padding: 10px 16px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 8px;
              transition: background 0.2s;

              &:hover {
                background: var(--el-fill-color-light);

                .group-actions {
                  opacity: 1;
                }
              }

              .group-title-area {
                flex: 1;
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;

                .collapse-icon {
                  transition: transform 0.3s;
                  color: var(--el-text-color-secondary);
                  flex-shrink: 0;

                  &.collapsed {
                    transform: rotate(-90deg);
                  }
                }

                .group-name {
                  flex: 1;
                  font-size: 14px;
                  font-weight: 500;
                  color: var(--el-text-color-primary);
                }

                .group-count {
                  font-size: 12px;
                  color: var(--el-text-color-secondary);
                }
              }

              .group-actions {
                flex-shrink: 0;
                display: flex;
                gap: 2px;
                opacity: 0;
                transition: opacity 0.2s;

                .el-button {
                  padding: 4px 6px;
                }
              }
            }

            .group-items {
              .empty-group {
                padding: 20px 16px;
                text-align: center;

                .el-empty {
                  padding: 0;
                }
              }

              .reply-item {
                padding: 10px 16px 10px 40px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 8px;
                transition: background 0.2s;
                border-bottom: 1px solid var(--el-fill-color);

                &:hover {
                  background: var(--el-fill-color-light);

                  .item-actions {
                    opacity: 1;
                  }
                }

                .item-content {
                  flex: 1;
                  font-size: 13px;
                  line-height: 1.6;
                  color: var(--el-text-color-primary);
                  word-break: break-word;
                  cursor: pointer;
                }

                .item-actions {
                  flex-shrink: 0;
                  display: flex;
                  align-items: center;
                  gap: 4px;
                  opacity: 0;
                  transition: opacity 0.2s;

                  .send-btn {
                    color: var(--el-color-primary);
                    font-size: 16px;

                    &:hover {
                      color: var(--el-color-primary);
                      background: var(--el-color-primary-light-9);
                    }
                  }

                  .more-btn {
                    color: var(--el-text-color-secondary);

                    &:hover {
                      color: var(--el-color-primary);
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

// 右键菜单样式
.context-menu {
  position: fixed;
  z-index: 10000;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 4px 0;
  min-width: 120px;

  .context-menu-item {
    padding: 8px 16px;
    cursor: pointer;
    font-size: var(--el-font-size-base);
    color: var(--el-text-color-primary);
    transition: all 0.3s ease;

    &:hover {
      background: var(--el-fill-color-light);
      color: var(--el-color-primary);
    }
  }
}

.context-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background: transparent;
}

// Emoji 选择器样式
.emoji-picker {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 8px;
  padding: 8px;
  max-height: 300px;
  overflow-y: auto;

  .emoji-item {
    font-size: 24px;
    cursor: pointer;
    text-align: center;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s ease;

    &:hover {
      background: var(--el-fill-color-light);
      transform: scale(1.2);
    }
  }
}

// 录音动画
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.3;
  }
}

// 全局样式 - 输入联想下拉框（通过 teleport 到 body）
.autocomplete-dropdown-overlay {
  position: fixed;
  max-height: 300px;
  overflow-y: auto;
  background: var(--el-color-white);
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  transform: translateY(-100%);

  .autocomplete-item {
    padding: 8px 12px;
    cursor: pointer;
    border-bottom: 1px solid var(--el-fill-color);
    transition: all 0.15s ease; // 加快过渡动画
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    border-left: 3px solid transparent; // 添加左边框用于选中指示

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: var(--el-fill-color-light);
    }

    &.active {
      background: var(--el-color-primary-light-9); // 更明显的背景色
      border-left-color: var(--el-color-primary); // 左侧蓝色指示条
      box-shadow: inset 0 0 0 1px var(--el-color-primary-light-7); // 内边框
    }

    .item-left {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 0; // 允许内容收缩
      overflow: hidden;

      .item-shortcut {
        font-size: 12px;
        color: var(--el-color-primary);
        font-weight: 500;
        background: var(--el-color-primary-light-9);
        padding: 2px 6px;
        border-radius: 3px;
        flex-shrink: 0;
      }

      .item-separator {
        color: var(--el-text-color-secondary);
        flex-shrink: 0;
      }

      .item-content {
        font-size: 13px;
        color: var(--el-text-color-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        :deep(.keyword-highlight) {
          background: var(--el-color-warning-light-9);
          color: var(--el-color-warning);
          font-weight: 500;
          padding: 0 2px;
          border-radius: 2px;
        }
      }
    }

    .item-right {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
      font-size: 12px;

      .item-type {
        color: var(--el-color-success);
        background: var(--el-color-success-light-9);
        padding: 2px 6px;
        border-radius: 3px;
        white-space: nowrap;
      }

      .item-separator {
        color: var(--el-text-color-secondary);
      }

      .item-group {
        color: var(--el-text-color-secondary);
        white-space: nowrap;
      }
    }
  }
}
</style>
