<template>
  <div class="notifications-container">
    <el-card class="notifications-card">
      <template #header>
        <div class="card-header">
          <span>消息通知</span>
          <div class="header-actions">
            <el-button type="primary" plain @click="markAllAsRead">全部已读</el-button>
            <el-button type="danger" plain @click="deleteSelected">删除选中</el-button>
          </div>
        </div>
      </template>

      <!-- 消息分类标签页 -->
      <el-tabs v-model="activeTab" @tab-click="handleTabClick" class="notification-tabs">
        <el-tab-pane label="全部消息" name="all">
          <span class="tab-badge" v-if="unreadCount > 0">{{ unreadCount }}</span>
        </el-tab-pane>
        <el-tab-pane label="未读消息" name="unread">
          <span class="tab-badge" v-if="unreadCount > 0">{{ unreadCount }}</span>
        </el-tab-pane>
        <el-tab-pane label="课程通知" name="course">
          <span class="tab-badge" v-if="courseUnreadCount > 0">{{ courseUnreadCount }}</span>
        </el-tab-pane>
        <el-tab-pane label="系统消息" name="system">
          <span class="tab-badge" v-if="systemUnreadCount > 0">{{ systemUnreadCount }}</span>
        </el-tab-pane>
        <el-tab-pane label="作业通知" name="assignment">
          <span class="tab-badge" v-if="assignmentUnreadCount > 0">{{ assignmentUnreadCount }}</span>
        </el-tab-pane>
      </el-tabs>

      <!-- 搜索和筛选区域 -->
      <el-card class="search-filter-card" shadow="never">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="搜索内容">
            <el-input v-model="searchForm.keyword" placeholder="请输入关键词"></el-input>
          </el-form-item>
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :default-time="['00:00:00', '23:59:59']"
            ></el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 消息列表 -->
      <div class="notification-list">
        <el-checkbox-group v-model="selectedNotifications" class="notification-select-all">
          <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">
            全选
          </el-checkbox>
        </el-checkbox-group>

        <div
          v-for="notification in paginatedNotifications"
          :key="notification.id"
          :class="['notification-item', { 'unread': !notification.isRead }]"
        >
          <div class="notification-item-header">
            <el-checkbox
              v-model="selectedNotifications"
              :label="notification.id"
              class="notification-checkbox"
            ></el-checkbox>
            <div class="notification-meta">
              <el-tag :type="getNotificationTypeTagType(notification.type)">{{ getNotificationTypeText(notification.type) }}</el-tag>
              <span class="notification-time">{{ formatDateTime(notification.createdAt) }}</span>
              <span v-if="notification.importance" class="importance-badge">重要</span>
            </div>
            <div class="notification-actions">
              <el-button
                v-if="!notification.isRead"
                type="primary"
                size="small"
                plain
                @click.stop="markAsRead(notification.id)"
              >
                标记已读
              </el-button>
              <el-button type="text" size="small" @click.stop="deleteNotification(notification.id)">
                删除
              </el-button>
            </div>
          </div>
          <div class="notification-content">
            <div class="notification-title" @click="viewNotification(notification)">
              {{ notification.title }}
            </div>
            <div class="notification-body" @click="viewNotification(notification)">
              {{ notification.content }}
              <span v-if="notification.hasAttachment" class="has-attachment">
                <el-icon><Document /></el-icon> 有附件
              </span>
            </div>
            <div class="notification-footer">
              <span class="notification-sender">发送者: {{ notification.sender }}</span>
              <div class="notification-reply-actions">
                <el-button type="text" size="small" @click.stop="replyNotification(notification)">
                  <el-icon><ChatDotSquare /></el-icon> 回复
                </el-button>
                <el-button type="text" size="small" @click.stop="forwardNotification(notification)">
                  <el-icon><Share /></el-icon> 转发
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="paginatedNotifications.length === 0" class="empty-state">
          <el-empty description="暂无消息通知"></el-empty>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredNotifications.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </el-card>

    <!-- 消息详情对话框 -->
    <el-dialog
      v-model="showNotificationDialog"
      :title="selectedNotification?.title"
      width="60%"
      :before-close="handleCloseNotificationDialog"
    >
      <div v-if="selectedNotification" class="notification-detail">
        <div class="notification-detail-header">
          <div class="notification-detail-meta">
            <el-tag :type="getNotificationTypeTagType(selectedNotification.type)">
              {{ getNotificationTypeText(selectedNotification.type) }}
            </el-tag>
            <span class="notification-detail-time">{{ formatDateTime(selectedNotification.createdAt) }}</span>
            <span v-if="selectedNotification.importance" class="importance-badge">重要</span>
          </div>
          <div class="notification-detail-sender">
            发送者: {{ selectedNotification.sender }}
          </div>
        </div>

        <div class="notification-detail-content">
          <p v-html="formatContent(selectedNotification.content)"></p>
        </div>

        <!-- 附件列表 -->
        <div v-if="selectedNotification.hasAttachment && selectedNotification.attachments.length > 0" class="notification-attachments">
          <h4>附件列表</h4>
          <el-list>
            <el-list-item
              v-for="(attachment, index) in selectedNotification.attachments"
              :key="index"
              :class="['attachment-item']"
            >
              <el-avatar
                :icon="getAttachmentIcon(attachment.type)"
                :size="40"
                :style="{ backgroundColor: getAttachmentColor(attachment.type) }"
              ></el-avatar>
              <div class="attachment-info">
                <div class="attachment-name">{{ attachment.name }}</div>
                <div class="attachment-size">{{ formatFileSize(attachment.size) }}</div>
              </div>
              <div class="attachment-actions">
                <el-button type="primary" size="small" @click="downloadAttachment(attachment, selectedNotification.id)">
                  <el-icon><Download /></el-icon> 下载
                </el-button>
              </div>
            </el-list-item>
          </el-list>
        </div>

        <!-- 回复区域 -->
        <div class="notification-replies">
          <h4>回复记录</h4>
          <div v-if="selectedNotification.replies.length > 0" class="replies-list">
            <div
              v-for="(reply, index) in selectedNotification.replies"
              :key="index"
              class="reply-item"
            >
              <div class="reply-header">
                <span class="reply-author">{{ reply.author }}</span>
                <span class="reply-time">{{ formatDateTime(reply.createdAt) }}</span>
              </div>
              <div class="reply-content">{{ reply.content }}</div>
            </div>
          </div>
          <div v-else class="no-replies">暂无回复</div>
          
          <!-- 回复表单 -->
          <div class="reply-form">
            <el-input
              v-model="replyContent"
              type="textarea"
              rows="3"
              placeholder="请输入回复内容"
            ></el-input>
            <div class="reply-form-actions">
              <el-button @click="cancelReply">取消</el-button>
              <el-button type="primary" @click="submitReply">提交回复</el-button>
            </div>
          </div>
        </div>

        <div class="dialog-footer">
          <el-button @click="handleCloseNotificationDialog">关闭</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 回复对话框 -->
    <el-dialog
      v-model="showReplyDialog"
      title="回复消息"
      width="50%"
      :before-close="handleCloseReplyDialog"
    >
      <div v-if="replyNotificationData" class="reply-dialog">
        <div class="reply-dialog-preview">
          <h4>消息预览</h4>
          <div class="preview-title">{{ replyNotificationData.title }}</div>
          <div class="preview-content">{{ replyNotificationData.content }}</div>
        </div>
        <div class="reply-dialog-form">
          <el-input
            v-model="replyContent"
            type="textarea"
            rows="5"
            placeholder="请输入回复内容"
          ></el-input>
        </div>
      </div>
      <div class="dialog-footer">
        <el-button @click="handleCloseReplyDialog">取消</el-button>
        <el-button type="primary" @click="submitReply">提交回复</el-button>
      </div>
    </el-dialog>

    <!-- 转发对话框 -->
    <el-dialog
      v-model="showForwardDialog"
      title="转发消息"
      width="50%"
      :before-close="handleCloseForwardDialog"
    >
      <div v-if="forwardNotificationData" class="forward-dialog">
        <div class="forward-dialog-preview">
          <h4>消息预览</h4>
          <div class="preview-title">{{ forwardNotificationData.title }}</div>
          <div class="preview-content">{{ forwardNotificationData.content }}</div>
        </div>
        <div class="forward-dialog-form">
          <el-form :model="forwardForm" :rules="forwardRules" ref="forwardForm">
            <el-form-item label="接收人" prop="recipient">
              <el-select
                v-model="forwardForm.recipient"
                placeholder="请选择接收人"
                multiple
                filterable
                allow-create
                default-first-option
              >
                <el-option
                  v-for="user in availableUsers"
                  :key="user.value"
                  :label="user.label"
                  :value="user.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="附言" prop="message">
              <el-input
                v-model="forwardForm.message"
                type="textarea"
                rows="3"
                placeholder="请输入附言（选填）"
              ></el-input>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div class="dialog-footer">
        <el-button @click="handleCloseForwardDialog">取消</el-button>
        <el-button type="primary" @click="submitForward">确认转发</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { Document, ChatDotSquare, Share, Download } from '@element-plus/icons-vue'
