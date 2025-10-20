<template>
  <div class="learning-container">
    <el-card class="learning-card">
      <template #header>
        <div class="card-header">
          <span>在线学习</span>
          <el-select v-model="selectedTab" placeholder="选择标签页" @change="handleTabChange">
            <el-option label="课程内容" value="content"></el-option>
            <el-option label="学习资料" value="materials"></el-option>
            <el-option label="课程讨论" value="discussion"></el-option>
          </el-select>
        </div>
      </template>

      <!-- 课程内容标签页 -->
      <div v-if="selectedTab === 'content'" class="content-tab">
        <el-card class="course-info-card" shadow="hover">
          <div class="course-info-header">
            <el-avatar size="80" :src="currentCourse.avatar || ''">
              {{ getInitials(currentCourse.courseName) }}
            </el-avatar>
            <div class="course-info-details">
              <h3>{{ currentCourse.courseName }}</h3>
              <p>授课教师：{{ currentCourse.teacher }}</p>
              <div class="course-meta">
                <el-tag type="primary" effect="plain">总课时: {{ currentCourse.totalHours }}</el-tag>
                <el-tag type="success" effect="plain">已学: {{ currentCourse.learnedHours }}</el-tag>
                <el-tag type="info" effect="plain">剩余: {{ currentCourse.remainingHours }}</el-tag>
              </div>
            </div>
          </div>
          
          <div class="course-progress">
            <el-progress
              :percentage="currentCourse.progress"
              :status="getProgressStatus(currentCourse.progress)"
              :stroke-width="20"
              text-inside
            ></el-progress>
          </div>
        </el-card>

        <div class="course-chapters">
          <el-card class="chapters-card">
            <template #header>
              <div class="chapters-header">
                <span>章节列表</span>
              </div>
            </template>

            <el-collapse v-model="activeNames">
              <el-collapse-item
                v-for="chapter in courseChapters"
                :key="chapter.id"
                :title="chapter?.title"
                :name="chapter.id.toString()"
              >
                <div class="section-list">
                  <div
                    v-for="section in chapter.sections"
                    :key="section.id"
                    class="section-item"
                    :class="{ 'active-section': activeSection === section.id }"
                    @click="selectSection(section)"
                  >
                    <div class="section-info">
                      <el-icon class="section-icon">
                        <VideoPlay v-if="section.type === 'video'" />
                        <Document v-else-if="section.type === 'document'" />
                        <Link v-else />
                      </el-icon>
                      <div class="section-details">
                        <div class="section-title">{{ section?.title }}</div>
                        <div class="section-meta">
                          <span>{{ section.duration }}</span>
                          <el-tag
                            v-if="section.status"
                            :type="getStatusTag(section.status)"
                            size="small"
                          >
                            {{ getStatusText(section.status) }}
                          </el-tag>
                        </div>
                      </div>
                    </div>
                    <el-button
                      v-if="!section.status || section.status !== 'completed'"
                      type="primary"
                      size="small"
                      @click.stop="startLearning(section)"
                    >
                      学习
                    </el-button>
                    <el-button
                      v-else
                      type="success"
                      size="small"
                      @click.stop="reviewSection(section)"
                    >
                      复习
                    </el-button>
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </el-card>

          <div class="learning-content">
            <el-card class="content-display-card">
              <template #header>
                <div class="content-display-header">
                  <span>{{ activeSectionData?.title || '请选择学习内容' }}</span>
                  <div class="content-actions">
                    <el-button type="text" @click="previousSection"><el-icon><ArrowLeft /></el-icon>上一节</el-button>
                    <el-button type="text" @click="nextSection">下一节<el-icon><ArrowRight /></el-icon></el-button>
                  </div>
                </div>
              </template>

              <div v-if="activeSectionData" class="content-display-body">
                <!-- 视频类型内容 -->
                <div v-if="activeSectionData.type === 'video'" class="video-content">
                  <div class="video-placeholder">
                    <el-icon class="video-icon"><VideoPlay /></el-icon>
                    <p>视频播放区域</p>
                    <p>课程内容：{{ activeSectionData?.title }}</p>
                  </div>
                  <div class="video-controls">
                    <el-button-group>
                      <el-button type="primary" icon="el-icon-video-play" size="small">播放</el-button>
                      <el-button type="info" icon="el-icon-refresh-right" size="small">1.0x</el-button>
                      <el-button type="info" icon="el-icon-collection-tag" size="small">画质</el-button>
                      <el-button type="success" icon="el-icon-check" size="small">标记完成</el-button>
                    </el-button-group>
                  </div>
                </div>

                <!-- 文档类型内容 -->
                <div v-else-if="activeSectionData.type === 'document'" class="document-content">
                  <div class="document-placeholder">
                    <el-icon class="document-icon"><Document /></el-icon>
                    <p>文档预览区域</p>
                    <p>文档名称：{{ activeSectionData?.title }}</p>
                  </div>
                  <div class="document-actions">
                    <el-button type="primary" icon="el-icon-download" size="small">下载文档</el-button>
                    <el-button type="success" icon="el-icon-check" size="small">标记完成</el-button>
                  </div>
                </div>

                <!-- 其他类型内容 -->
                <div v-else class="other-content">
                  <el-empty description="内容加载中..."></el-empty>
                </div>
              </div>
              <div v-else class="empty-content">
                <el-empty description="请从左侧章节列表中选择要学习的内容"></el-empty>
              </div>
            </el-card>
          </div>
        </div>
      </div>

      <!-- 学习资料标签页 -->
      <div v-if="selectedTab === 'materials'" class="materials-tab">
        <el-card class="materials-search-card">
          <el-form :inline="true" :model="searchForm" class="search-form">
            <el-form-item label="资料名称">
              <el-input v-model="searchForm.materialName" placeholder="请输入资料名称"></el-input>
            </el-form-item>
            <el-form-item label="资料类型">
              <el-select v-model="searchForm.materialType" placeholder="选择资料类型">
                <el-option label="全部" value=""></el-option>
                <el-option label="文档" value="document"></el-option>
                <el-option label="视频" value="video"></el-option>
                <el-option label="音频" value="audio"></el-option>
                <el-option label="图片" value="image"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleMaterialSearch">搜索</el-button>
              <el-button @click="resetMaterialSearch">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card class="materials-list-card">
          <el-table :data="learningMaterials" style="width: 100%">
            <el-table-column prop="name" label="资料名称" width="300">
              <template #default="scope">
                <div class="material-name">
                  <el-icon>
                    <Document v-if="scope.row.type === 'document'" />
                    <VideoPlay v-if="scope.row.type === 'video'" />
                    <Microphone v-if="scope.row.type === 'audio'" />
                    <Picture v-if="scope.row.type === 'image'" />
                  </el-icon>
                  <span>{{ scope.row.name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="资料描述"></el-table-column>
            <el-table-column prop="type" label="资料类型" width="100">
              <template #default="scope">
                <el-tag :type="getMaterialTypeTag(scope.row.type)">{{ getMaterialTypeText(scope.row.type) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="uploadTime" label="上传时间" width="150"></el-table-column>
            <el-table-column prop="size" label="文件大小" width="100"></el-table-column>
            <el-table-column prop="downloadCount" label="下载次数" width="100"></el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="scope">
                <el-button-group>
                  <el-button type="primary" size="small" @click="viewMaterial(scope.row)">查看</el-button>
                  <el-button type="success" size="small" @click="downloadMaterial(scope.row)">下载</el-button>
                </el-button-group>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-container">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="totalMaterials"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            ></el-pagination>
          </div>
        </el-card>
      </div>

      <!-- 课程讨论标签页 -->
      <div v-if="selectedTab === 'discussion'" class="discussion-tab">
        <el-card class="discussion-input-card">
          <el-form :model="discussionForm">
            <el-form-item label="讨论主题">
              <el-input v-model="discussionForm.title" placeholder="请输入讨论主题"></el-input>
            </el-form-item>
            <el-form-item label="讨论内容">
              <el-input v-model="discussionForm.content" type="textarea" :rows="4" placeholder="请输入讨论内容"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitDiscussion">发布讨论</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card class="discussion-list-card">
          <el-list>
            <el-list-item
              v-for="discussion in discussions"
              :key="discussion.id"
              class="discussion-item"
            >
              <el-card shadow="hover" class="discussion-card">
                <div class="discussion-header">
                  <h4>{{ discussion?.title }}</h4>
                  <span class="discussion-time">{{ discussion.time }}</span>
                </div>
                <div class="discussion-author">
                  <el-avatar size="small">{{ getInitials(discussion.author) }}</el-avatar>
                  <span>{{ discussion.author }}</span>
                </div>
                <div class="discussion-content">{{ discussion.content }}</div>
                <div class="discussion-actions">
                  <el-button type="text" icon="el-icon-chat-dot-round" @click="replyDiscussion(discussion)">
                    回复({{ discussion.replyCount }})
                  </el-button>
                  <el-button type="text" icon="el-icon-star-on" @click="likeDiscussion(discussion)">
                    点赞({{ discussion.likeCount }})
                  </el-button>
                </div>
              </el-card>
            </el-list-item>
          </el-list>

          <div class="pagination-container">
            <el-pagination
              v-model:current-page="discussionPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="totalDiscussions"
              @size-change="handleDiscussionSizeChange"
              @current-change="handleDiscussionCurrentChange"
            ></el-pagination>
          </div>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script>
import { 
  VideoPlay, Document, Link, ArrowLeft, ArrowRight, 
  Microphone, Picture, ChatDotRound, Star 
} from '@element-plus/icons-vue'
import api from '../../services/axios'

export default {
  name: 'StudentLearning',
  components: {
    VideoPlay,
    Document,
    Link,
    ArrowLeft,
    ArrowRight,
    Microphone,
    Picture,
    ChatDotRound,
    Star
  },
  data() {
    return {
      loading: false,
      selectedTab: 'content',
      activeNames: ['1'],
      activeSection: null,
      activeSectionData: null,
      currentPage: 1,
      pageSize: 10,
      discussionPage: 1,
      totalMaterials: 0,
      totalDiscussions: 0,
      searchForm: {
        materialName: '',
        materialType: ''
      },
      discussionForm: {
        title: '',
        content: ''
      },
      // 模拟当前课程数据
      currentCourse: {
        id: 1,
        courseName: '高等数学',
        teacher: '张老师',
        totalHours: 64,
        learnedHours: 24,
        remainingHours: 40,
        progress: 37.5,
        avatar: ''
      },
      // 模拟课程章节数据
      courseChapters: [
        {
          id: 1,
          title: '第1章 函数与极限',
          sections: [
            { id: 101, title: '1.1 函数的概念', type: 'video', duration: '45分钟', status: 'completed' },
            { id: 102, title: '1.2 数列的极限', type: 'video', duration: '50分钟', status: 'completed' },
            { id: 103, title: '1.3 函数的极限', type: 'video', duration: '55分钟', status: 'in_progress' },
            { id: 104, title: '第一章习题集', type: 'document', duration: 'PDF', status: '' }
          ]
        },
        {
          id: 2,
          title: '第2章 导数与微分',
          sections: [
            { id: 201, title: '2.1 导数的概念', type: 'video', duration: '48分钟', status: '' },
            { id: 202, title: '2.2 导数的计算法则', type: 'video', duration: '52分钟', status: '' },
            { id: 203, title: '2.3 高阶导数', type: 'video', duration: '40分钟', status: '' },
            { id: 204, title: '第二章习题集', type: 'document', duration: 'PDF', status: '' }
          ]
        },
        {
          id: 3,
          title: '第3章 微分中值定理与导数的应用',
          sections: [
            { id: 301, title: '3.1 微分中值定理', type: 'video', duration: '45分钟', status: '' },
            { id: 302, title: '3.2 洛必达法则', type: 'video', duration: '40分钟', status: '' },
            { id: 303, title: '3.3 函数的单调性与极值', type: 'video', duration: '50分钟', status: '' }
          ]
        }
      ],
      // 模拟学习资料数据
      learningMaterials: [
        { id: 1, name: '高等数学第一章讲义.pdf', description: '第一章函数与极限的详细讲义', type: 'document', uploadTime: '2025-09-01', size: '2.5MB', downloadCount: 128 },
        { id: 2, name: '函数的概念.mp4', description: '函数概念的讲解视频', type: 'video', uploadTime: '2025-09-02', size: '156MB', downloadCount: 95 },
        { id: 3, name: '极限练习题集.pdf', description: '极限部分的练习题及答案', type: 'document', uploadTime: '2025-09-03', size: '1.2MB', downloadCount: 87 },
        { id: 4, name: '导数的几何意义.png', description: '导数几何意义的图示说明', type: 'image', uploadTime: '2025-09-04', size: '0.8MB', downloadCount: 64 },
        { id: 5, name: '微分应用讲解.mp3', description: '微分应用的音频讲解', type: 'audio', uploadTime: '2025-09-05', size: '25MB', downloadCount: 42 }
      ],
      // 模拟讨论数据
      discussions: [
        {
          id: 1,
          title: '关于函数极限的一个疑问',
          content: '在学习函数极限时，对于左极限和右极限的关系不是很理解，有没有同学能解释一下？',
          author: '王同学',
          time: '2025-10-20 10:30',
          replyCount: 3,
          likeCount: 5
        },
        {
          id: 2,
          title: '分享一个导数计算的技巧',
          content: '最近学习导数计算时，发现了一个简化复合函数求导的小技巧，分享给大家...',
          author: '李同学',
          time: '2025-10-19 16:45',
          replyCount: 8,
          likeCount: 12
        }
      ]
    }
  },
  mounted() {
    this.loadInitialData()
  },
  methods: {
    async loadInitialData() {
      this.loading = true
      try {
        await Promise.all([
          this.loadCourseInfo(),
          this.loadCourseChapters(),
          this.loadLearningMaterials(),
          this.loadDiscussions()
        ])
        // 设置默认选中的章节和小节
        if (this.courseChapters.length > 0 && this.courseChapters[0].sections.length > 0) {
          this.activeSection = this.courseChapters[0].sections[0].id
          this.activeSectionData = this.courseChapters[0].sections[0]
        }
      } catch (error) {
        console.error('加载初始数据失败:', error)
        this.$message.error('数据加载失败，请检查网络连接或稍后重试')
        // 不再使用模拟数据，直接显示API请求的实际状态
      } finally {
        this.loading = false
      }
    },

    async loadCourseInfo() {
      try {
        const response = await api.get('/student/courses/current')
        this.currentCourse = response.data || {}
      } catch (error) {
        console.error('加载课程信息失败:', error)
        this.$message.error('课程信息加载失败，请检查网络连接或稍后重试')
      }
    },

    async loadCourseChapters() {
      try {
        const courseId = this.$route.params.id || 1
        const response = await api.get(`/student/courses/${courseId}/chapters`)
        this.courseChapters = response.data || []
      } catch (error) {
        console.error('加载章节数据失败:', error)
        this.$message.error('章节数据加载失败，请检查网络连接或稍后重试')
      }
    },

    async loadLearningMaterials() {
      try {
        const courseId = this.$route.params.id || 1
        const params = {
          page: this.currentPage,
          pageSize: this.pageSize,
          ...this.searchForm
        }
        const response = await api.get(`/student/courses/${courseId}/materials`, { params })
        this.learningMaterials = response.data.items || []
        this.totalMaterials = response.data.total || 0
      } catch (error) {
        console.error('加载学习资料失败:', error)
        this.$message.error('学习资料加载失败，请检查网络连接或稍后重试')
      }
    },

    async loadDiscussions() {
      try {
        const courseId = this.$route.params.id || 1
        const params = {
          page: this.discussionPage,
          pageSize: this.pageSize
        }
        const response = await api.get(`/student/courses/${courseId}/discussions`, { params })
        this.discussions = response.data.items || []
        this.totalDiscussions = response.data.total || 0
      } catch (error) {
        console.error('加载讨论数据失败:', error)
        this.$message.error('讨论数据加载失败，请检查网络连接或稍后重试')
      }
    },

    handleTabChange() {
      // 标签页切换时的处理
    },
    selectSection(section) {
      this.activeSection = section.id
      this.activeSectionData = section
    },
    startLearning(section) {
      this.selectSection(section)
      this.$message.success(`开始学习：${section?.title || '未知章节'}`)
    },
    reviewSection(section) {
      this.selectSection(section)
      this.$message.success(`开始复习：${section?.title || '未知章节'}`)
    },
    previousSection() {
      // 查找当前章节和小节的位置
      let currentChapterIndex = -1
      let currentSectionIndex = -1
      
      for (let i = 0; i < this.courseChapters.length; i++) {
        const chapter = this.courseChapters[i]
        const sectionIndex = chapter.sections.findIndex(s => s.id === this.activeSection)
        if (sectionIndex !== -1) {
          currentChapterIndex = i
          currentSectionIndex = sectionIndex
          break
        }
      }
      
      // 找到上一节
      if (currentSectionIndex > 0) {
        // 当前章节的上一节
        this.selectSection(this.courseChapters[currentChapterIndex].sections[currentSectionIndex - 1])
        this.activeNames = [this.courseChapters[currentChapterIndex].id.toString()]
      } else if (currentChapterIndex > 0) {
        // 上一章节的最后一节
        const prevChapter = this.courseChapters[currentChapterIndex - 1]
        this.selectSection(prevChapter.sections[prevChapter.sections.length - 1])
        this.activeNames = [prevChapter.id.toString()]
      } else {
        this.$message.info('已经是第一节了')
      }
    },
    nextSection() {
      // 查找当前章节和小节的位置
      let currentChapterIndex = -1
      let currentSectionIndex = -1
      
      for (let i = 0; i < this.courseChapters.length; i++) {
        const chapter = this.courseChapters[i]
        const sectionIndex = chapter.sections.findIndex(s => s.id === this.activeSection)
        if (sectionIndex !== -1) {
          currentChapterIndex = i
          currentSectionIndex = sectionIndex
          break
        }
      }
      
      // 找到下一节
      const currentChapter = this.courseChapters[currentChapterIndex]
      if (currentSectionIndex < currentChapter.sections.length - 1) {
        // 当前章节的下一节
        this.selectSection(currentChapter.sections[currentSectionIndex + 1])
      } else if (currentChapterIndex < this.courseChapters.length - 1) {
        // 下一章节的第一节
        const nextChapter = this.courseChapters[currentChapterIndex + 1]
        this.selectSection(nextChapter.sections[0])
        this.activeNames = [nextChapter.id.toString()]
      } else {
        this.$message.info('已经是最后一节了')
      }
    },
    handleMaterialSearch() {
      this.currentPage = 1
      this.loadLearningMaterials()
    },
    resetMaterialSearch() {
      this.searchForm = {
        materialName: '',
        materialType: ''
      }
    },
    handleSizeChange(size) {
      this.pageSize = size
      if (this.selectedTab === 'materials') {
        this.loadLearningMaterials()
      } else if (this.selectedTab === 'discussion') {
        this.loadDiscussions()
      }
    },
    handleCurrentChange(current) {
      this.currentPage = current
      this.loadLearningMaterials()
    },
    handleDiscussionSizeChange(size) {
      this.pageSize = size
    },
    handleDiscussionCurrentChange(current) {
      this.discussionPage = current
      this.loadDiscussions()
    },
    viewMaterial(material) {
      const courseId = this.$route.params.id || 1
      
      api.get(`/student/courses/${courseId}/materials/${material.id}/view`)
        .then(() => {
          this.$message.success(`查看资料：${material.name}`)
          // 可以在这里打开资料查看器或跳转到资料查看页面
          window.open(`${api.defaults.baseURL}/student/courses/${courseId}/materials/${material.id}/view`, '_blank')
        })
        .catch(error => {
          console.error('查看资料失败:', error)
          this.$message.warning('无法通过在线方式查看资料，正在尝试下载')
          // 失败时尝试下载作为后备方案
          this.downloadMaterial(material)
        })
    },
    downloadMaterial(material) {
      const courseId = this.$route.params.id || 1
      
      // 尝试获取下载链接
      api.get(`/student/courses/${courseId}/materials/${material.id}/download-link`)
        .then(response => {
          // 获取下载链接
          const downloadUrl = response.data.url || `${api.defaults.baseURL}/student/courses/${courseId}/materials/${material.id}/download`
          const link = document.createElement('a')
          link.href = downloadUrl
          link.download = material.name
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          
          this.$message.success(`开始下载资料：${material.name}`)
          
          // 记录下载行为
          api.post(`/student/courses/${courseId}/materials/${material.id}/download`)
            .catch(() => {})
        })
        .catch(error => {
          console.error('获取下载链接失败:', error)
          // 失败时直接尝试下载
          const downloadUrl = `${api.defaults.baseURL}/student/courses/${courseId}/materials/${material.id}/download`
          const link = document.createElement('a')
          link.href = downloadUrl
          link.download = material.name
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          
          this.$message.warning(`尝试直接下载：${material.name}`)
        })
    },
    submitDiscussion() {
      if (!this.discussionForm.title || !this.discussionForm.content) {
        this.$message.error('请填写讨论主题和内容')
        return
      }
      
      this.loading = true
      const courseId = this.$route.params.id || 1
      const discussionData = {
        ...this.discussionForm,
        courseId
      }
      
      api.post('/student/discussions', discussionData)
        .then(() => {
          this.$message.success('讨论发布成功')
          this.discussionForm = { title: '', content: '' }
          this.loadDiscussions() // 重新加载讨论列表
        })
        .catch(error => {
          console.error('发布讨论失败:', error)
          this.$message.error('发布失败，请检查网络连接后重试')
          this.discussionForm = { title: '', content: '' }
        })
        .finally(() => {
          this.loading = false
        })
    },

    // 模拟数据方法作为后备
    useMockData() {
      this.currentCourse = this.useMockCourseData()
      this.courseChapters = this.useMockChaptersData()
      this.learningMaterials = this.useMockMaterialsData()
      this.discussions = this.useMockDiscussionsData()
      this.totalMaterials = this.learningMaterials.length
      this.totalDiscussions = this.discussions.length
    },

    useMockCourseData() {
      return {
        id: 1,
        courseName: '高等数学',
        teacher: '张老师',
        totalHours: 64,
        learnedHours: 24,
        remainingHours: 40,
        progress: 37.5,
        avatar: ''
      }
    },

    useMockChaptersData() {
      return [
        {
          id: 1,
          title: '第1章 函数与极限',
          sections: [
            { id: 101, title: '1.1 函数的概念', type: 'video', duration: '45分钟', status: 'completed' },
            { id: 102, title: '1.2 数列的极限', type: 'video', duration: '50分钟', status: 'completed' },
            { id: 103, title: '1.3 函数的极限', type: 'video', duration: '55分钟', status: 'in_progress' },
            { id: 104, title: '第一章习题集', type: 'document', duration: 'PDF', status: '' }
          ]
        },
        {
          id: 2,
          title: '第2章 导数与微分',
          sections: [
            { id: 201, title: '2.1 导数的概念', type: 'video', duration: '48分钟', status: '' },
            { id: 202, title: '2.2 导数的计算法则', type: 'video', duration: '52分钟', status: '' },
            { id: 203, title: '2.3 高阶导数', type: 'video', duration: '40分钟', status: '' },
            { id: 204, title: '第二章习题集', type: 'document', duration: 'PDF', status: '' }
          ]
        },
        {
          id: 3,
          title: '第3章 微分中值定理与导数的应用',
          sections: [
            { id: 301, title: '3.1 微分中值定理', type: 'video', duration: '45分钟', status: '' },
            { id: 302, title: '3.2 洛必达法则', type: 'video', duration: '40分钟', status: '' },
            { id: 303, title: '3.3 函数的单调性与极值', type: 'video', duration: '50分钟', status: '' }
          ]
        }
      ]
    },

    useMockMaterialsData() {
      return [
        { id: 1, name: '高等数学第一章讲义.pdf', description: '第一章函数与极限的详细讲义', type: 'document', uploadTime: '2025-09-01', size: '2.5MB', downloadCount: 128 },
        { id: 2, name: '函数的概念.mp4', description: '函数概念的讲解视频', type: 'video', uploadTime: '2025-09-02', size: '156MB', downloadCount: 95 },
        { id: 3, name: '极限练习题集.pdf', description: '极限部分的练习题及答案', type: 'document', uploadTime: '2025-09-03', size: '1.2MB', downloadCount: 87 },
        { id: 4, name: '导数的几何意义.png', description: '导数几何意义的图示说明', type: 'image', uploadTime: '2025-09-04', size: '0.8MB', downloadCount: 64 },
        { id: 5, name: '微分应用讲解.mp3', description: '微分应用的音频讲解', type: 'audio', uploadTime: '2025-09-05', size: '25MB', downloadCount: 42 }
      ]
    },

    useMockDiscussionsData() {
      return [
        {
          id: 1,
          title: '关于函数极限的一个疑问',
          content: '在学习函数极限时，对于左极限和右极限的关系不是很理解，有没有同学能解释一下？',
          author: '王同学',
          time: '2025-10-20 10:30',
          replyCount: 3,
          likeCount: 5
        },
        {
          id: 2,
          title: '分享一个导数计算的技巧',
          content: '最近学习导数计算时，发现了一个简化复合函数求导的小技巧，分享给大家...',
          author: '李同学',
          time: '2025-10-19 16:45',
          replyCount: 8,
          likeCount: 12
        }
      ]
    },
    replyDiscussion(discussion) {
      // 实际应用中可以打开回复模态框
      this.$message.info(`回复讨论：${discussion?.title || '未知讨论'}`)
      // 预留API调用接口
      // api.post(`/student/discussions/${discussion.id}/replies`, { content: replyContent })
    },
    likeDiscussion(discussion) {
      // 添加API调用
      api.post(`/student/discussions/${discussion.id}/like`)
        .then(() => {
          discussion.likeCount++
          this.$message.success('点赞成功')
        })
        .catch(error => {
          console.error('点赞失败:', error)
          this.$message.error('点赞操作失败')
          // 本地模拟点赞成功
          discussion.likeCount++
        })
    },
    getProgressStatus(progress) {
      if (progress >= 80) return 'success'
      if (progress >= 60) return 'primary'
      if (progress >= 40) return 'warning'
      return 'danger'
    },
    getStatusTag(status) {
      const statusMap = {
        completed: 'success',
        in_progress: 'primary',
        not_started: 'warning'
      }
      return statusMap[status] || 'default'
    },
    getStatusText(status) {
      const statusMap = {
        completed: '已完成',
        in_progress: '进行中',
        not_started: '未开始'
      }
      return statusMap[status] || status
    },
    getMaterialTypeTag(type) {
      const typeMap = {
        document: 'primary',
        video: 'success',
        audio: 'warning',
        image: 'info'
      }
      return typeMap[type] || 'default'
    },
    getMaterialTypeText(type) {
      const typeMap = {
        document: '文档',
        video: '视频',
        audio: '音频',
        image: '图片'
      }
      return typeMap[type] || type
    },
    getInitials(name) {
      if (!name) return '课'
      return name.charAt(0)
    }
  }
}
</script>

<style scoped>
.learning-container {
  padding: 20px;
}

.learning-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 课程内容标签页样式 */
.course-info-card {
  margin-bottom: 20px;
}

.course-info-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.course-info-details h3 {
  margin: 0 0 10px 0;
}

.course-info-details p {
  margin: 0 0 10px 0;
  color: #606266;
}

.course-meta {
  display: flex;
  gap: 10px;
}

.course-progress {
  margin-top: 20px;
}

.course-chapters {
  display: flex;
  gap: 20px;
}

.chapters-card {
  width: 30%;
}

.chapters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin-bottom: 5px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.section-item:hover {
  background-color: #f5f7fa;
}

.section-item.active-section {
  background-color: #ecf5ff;
  border-left: 3px solid #409eff;
}

.section-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.section-details {
  flex: 1;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 5px;
}

.section-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: #909399;
}

.learning-content {
  width: 70%;
}

.content-display-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content-display-body {
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.video-placeholder,
.document-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 20px;
}

.video-icon,
.document-icon {
  font-size: 64px;
  color: #909399;
  margin-bottom: 20px;
}

.video-controls,
.document-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.empty-content {
  padding: 60px 0;
}

/* 学习资料标签页样式 */
.materials-search-card {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  align-items: center;
}

.materials-list-card {
  margin-bottom: 20px;
}

.material-name {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 课程讨论标签页样式 */
.discussion-input-card {
  margin-bottom: 20px;
}

.discussion-list-card {
  margin-bottom: 20px;
}

.discussion-item {
  padding: 0;
  margin-bottom: 15px;
}

.discussion-card {
  margin: 0;
}

.discussion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.discussion-header h4 {
  margin: 0;
}

.discussion-time {
  font-size: 12px;
  color: #909399;
}

.discussion-author {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  color: #606266;
}

.discussion-content {
  margin-bottom: 15px;
  line-height: 1.8;
}

.discussion-actions {
  display: flex;
  gap: 20px;
}
</style>