import api from '../../services/axios'

export default {
  name: 'StudentNotifications',
  components: {
    Document,
    ChatDotSquare,
    Share,
    Download
  },
  data() {
    return {
      activeTab: 'all',
      currentPage: 1,
      pageSize: 10,
      searchForm: {
        keyword: '',
        dateRange: []
      },
      selectedNotifications: [],
      checkAll: false,
      isIndeterminate: false,
      showNotificationDialog: false,
      showReplyDialog: false,
      showForwardDialog: false,
      selectedNotification: null,
      replyNotificationData: null,
      forwardNotificationData: null,
      replyContent: '',
      forwardForm: {
        recipient: [],
        message: ''
      },
      forwardRules: {
        recipient: [{ required: true, message: '请选择接收人', trigger: 'blur' }]
      },
      loading: false,
      // 可用用户列表（模拟数据）
      availableUsers: [
        { label: '张三 (同学)', value: 'student1' },
        { label: '李四 (同学)', value: 'student2' },
        { label: '王五 (同学)', value: 'student3' },
        { label: '张老师 (高等数学)', value: 'teacher1' },
        { label: '李老师 (大学物理)', value: 'teacher2' }
      ],
      // 通知数据
      notifications: [
        {
          id: 1,
          title: '高等数学期中考试安排',
          content: '各位同学，高等数学期中考试将于下周二（11月5日）上午10:00-12:00在教学楼A301进行，请准时参加。考试内容包括第三章至第五章，请做好复习准备。如有特殊情况不能参加考试，请提前请假。',
          type: 'course',
          sender: '张老师',
          createdAt: '2025-10-20T09:30:00',
          isRead: false,
          importance: true,
          hasAttachment: true,
          attachments: [
            {
              name: '考试大纲.pdf',
              type: 'pdf',
              size: 1024 * 1024 * 2.5,
              url: '#'
            },
            {
              name: '复习要点.docx',
              type: 'docx',
              size: 1024 * 1024 * 1.2,
              url: '#'
            }
          ],
          replies: [
            {
              id: 1,
              author: '学生小王',
              content: '老师，请问考试可以带计算器吗？',
              createdAt: '2025-10-20T10:15:00'
            },
            {
              id: 2,
              author: '张老师',
              content: '可以带简单计算器，但不能使用具有编程功能的计算器。',
              createdAt: '2025-10-20T10:30:00'
            }
          ]
        },
        {
          id: 2,
          title: '程序设计基础作业截止日期提醒',
          content: '各位同学，"程序设计基础"课程的第三次作业截止日期为10月25日，请及时提交。本次作业要求实现一个简单的学生管理系统，具体要求已上传至课程网站。',
          type: 'assignment',
          sender: '赵老师',
          createdAt: '2025-10-20T14:20:00',
          isRead: false,
          importance: false,
          hasAttachment: false,
          attachments: [],
          replies: []
        },
        {
          id: 3,
          title: '校园网络维护通知',
          content: '为了提供更好的网络服务，校园网络中心将于本周五（10月25日）凌晨2:00-6:00进行网络设备维护，期间校园网将暂时中断。请各位同学提前做好准备，避免影响学习和生活。',
          type: 'system',
          sender: '网络中心',
          createdAt: '2025-10-20T16:45:00',
          isRead: false,
          importance: true,
          hasAttachment: false,
          attachments: [],
          replies: []
        },
        {
          id: 4,
          title: '大学物理实验课时间调整',
          content: '原定于10月22日（周三）下午的大学物理实验课调整为10月23日（周四）下午2:00-4:00，地点不变（实验楼B202）。请同学们相互转告。',
          type: 'course',
          sender: '李老师',
          createdAt: '2025-10-19T11:30:00',
          isRead: true,
          importance: false,
          hasAttachment: false,
          attachments: [],
          replies: []
        },
        {
          id: 5,
          title: '奖学金申请通知',
          content: '2025年度校级奖学金申请工作已开始，请符合条件的同学于11月10日前登录学生系统进行申请。具体申请条件和流程请查看附件。',
          type: 'system',
          sender: '学生处',
          createdAt: '2025-10-19T08:15:00',
          isRead: true,
          importance: true,
          hasAttachment: true,
          attachments: [
            {
              name: '奖学金申请指南.pdf',
              type: 'pdf',
              size: 1024 * 1024 * 3.8,
              url: '#'
            },
            {
              name: '申请表单.docx',
              type: 'docx',
              size: 1024 * 1024 * 0.8,
              url: '#'
            }
          ],
          replies: []
        },
        {
          id: 6,
          title: '英语听力测试成绩已公布',
          content: '各位同学，上周的英语听力测试成绩已公布，请登录系统查看。如有异议，请在本周内联系英语教学办公室。',
          type: 'course',
          sender: '陈老师',
          createdAt: '2025-10-18T15:20:00',
          isRead: true,
          importance: false,
          hasAttachment: false,
          attachments: [],
          replies: []
        },
        {
          id: 7,
          title: '图书馆新书推荐',
          content: '图书馆近期新增了一批计算机科学类图书，包括人工智能、数据结构、算法分析等领域的最新著作，欢迎同学们前来借阅。详细书单请查看图书馆网站。',
          type: 'system',
          sender: '图书馆',
          createdAt: '2025-10-18T10:00:00',
          isRead: true,
          importance: false,
          hasAttachment: false,
          attachments: [],
          replies: []
        },
        {
          id: 8,
          title: '计算机基础作业点评',
          content: '各位同学，第一次计算机基础作业已完成批改，请登录系统查看作业点评和成绩。作业中存在的共性问题已上传至课程网站，请同学们认真阅读并在下次作业中改进。',
          type: 'assignment',
          sender: '王老师',
          createdAt: '2025-10-17T16:30:00',
          isRead: true,
          importance: false,
          hasAttachment: true,
          attachments: [
            {
              name: '作业点评.pdf',
              type: 'pdf',
              size: 1024 * 1024 * 2.1,
              url: '#'
            }
          ],
          replies: []
        }
      ]
    }
  },
  computed: {
    filteredNotifications() {
      let filtered = [...this.notifications]

      // 按标签页筛选
      if (this.activeTab !== 'all') {
        if (this.activeTab === 'unread') {
          filtered = filtered.filter(notification => !notification.isRead)
        } else {
          filtered = filtered.filter(notification => notification.type === this.activeTab)
        }
      }

      // 按关键词搜索
      if (this.searchForm.keyword) {
        const keyword = this.searchForm.keyword.toLowerCase()
        filtered = filtered.filter(notification =>
          notification.title.toLowerCase().includes(keyword) ||
          notification.content.toLowerCase().includes(keyword) ||
          notification.sender.toLowerCase().includes(keyword)
        )
      }

      // 按时间范围筛选
      if (this.searchForm.dateRange && this.searchForm.dateRange.length === 2) {
        const startDate = this.searchForm.dateRange[0]
        const endDate = this.searchForm.dateRange[1]
        filtered = filtered.filter(notification => {
          const notificationDate = new Date(notification.createdAt)
          return notificationDate >= startDate && notificationDate <= endDate
        })
      }

      // 按创建时间降序排列
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

      return filtered
    },
    paginatedNotifications() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredNotifications.slice(start, end)
    },
    unreadCount() {
      return this.notifications.filter(notification => !notification.isRead).length
    },
    courseUnreadCount() {
      return this.notifications.filter(notification => !notification.isRead && notification.type === 'course').length
    },
    systemUnreadCount() {
      return this.notifications.filter(notification => !notification.isRead && notification.type === 'system').length
    },
    assignmentUnreadCount() {
      return this.notifications.filter(notification => !notification.isRead && notification.type === 'assignment').length
    }
  },
  methods: {
    // 加载通知数据
    async loadNotifications() {
      try {
        this.loading = true
        // 构建查询参数
        const params = {
          type: this.activeTab === 'all' ? '' : this.activeTab,
          keyword: this.searchForm.keyword,
          page: this.currentPage,
          pageSize: this.pageSize
        }
        
        // 添加日期范围参数
        if (this.searchForm.dateRange && this.searchForm.dateRange.length > 0) {
          params.startDate = this.formatDate(this.searchForm.dateRange[0])
          params.endDate = this.formatDate(this.searchForm.dateRange[1])
        }
        
        const response = await api.get('/student/notifications', { params })
        this.notifications = response.data || []
      } catch (error) {
        console.error('获取通知失败:', error)
        this.$message.error('获取通知失败，请稍后重试')
        // 不再使用模拟数据，保持数据为空以显示实际结果
        this.notifications = []
      } finally {
        this.loading = false
      }
    },
    
    // 使用模拟数据
    useMockData() {
      // 这里保持原有的模拟数据结构
      return [
        {
          id: 1,
          title: '高等数学期中考试安排',
          content: '各位同学，高等数学期中考试将于下周二（11月5日）上午10:00-12:00在教学楼A301进行，请准时参加。考试内容包括第三章至第五章，请做好复习准备。如有特殊情况不能参加考试，请提前请假。',
          type: 'course',
          sender: '张老师',
          createdAt: '2025-10-20T09:30:00',
          isRead: false,
          importance: true,
          hasAttachment: true,
          attachments: [
            {
              name: '考试大纲.pdf',
              type: 'pdf',
              size: 1024 * 1024 * 2.5,
              url: '#'
            },
            {
              name: '复习要点.docx',
              type: 'docx',
              size: 1024 * 1024 * 1.2,
              url: '#'
            }
          ],
          replies: [
            {
              id: 1,
              author: '学生小王',
              content: '老师，请问考试可以带计算器吗？',
              createdAt: '2025-10-20T10:15:00'
            },
            {
              id: 2,
              author: '张老师',
              content: '可以带简单计算器，但不能使用具有编程功能的计算器。',
              createdAt: '2025-10-20T10:30:00'
            }
          ]
        },
        {
          id: 2,
          title: '程序设计基础作业截止日期提醒',
          content: '各位同学，"程序设计基础"课程的第三次作业截止日期为10月25日，请及时提交。本次作业要求实现一个简单的学生管理系统，具体要求已上传至课程网站。',
          type: 'assignment',
          sender: '赵老师',
          createdAt: '2025-10-20T14:20:00',
          isRead: false,
          importance: false,
          hasAttachment: false,
          attachments: [],
          replies: []
        },
        {
          id: 3,
          title: '校园网络维护通知',
          content: '为了提供更好的网络服务，校园网络中心将于本周五（10月25日）凌晨2:00-6:00进行网络设备维护，期间校园网将暂时中断。请各位同学提前做好准备，避免影响学习和生活。',
          type: 'system',
          sender: '网络中心',
          createdAt: '2025-10-20T16:45:00',
          isRead: false,
          importance: true,
          hasAttachment: false,
          attachments: [],
          replies: []
        },
        {
          id: 4,
          title: '大学物理实验课时间调整',
          content: '原定于10月22日（周三）下午的大学物理实验课调整为10月23日（周四）下午2:00-4:00，地点不变（实验楼B202）。请同学们相互转告。',
          type: 'course',
          sender: '李老师',
          createdAt: '2025-10-19T11:30:00',
          isRead: true,
          importance: false,
          hasAttachment: false,
          attachments: [],
          replies: []
        },
        {
          id: 5,
          title: '奖学金申请通知',
          content: '2025年度校级奖学金申请工作已开始，请符合条件的同学于11月10日前登录学生系统进行申请。具体申请条件和流程请查看附件。',
          type: 'system',
          sender: '学生处',
          createdAt: '2025-10-19T08:15:00',
          isRead: true,
          importance: true,
          hasAttachment: true,
          attachments: [
            {
              name: '奖学金申请指南.pdf',
              type: 'pdf',
              size: 1024 * 1024 * 3.8,
              url: '#'
            },
            {
              name: '申请表单.docx',
              type: 'docx',
              size: 1024 * 1024 * 0.8,
              url: '#'
            }
          ],
          replies: []
        },
        {
          id: 6,
          title: '英语听力测试成绩已公布',
          content: '各位同学，上周的英语听力测试成绩已公布，请登录系统查看。如有异议，请在本周内联系英语教学办公室。',
          type: 'course',
          sender: '陈老师',
          createdAt: '2025-10-18T15:20:00',
          isRead: true,
          importance: false,
          hasAttachment: false,
          attachments: [],
          replies: []
        },
        {
          id: 7,
          title: '图书馆新书推荐',
          content: '图书馆近期新增了一批计算机科学类图书，包括人工智能、数据结构、算法分析等领域的最新著作，欢迎同学们前来借阅。详细书单请查看图书馆网站。',
          type: 'system',
          sender: '图书馆',
          createdAt: '2025-10-18T10:00:00',
          isRead: true,
          importance: false,
          hasAttachment: false,
          attachments: [],
          replies: []
        },
        {
          id: 8,
          title: '计算机基础作业点评',
          content: '各位同学，第一次计算机基础作业已完成批改，请登录系统查看作业点评和成绩。作业中存在的共性问题已上传至课程网站，请同学们认真阅读并在下次作业中改进。',
          type: 'assignment',
          sender: '王老师',
          createdAt: '2025-10-17T16:30:00',
          isRead: true,
          importance: false,
          hasAttachment: true,
          attachments: [
            {
              name: '作业点评.pdf',
              type: 'pdf',
              size: 1024 * 1024 * 2.1,
              url: '#'
            }
          ],
          replies: []
        }
      ]
    },
    
    handleTabClick() {
      this.currentPage = 1
      this.loadNotifications()
    },
    
    handleSearch() {
      this.currentPage = 1
      this.loadNotifications()
    },
    
    resetSearch() {
      this.searchForm = {
        keyword: '',
        dateRange: []
      }
      this.currentPage = 1
      this.loadNotifications()
    },
    
    handleSizeChange(size) {
      this.pageSize = size
      this.loadNotifications()
    },
    
    handleCurrentChange(current) {
      this.currentPage = current
      this.loadNotifications()
    },
    
    handleCheckAllChange(checked) {
      this.selectedNotifications = checked
        ? this.paginatedNotifications.map(notification => notification.id)
        : []
      this.isIndeterminate = false
    },
    getNotificationTypeTagType(type) {
      const typeMap = {
        course: 'primary',
        system: 'info',
        assignment: 'warning'
      }
      return typeMap[type] || 'default'
    },
    getNotificationTypeText(type) {
      const typeMap = {
        course: '课程通知',
        system: '系统消息',
        assignment: '作业通知'
      }
      return typeMap[type] || type
    },
    formatDateTime(dateTime) {
      const date = new Date(dateTime)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    // 标记单个通知为已读
    async markAsRead(notificationId) {
      try {
        await api.put(`/student/notifications/${notificationId}/read`)
        const notification = this.notifications.find(n => n.id === notificationId)
        if (notification) {
          notification.isRead = true
          this.$message.success('已标记为已读')
        }
      } catch (error) {
        console.error('标记已读失败:', error)
        // 即使API调用失败，也在前端更新状态
        const notification = this.notifications.find(n => n.id === notificationId)
        if (notification) {
          notification.isRead = true
          this.$message.warning('已在本地标记为已读，下次同步时将更新到服务器')
        }
      }
    },
    
    // 标记全部通知为已读
    async markAllAsRead() {
      try {
        this.loading = true
        // 获取需要标记的通知ID列表
        let notificationsToMark
        if (this.activeTab === 'all' || this.activeTab === 'unread') {
          notificationsToMark = this.notifications.filter(n => !n.isRead)
        } else {
          notificationsToMark = this.notifications.filter(n => !n.isRead && n.type === this.activeTab)
        }
        
        // 批量标记已读
        const notificationIds = notificationsToMark.map(n => n.id)
        if (notificationIds.length > 0) {
          await api.put('/student/notifications/read-all', { ids: notificationIds })
        }
        
        // 更新本地状态
        notificationsToMark.forEach(notification => {
          notification.isRead = true
        })
        
        this.$message.success('已全部标记为已读')
      } catch (error) {
        console.error('标记全部已读失败:', error)
        // 即使API调用失败，也在前端更新状态
        let notificationsToMark
        if (this.activeTab === 'all' || this.activeTab === 'unread') {
          notificationsToMark = this.notifications.filter(n => !n.isRead)
        } else {
          notificationsToMark = this.notifications.filter(n => !n.isRead && n.type === this.activeTab)
        }
        
        notificationsToMark.forEach(notification => {
          notification.isRead = true
        })
        
        this.$message.warning('已在本地标记为已读，下次同步时将更新到服务器')
      } finally {
        this.loading = false
      }
    },
    // 删除单个通知
    async deleteNotification(notificationId) {
      this.$confirm('确定要删除这条消息吗？', '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          this.loading = true
          await api.delete(`/student/notifications/${notificationId}`)
          const index = this.notifications.findIndex(n => n.id === notificationId)
          if (index !== -1) {
            this.notifications.splice(index, 1)
            this.$message.success('删除成功')
          }
        } catch (error) {
          console.error('删除通知失败:', error)
          // 即使API调用失败，也在前端删除
          const index = this.notifications.findIndex(n => n.id === notificationId)
          if (index !== -1) {
            this.notifications.splice(index, 1)
            this.$message.warning('已在本地删除，下次同步时将更新到服务器')
          }
        } finally {
          this.loading = false
        }
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    
    // 删除选中的通知
    async deleteSelected() {
      if (this.selectedNotifications.length === 0) {
        this.$message.warning('请先选择要删除的消息')
        return
      }

      this.$confirm(`确定要删除选中的${this.selectedNotifications.length}条消息吗？`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          this.loading = true
          await api.delete('/student/notifications', { data: { ids: this.selectedNotifications } })
          this.notifications = this.notifications.filter(notification =>
            !this.selectedNotifications.includes(notification.id)
          )
          this.selectedNotifications = []
          this.checkAll = false
          this.$message.success('删除成功')
        } catch (error) {
          console.error('批量删除通知失败:', error)
          // 即使API调用失败，也在前端删除
          this.notifications = this.notifications.filter(notification =>
            !this.selectedNotifications.includes(notification.id)
          )
          this.selectedNotifications = []
          this.checkAll = false
          this.$message.warning('已在本地删除，下次同步时将更新到服务器')
        } finally {
          this.loading = false
        }
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    // 查看通知详情
    async viewNotification(notification) {
      // 标记为已读
      if (!notification.isRead) {
        this.markAsRead(notification.id)
      }
      this.selectedNotification = { ...notification }
      this.showNotificationDialog = true
    },
    handleCloseNotificationDialog() {
      this.selectedNotification = null
      this.replyContent = ''
      this.showNotificationDialog = false
    },
    replyNotification(notification) {
      this.replyNotificationData = { ...notification }
      this.replyContent = ''
      this.showReplyDialog = true
    },
    handleCloseReplyDialog() {
      this.replyNotificationData = null
      this.replyContent = ''
      this.showReplyDialog = false
    },
    // 提交回复
    async submitReply() {
      if (!this.replyContent.trim()) {
        this.$message.warning('请输入回复内容')
        return
      }

      const notificationId = this.selectedNotification
        ? this.selectedNotification.id
        : this.replyNotificationData.id

      try {
        this.loading = true
        // 调用API提交回复
        const response = await api.post(`/student/notifications/${notificationId}/reply`, {
          content: this.replyContent
        })
        
        // 创建回复对象
        const reply = {
          id: response.data.id || Date.now(),
          author: response.data.author || '当前学生',
          content: this.replyContent,
          createdAt: response.data.createdAt || new Date().toISOString()
        }

        // 添加到对应的通知中
        const notification = this.notifications.find(n => n.id === notificationId)
        if (notification) {
          if (!notification.replies) {
            notification.replies = []
          }
          notification.replies.push(reply)
        }

        // 更新对话框中的数据
        if (this.selectedNotification) {
          if (!this.selectedNotification.replies) {
            this.selectedNotification.replies = []
          }
          this.selectedNotification.replies.push(reply)
        }

        this.$message.success('回复成功')
      } catch (error) {
        console.error('提交回复失败:', error)
        
        // 即使API调用失败，也在前端添加回复
        const reply = {
          id: Date.now(),
          author: '当前学生',
          content: this.replyContent,
          createdAt: new Date().toISOString(),
          pending: true // 标记为待同步
        }

        // 添加到对应的通知中
        const notification = this.notifications.find(n => n.id === notificationId)
        if (notification) {
          if (!notification.replies) {
            notification.replies = []
          }
          notification.replies.push(reply)
        }

        // 更新对话框中的数据
        if (this.selectedNotification) {
          if (!this.selectedNotification.replies) {
            this.selectedNotification.replies = []
          }
          this.selectedNotification.replies.push(reply)
        }
        
        this.$message.warning('回复已保存，将在网络恢复后同步到服务器')
      } finally {
        this.replyContent = ''
        this.showReplyDialog = false
        this.loading = false
      }
    },
    cancelReply() {
      this.replyContent = ''
    },
    forwardNotification(notification) {
      this.forwardNotificationData = { ...notification }
      this.forwardForm = {
        recipient: [],
        message: ''
      }
      this.showForwardDialog = true
    },
    handleCloseForwardDialog() {
      this.forwardNotificationData = null
      this.forwardForm = {
        recipient: [],
        message: ''
      }
      this.showForwardDialog = false
    },
    // 提交转发
    async submitForward() {
      this.$refs.forwardForm.validate(async (valid) => {
        if (valid) {
          try {
            this.loading = true
            
            // 调用API进行转发
            await api.post('/student/notifications/forward', {
              notificationId: this.forwardNotificationData.id,
              recipients: this.forwardForm.recipient,
              message: this.forwardForm.message
            })
            
            this.$message.success('转发成功')
            this.handleCloseForwardDialog()
          } catch (error) {
            console.error('转发通知失败:', error)
            this.$message.error('转发失败，请稍后重试')
          } finally {
            this.loading = false
          }
        } else {
          return false
        }
      })
    },
    formatContent(content) {
      // 将内容中的换行符转换为HTML换行标签
      return content.replace(/\n/g, '<br>')
    },
    getAttachmentIcon(type) {
      const iconMap = {
        pdf: 'Document',
        doc: 'Document',
        docx: 'Document',
        xls: 'Document',
        xlsx: 'Document',
        ppt: 'Document',
        pptx: 'Document',
        zip: 'Document',
        rar: 'Document'
      }
      return iconMap[type] || 'Document'
    },
    getAttachmentColor(type) {
      const colorMap = {
        pdf: '#f56c6c',
        doc: '#409eff',
        docx: '#409eff',
        xls: '#67c23a',
        xlsx: '#67c23a',
        ppt: '#e6a23c',
        pptx: '#e6a23c',
        zip: '#909399',
        rar: '#909399'
      }
      return colorMap[type] || '#909399'
    },
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },
    // 下载附件
    async downloadAttachment(attachment, notificationId) {
      try {
        this.$message.info(`正在准备下载：${attachment.name}`)
        
        // 调用API获取下载URL
        const response = await api.get(`/student/notifications/${notificationId}/attachments/${attachment.id}`, {
          responseType: 'blob'
        })
        
        // 创建下载链接
        const blob = new Blob([response.data])
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = attachment.name
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        this.$message.success(`下载开始：${attachment.name}`)
      } catch (error) {
        console.error('下载附件失败:', error)
        this.$message.error('下载失败，请稍后重试')
        // 失败时使用原始方式作为后备
        try {
          window.open(attachment.url, '_blank')
        } catch (fallbackError) {
          this.$message.error('无法下载附件')
        }
      } catch (error) {
        console.error('下载附件失败:', error)
        this.$message.error('下载失败，请稍后重试')
        // 失败时使用原始方式作为后备
        try {
          window.open(attachment.url, '_blank')
        } catch (fallbackError) {
          this.$message.error('无法下载附件')
        }
      }
    }
  },
  watch: {
    selectedNotifications(val) {
      const checkedCount = val.length
      this.checkAll = checkedCount === this.paginatedNotifications.length && checkedCount > 0
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.paginatedNotifications.length
    }
  },
  mounted() {
    // 加载初始通知数据
    this.loadNotifications()
    
    // 监听通知数据变化（实际应用中，这里可以通过WebSocket等方式接收实时通知）
    // 此处可以添加WebSocket连接逻辑
  }
}
</script>

<style scoped>
.notifications-container {
  padding: 20px;
}

.notifications-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.notification-tabs {
  margin-bottom: 20px;
  position: relative;
}

.tab-badge {
  position: absolute;
  top: -5px;
  right: 10px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  font-size: 12px;
  font-weight: 500;
  line-height: 20px;
  color: #fff;
  text-align: center;
  text-decoration: none;
  background-color: #f56c6c;
  border-radius: 10px;
  white-space: nowrap;
}

.search-filter-card {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  align-items: center;
}

.notification-select-all {
  margin-bottom: 15px;
}

.notification-item {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  margin-bottom: 15px;
  padding: 15px;
  background-color: #fff;
  transition: all 0.3s;
}

.notification-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.notification-item.unread {
  border-left: 4px solid #409eff;
  background-color: #f5f7fa;
}

.notification-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.notification-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  margin-left: 10px;
}

.notification-time {
  color: #909399;
  font-size: 14px;
}

.importance-badge {
  padding: 2px 8px;
  background-color: #f56c6c;
  color: #fff;
  border-radius: 4px;
  font-size: 12px;
}

.notification-title {
  font-weight: 500;
  font-size: 16px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: color 0.3s;
}

.notification-title:hover {
  color: #409eff;
}

.notification-body {
  color: #606266;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  transition: color 0.3s;
}

.notification-body:hover {
  color: #409eff;
}

.has-attachment {
  color: #409eff;
  margin-left: 5px;
}

.notification-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #909399;
  font-size: 14px;
}

.notification-reply-actions {
  display: flex;
  gap: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.empty-state {
  padding: 40px 0;
}

/* 消息详情对话框样式 */
.notification-detail {
  max-height: 70vh;
  overflow-y: auto;
}

.notification-detail-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.notification-detail-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.notification-detail-content {
  font-size: 15px;
  line-height: 1.8;
  margin-bottom: 30px;
}

.notification-attachments {
  margin-bottom: 30px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.notification-attachments h4 {
  margin-top: 0;
  margin-bottom: 15px;
}

.attachment-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #fff;
  border-radius: 4px;
  margin-bottom: 10px;
}

.attachment-info {
  flex: 1;
  margin-left: 15px;
}

.attachment-name {
  font-weight: 500;
}

.attachment-size {
  color: #909399;
  font-size: 13px;
}

.notification-replies {
  margin-bottom: 20px;
}

.notification-replies h4 {
  margin-top: 0;
  margin-bottom: 15px;
}

.reply-item {
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 15px;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
}

.reply-author {
  font-weight: 500;
}

.reply-time {
  color: #909399;
}

.reply-content {
  line-height: 1.6;
  color: #606266;
}

.no-replies {
  text-align: center;
  color: #909399;
  padding: 20px;
}

.reply-form {
  margin-top: 20px;
}

.reply-form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

/* 回复对话框样式 */
.reply-dialog-preview {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.reply-dialog-preview h4 {
  margin-top: 0;
  margin-bottom: 10px;
}

.preview-title {
  font-weight: 500;
  margin-bottom: 5px;
}

.preview-content {
  color: #606266;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 转发对话框样式 */
.forward-dialog-preview {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.forward-dialog-preview h4 {
  margin-top: 0;
  margin-bottom: 10px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>