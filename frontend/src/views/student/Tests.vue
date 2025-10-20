<template>
  <div class="tests-container">
    <el-card class="tests-card">
      <template #header>
        <div class="card-header">
          <span>在线测试</span>
        </div>
      </template>

      <!-- 测试状态标签页 -->
      <el-tabs v-model="activeTab" @tab-click="handleTabClick" class="tests-tabs">
        <el-tab-pane label="待参加" name="pending">
          <span class="tab-badge" v-if="pendingTestsCount > 0">{{ pendingTestsCount }}</span>
        </el-tab-pane>
        <el-tab-pane label="进行中" name="ongoing">
          <span class="tab-badge" v-if="ongoingTestsCount > 0">{{ ongoingTestsCount }}</span>
        </el-tab-pane>
        <el-tab-pane label="已完成" name="completed"></el-tab-pane>
        <el-tab-pane label="已过期" name="expired"></el-tab-pane>
      </el-tabs>

      <!-- 搜索和筛选区域 -->
      <el-card class="search-filter-card" shadow="never">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="课程名称">
            <el-input v-model="searchForm.courseName" placeholder="请输入课程名称"></el-input>
          </el-form-item>
          <el-form-item label="测试名称">
            <el-input v-model="searchForm.testName" placeholder="请输入测试名称"></el-input>
          </el-form-item>
          <el-form-item label="测试类型">
            <el-select v-model="searchForm.testType" placeholder="选择测试类型">
              <el-option label="全部" value="all"></el-option>
              <el-option label="期中考试" value="midterm"></el-option>
              <el-option label="期末考试" value="final"></el-option>
              <el-option label="单元测试" value="unit"></el-option>
              <el-option label="随堂测验" value="quiz"></el-option>
              <el-option label="专题测试" value="topic"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 测试列表 -->
      <div class="tests-list">
        <!-- 待参加和进行中的测试卡片 -->
        <template v-if="activeTab === 'pending' || activeTab === 'ongoing'">
          <div
            v-for="test in filteredTests"
            :key="test.id"
            class="test-card"
          >
            <el-card shadow="hover">
              <template #header>
                <div class="test-card-header">
                  <div class="test-card-title">
                    <h4>{{ test.title }}</h4>
                    <el-tag :type="getTestTypeTagType(test.type)">{{ getTestTypeText(test.type) }}</el-tag>
                    <span v-if="test.important" class="important-badge">重要</span>
                  </div>
                  <div class="test-card-status">
                    <el-tag :type="getTestStatusTagType(test.status)">
                      {{ getTestStatusText(test.status) }}
                    </el-tag>
                  </div>
                </div>
              </template>

              <div class="test-card-body">
                <div class="test-card-info">
                  <div class="info-item">
                    <el-icon><School /></el-icon>
                    <span>{{ test.courseName }}</span>
                  </div>
                  <div class="info-item">
                    <el-icon><User /></el-icon>
                    <span>{{ test.teacherName }}</span>
                  </div>
                  <div class="info-item">
                    <el-icon><Timer /></el-icon>
                    <span>{{ test.duration }}分钟</span>
                  </div>
                  <div class="info-item">
                    <el-icon><Star /></el-icon>
                    <span>满分: {{ test.fullScore }}分</span>
                  </div>
                </div>

                <div class="test-card-schedule">
                  <div class="schedule-item">
                    <span class="schedule-label">开始时间：</span>
                    <span>{{ formatDateTime(test.startTime) }}</span>
                  </div>
                  <div class="schedule-item">
                    <span class="schedule-label">结束时间：</span>
                    <span>{{ formatDateTime(test.endTime) }}</span>
                  </div>
                  <div v-if="activeTab === 'pending'" class="schedule-item countdown">
                    <el-icon><Clock /></el-icon>
                    <span>距离开始: {{ getTimeLeft(test.startTime) }}</span>
                  </div>
                  <div v-else-if="activeTab === 'ongoing'" class="schedule-item countdown warning">
                    <el-icon><Clock /></el-icon>
                    <span>剩余时间: {{ getTimeLeft(test.endTime) }}</span>
                  </div>
                </div>

                <div class="test-card-description">
                  <p>{{ test.description }}</p>
                </div>

                <div v-if="test.instructions" class="test-card-instructions">
                  <h5>考试须知：</h5>
                  <ul>
                    <li v-for="(instruction, index) in test.instructions" :key="index">{{ instruction }}</li>
                  </ul>
                </div>
              </div>

              <template #footer>
                <div class="test-card-footer">
                  <div class="test-card-actions">
                    <el-button type="primary" @click="viewTestDetails(test)">查看详情</el-button>
                    <el-button 
                      v-if="activeTab === 'pending' || activeTab === 'ongoing'" 
                      type="success" 
                      :loading="test.id === currentTestId && test.status === 'ongoing'"
                      @click="startOrContinueTest(test)"
                    >
                      {{ test.status === 'pending' ? '开始测试' : '继续测试' }}
                    </el-button>
                  </div>
                </div>
              </template>
            </el-card>
          </div>
        </template>

        <!-- 已完成和已过期的测试表格 -->
        <template v-else>
          <el-table :data="filteredTests" style="width: 100%">
            <el-table-column prop="title" label="测试名称" min-width="180">
              <template #default="scope">
                <div>
                  <div class="test-title">{{ scope.row.title }}</div>
                  <div class="test-subtitle">{{ scope.row.courseName }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="测试类型" width="100">
              <template #default="scope">
                <el-tag :type="getTestTypeTagType(scope.row.type)">
                  {{ getTestTypeText(scope.row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="teacherName" label="出题老师" width="100"></el-table-column>
            <el-table-column prop="score" label="得分" width="80" v-if="activeTab === 'completed'">
              <template #default="scope">
                <div class="score-display">
                  <span class="score-value">{{ scope.row.score }}</span>
                  <span class="score-full">/{{ scope.row.fullScore }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="submitTime" label="提交时间" width="150" v-if="activeTab === 'completed'">
              <template #default="scope">
                {{ formatDateTime(scope.row.submitTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="endTime" label="结束时间" width="150" v-if="activeTab === 'expired'">
              <template #default="scope">
                {{ formatDateTime(scope.row.endTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="80">
              <template #default="scope">
                <el-tag :type="getTestStatusTagType(scope.row.status)">
                  {{ getTestStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="scope">
                <el-button type="primary" size="small" @click="viewTestDetails(scope.row)">
                  查看详情
                </el-button>
                <el-button 
                  v-if="activeTab === 'completed' && scope.row.allowReview" 
                  type="success" 
                  size="small" 
                  @click="reviewTest(scope.row)"
                >
                  查看答卷
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </template>

        <!-- 空状态 -->
        <div v-if="filteredTests.length === 0" class="empty-state">
          <el-empty description="暂无测试"></el-empty>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-container" v-if="activeTab === 'completed' || activeTab === 'expired'">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredTests.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </el-card>

    <!-- 测试详情对话框 -->
    <el-dialog
      v-model="showTestDetailsDialog"
      :title="selectedTest?.title + ' - 详情'"
      width="70%"
      :before-close="handleCloseTestDetailsDialog"
    >
      <div v-if="selectedTest" class="test-details">
        <div class="test-details-header">
          <div class="test-details-info">
            <el-descriptions border :column="{ xs: 1, sm: 2, md: 3, lg: 4 }">
              <el-descriptions-item label="测试名称">{{ selectedTest.title }}</el-descriptions-item>
              <el-descriptions-item label="课程名称">{{ selectedTest.courseName }}</el-descriptions-item>
              <el-descriptions-item label="测试类型">
                <el-tag :type="getTestTypeTagType(selectedTest.type)">
                  {{ getTestTypeText(selectedTest.type) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="出题老师">{{ selectedTest.teacherName }}</el-descriptions-item>
              <el-descriptions-item label="测试时长">{{ selectedTest.duration }}分钟</el-descriptions-item>
              <el-descriptions-item label="总分值">{{ selectedTest.fullScore }}分</el-descriptions-item>
              <el-descriptions-item label="开始时间">{{ formatDateTime(selectedTest.startTime) }}</el-descriptions-item>
              <el-descriptions-item label="结束时间">{{ formatDateTime(selectedTest.endTime) }}</el-descriptions-item>
              <el-descriptions-item label="测试状态" v-if="activeTab === 'completed' || activeTab === 'expired'">
                <el-tag :type="getTestStatusTagType(selectedTest.status)">
                  {{ getTestStatusText(selectedTest.status) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="我的得分" v-if="activeTab === 'completed'">
                <div class="score-display">
                  <span class="score-value">{{ selectedTest.score }}</span>
                  <span class="score-full">/{{ selectedTest.fullScore }}</span>
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="提交时间" v-if="activeTab === 'completed'">
                {{ formatDateTime(selectedTest.submitTime) }}
              </el-descriptions-item>
              <el-descriptions-item label="正确率" v-if="activeTab === 'completed'">
                {{ selectedTest.correctRate }}%
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>

        <div class="test-details-content">
          <el-card class="description-card" shadow="never">
            <template #header>
              <div class="card-subtitle">测试说明</div>
            </template>
            <div class="test-description">
              <p>{{ selectedTest.description }}</p>
            </div>
          </el-card>

          <el-card class="instructions-card" shadow="never">
            <template #header>
              <div class="card-subtitle">考试须知</div>
            </template>
            <div class="test-instructions">
              <ul v-if="selectedTest.instructions && selectedTest.instructions.length > 0">
                <li v-for="(instruction, index) in selectedTest.instructions" :key="index">{{ instruction }}</li>
              </ul>
              <p v-else>暂无考试须知</p>
            </div>
          </el-card>

          <el-card class="questions-card" shadow="never">
            <template #header>
              <div class="card-subtitle">题目结构</div>
            </template>
            <div class="questions-structure">
              <el-table :data="selectedTest.questionStructure" style="width: 100%">
                <el-table-column prop="type" label="题型"></el-table-column>
                <el-table-column prop="count" label="题数"></el-table-column>
                <el-table-column prop="score" label="每题分值"></el-table-column>
                <el-table-column prop="totalScore" label="总分值"></el-table-column>
              </el-table>
            </div>
          </el-card>
        </div>

        <div class="dialog-footer">
          <el-button @click="handleCloseTestDetailsDialog">关闭</el-button>
          <el-button 
            v-if="(activeTab === 'pending' || activeTab === 'ongoing')" 
            type="success" 
            @click="startOrContinueTest(selectedTest)"
          >
            {{ selectedTest.status === 'pending' ? '开始测试' : '继续测试' }}
          </el-button>
          <el-button 
            v-if="activeTab === 'completed' && selectedTest.allowReview" 
            type="primary" 
            @click="reviewTest(selectedTest)"
          >
            查看答卷
          </el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 测试进行中对话框 -->
    <el-dialog
      v-model="showTestDialog"
      :title="currentTest?.title"
      width="80%"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div v-if="currentTest" class="test-dialog">
        <div class="test-header">
          <div class="test-info">
            <div class="test-title">{{ currentTest.title }}</div>
            <div class="test-course">{{ currentTest.courseName }}</div>
          </div>
          <div class="test-timer warning">
            <el-icon><Timer /></el-icon>
            <span class="timer-text">{{ remainingTime }}</span>
          </div>
        </div>

        <div class="test-content">
          <div class="test-sidebar">
            <div class="sidebar-header">
              <h4>题目导航</h4>
              <el-button type="text" @click="toggleFullScreen">{{ isFullScreen ? '退出全屏' : '进入全屏' }}</el-button>
            </div>
            <div class="question-nav">
              <div 
                v-for="(question, index) in questions" 
                :key="index"
                :class="[
                  'question-nav-item',
                  { 
                    'current': currentQuestionIndex === index,
                    'answered': question.isAnswered,
                    'marked': question.isMarked
                  }
                ]"
                @click="goToQuestion(index)"
              >
                {{ index + 1 }}
              </div>
            </div>
            <div class="nav-footer">
              <div class="nav-stats">
                <div class="nav-stat-item">
                  <span class="nav-stat-label">总题数：</span>
                  <span class="nav-stat-value">{{ questions.length }}</span>
                </div>
                <div class="nav-stat-item">
                  <span class="nav-stat-label">已答题：</span>
                  <span class="nav-stat-value answered">{{ answeredCount }}</span>
                </div>
                <div class="nav-stat-item">
                  <span class="nav-stat-label">未答题：</span>
                  <span class="nav-stat-value unanswered">{{ unansweredCount }}</span>
                </div>
                <div class="nav-stat-item">
                  <span class="nav-stat-label">已标记：</span>
                  <span class="nav-stat-value marked">{{ markedCount }}</span>
                </div>
              </div>
              <div class="nav-legend">
                <div class="legend-item">
                  <span class="legend-color"></span>
                  <span class="legend-text">未答题</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color answered"></span>
                  <span class="legend-text">已答题</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color marked"></span>
                  <span class="legend-text">已标记</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color current"></span>
                  <span class="legend-text">当前题</span>
                </div>
              </div>
            </div>
          </div>

          <div class="test-main">
            <div class="question-header">
              <div class="question-number">第 {{ currentQuestionIndex + 1 }} 题（{{ getQuestionTypeText(currentQuestion?.type) }}，{{ currentQuestion?.score }}分）</div>
              <el-button 
                type="text" 
                :class="['mark-button', { 'marked': currentQuestion?.isMarked }]"
                @click="toggleMark"
              >
                <el-icon><Star :filled="currentQuestion?.isMarked"></Star></el-icon>
                {{ currentQuestion?.isMarked ? '取消标记' : '标记题目' }}
              </el-button>
            </div>

            <div class="question-content">
              <div class="question-stem" v-html="formatQuestionStem(currentQuestion?.stem)"></div>
              
              <!-- 单选题 -->
              <div v-if="currentQuestion?.type === 'single_choice'" class="question-options">
                <el-radio-group v-model="currentQuestion.answer" @change="markAsAnswered">
                  <div 
                    v-for="(option, index) in currentQuestion.options" 
                    :key="index"
                    class="option-item"
                  >
                    <el-radio :label="String.fromCharCode(65 + index)">
                      <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
                      <span class="option-text">{{ option }}</span>
                    </el-radio>
                  </div>
                </el-radio-group>
              </div>

              <!-- 多选题 -->
              <div v-else-if="currentQuestion?.type === 'multiple_choice'" class="question-options">
                <el-checkbox-group v-model="currentQuestion.answer" @change="markAsAnswered">
                  <div 
                    v-for="(option, index) in currentQuestion.options" 
                    :key="index"
                    class="option-item"
                  >
                    <el-checkbox :label="String.fromCharCode(65 + index)">
                      <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
                      <span class="option-text">{{ option }}</span>
                    </el-checkbox>
                  </div>
                </el-checkbox-group>
              </div>

              <!-- 判断题 -->
              <div v-else-if="currentQuestion?.type === 'judgment'" class="question-options">
                <el-radio-group v-model="currentQuestion.answer" @change="markAsAnswered">
                  <div class="option-item">
                    <el-radio :label="'正确'">
                      <span class="option-label">A.</span>
                      <span class="option-text">正确</span>
                    </el-radio>
                  </div>
                  <div class="option-item">
                    <el-radio :label="'错误'">
                      <span class="option-label">B.</span>
                      <span class="option-text">错误</span>
                    </el-radio>
                  </div>
                </el-radio-group>
              </div>

              <!-- 填空题 -->
              <div v-else-if="currentQuestion?.type === 'fill'" class="question-fill">
                <div 
                  v-for="(blank, index) in currentQuestion.blanks" 
                  :key="index"
                  class="fill-item"
                >
                  <div class="fill-number">第 {{ index + 1 }} 空：</div>
                  <el-input 
                    v-model="currentQuestion.answer[index]"
                    placeholder="请输入答案"
                    @change="markAsAnswered"
                  ></el-input>
                </div>
              </div>

              <!-- 简答题 -->
              <div v-else-if="currentQuestion?.type === 'short_answer'" class="question-short-answer">
                <el-input 
                  v-model="currentQuestion.answer"
                  type="textarea"
                  :rows="6"
                  placeholder="请输入答案"
                  @change="markAsAnswered"
                ></el-input>
              </div>

              <!-- 编程题 -->
              <div v-else-if="currentQuestion?.type === 'programming'" class="question-programming">
                <div class="programming-description">
                  <p>{{ currentQuestion.description }}</p>
                </div>
                <div class="programming-input">
                  <el-input 
                    v-model="currentQuestion.answer"
                    type="textarea"
                    :rows="10"
                    placeholder="请输入代码"
                    @change="markAsAnswered"
                  ></el-input>
                </div>
                <div class="programming-actions">
                  <el-button type="primary" size="small" @click="runCode">运行代码</el-button>
                  <el-button type="success" size="small" @click="submitCode">提交测试</el-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="test-footer">
          <div class="warning-message">
            <el-icon><Warning /></el-icon>
            <span>请确保所有题目都已完成，提交后将无法修改！</span>
          </div>
          <div class="test-actions">
            <el-button @click="previousQuestion" :disabled="currentQuestionIndex === 0">上一题</el-button>
            <el-button @click="nextQuestion" :disabled="currentQuestionIndex === questions.length - 1">下一题</el-button>
            <el-button type="primary" @click="saveTest">保存答题</el-button>
            <el-button type="danger" @click="confirmSubmitTest">提交试卷</el-button>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 提交确认对话框 -->
    <el-dialog
      v-model="showSubmitConfirmDialog"
      title="提交确认"
      width="40%"
      :before-close="handleCloseSubmitConfirmDialog"
    >
      <div class="submit-confirm">
        <div class="confirm-icon">
          <el-icon><Warning /></el-icon>
        </div>
        <div class="confirm-message">
          <h3>确定要提交试卷吗？</h3>
          <p>提交后将无法修改答案，确认是否提交？</p>
          <div class="confirm-stats">
            <div class="confirm-stat-item">
              <span class="confirm-stat-label">总题数：</span>
              <span class="confirm-stat-value">{{ questions.length }}</span>
            </div>
            <div class="confirm-stat-item">
              <span class="confirm-stat-label">已答题：</span>
              <span class="confirm-stat-value answered">{{ answeredCount }}</span>
            </div>
            <div class="confirm-stat-item">
              <span class="confirm-stat-label">未答题：</span>
              <span class="confirm-stat-value unanswered">{{ unansweredCount }}</span>
            </div>
          </div>
          <div v-if="unansweredCount > 0" class="confirm-warning">
            <el-icon><Warning /></el-icon>
            <span>您还有 {{ unansweredCount }} 道题未作答，提交后将视为放弃这些题目的分数。</span>
          </div>
        </div>
      </div>
      <div class="dialog-footer">
        <el-button @click="handleCloseSubmitConfirmDialog">取消</el-button>
        <el-button type="danger" @click="submitTest">确认提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { School, User, Timer, Star, Clock, Warning } from '@element-plus/icons-vue'
import api from '../../services/axios'

export default {
  name: 'StudentTests',
  components: {
    School,
    User,
    Timer,
    Star,
    Clock,
    Warning
  },
  data() {
    return {
      activeTab: 'pending',
      currentPage: 1,
      pageSize: 10,
      searchForm: {
        courseName: '',
        testName: '',
        testType: 'all'
      },
      showTestDetailsDialog: false,
      showTestDialog: false,
      showSubmitConfirmDialog: false,
      selectedTest: null,
      currentTest: null,
      currentTestId: null,
      currentQuestionIndex: 0,
      remainingTime: '60:00',
      isFullScreen: false,
      timer: null,
      // 从后端获取的测试数据
      tests: [],
      // 从后端获取的题目数据
      questions: []
    }
  },
  computed: {
    filteredTests() {
      let filtered = [...this.tests]

      // 按状态筛选
      if (this.activeTab === 'pending') {
        filtered = filtered.filter(test => test.status === 'pending')
      } else if (this.activeTab === 'ongoing') {
        filtered = filtered.filter(test => test.status === 'ongoing')
      } else if (this.activeTab === 'completed') {
        filtered = filtered.filter(test => test.status === 'completed')
      } else if (this.activeTab === 'expired') {
        filtered = filtered.filter(test => test.status === 'expired')
      }

      // 按课程名称搜索
      if (this.searchForm.courseName) {
        filtered = filtered.filter(test => 
          test.courseName.toLowerCase().includes(this.searchForm.courseName.toLowerCase())
        )
      }

      // 按测试名称搜索
      if (this.searchForm.testName) {
        filtered = filtered.filter(test => 
          test.title.toLowerCase().includes(this.searchForm.testName.toLowerCase())
        )
      }

      // 按测试类型筛选
      if (this.searchForm.testType !== 'all') {
        filtered = filtered.filter(test => test.type === this.searchForm.testType)
      }

      // 按开始时间排序（待参加和进行中的测试按时间升序，其他按时间降序）
      if (this.activeTab === 'pending' || this.activeTab === 'ongoing') {
        filtered.sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      } else {
        filtered.sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
      }

      return filtered
    },
    paginatedTests() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredTests.slice(start, end)
    },
    pendingTestsCount() {
      return this.tests.filter(test => test.status === 'pending').length
    },
    ongoingTestsCount() {
      return this.tests.filter(test => test.status === 'ongoing').length
    },
    currentQuestion() {
      return this.questions[this.currentQuestionIndex] || null
    },
    answeredCount() {
      return this.questions.filter(q => q.isAnswered).length
    },
    unansweredCount() {
      return this.questions.filter(q => !q.isAnswered).length
    },
    markedCount() {
      return this.questions.filter(q => q.isMarked).length
    }
  },
  methods: {
    handleTabClick() {
      this.currentPage = 1
    },
    handleSearch() {
      this.currentPage = 1
    },
    resetSearch() {
      this.searchForm = {
        courseName: '',
        testName: '',
        testType: 'all'
      }
      this.currentPage = 1
    },
    handleSizeChange(size) {
      this.pageSize = size
    },
    handleCurrentChange(current) {
      this.currentPage = current
    },
    getTestTypeTagType(type) {
      const typeMap = {
        midterm: 'primary',
        final: 'danger',
        unit: 'warning',
        quiz: 'info',
        topic: 'success'
      }
      return typeMap[type] || 'default'
    },
    getTestTypeText(type) {
      const typeMap = {
        midterm: '期中考试',
        final: '期末考试',
        unit: '单元测试',
        quiz: '随堂测验',
        topic: '专题测试'
      }
      return typeMap[type] || type
    },
    getQuestionTypeText(type) {
      const typeMap = {
        single_choice: '单选题',
        multiple_choice: '多选题',
        judgment: '判断题',
        fill: '填空题',
        short_answer: '简答题',
        programming: '编程题'
      }
      return typeMap[type] || type
    },
    getTestStatusTagType(status) {
      const statusMap = {
        pending: 'primary',
        ongoing: 'warning',
        completed: 'success',
        expired: 'danger'
      }
      return statusMap[status] || 'default'
    },
    getTestStatusText(status) {
      const statusMap = {
        pending: '待参加',
        ongoing: '进行中',
        completed: '已完成',
        expired: '已过期'
      }
      return statusMap[status] || status
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
    getTimeLeft(targetTime) {
      const now = new Date()
      const target = new Date(targetTime)
      const diff = Math.floor((target - now) / 1000)
      
      if (diff <= 0) {
        return '00:00:00'
      }
      
      const hours = Math.floor(diff / 3600)
      const minutes = Math.floor((diff % 3600) / 60)
      const seconds = diff % 60
      
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    },
    viewTestDetails(test) {
      this.selectedTest = { ...test }
      this.showTestDetailsDialog = true
    },
    handleCloseTestDetailsDialog() {
      this.selectedTest = null
      this.showTestDetailsDialog = false
    },
    async startOrContinueTest(test) {
      this.currentTest = { ...test }
      this.currentTestId = test.id
      this.currentQuestionIndex = 0
      this.showTestDialog = true
      
      // 获取测试题目
      await this.fetchTestQuestions(test.id)
      
      // 启动计时器
      this.startTimer()
      
      // 更新测试状态
      if (test.status === 'pending') {
        try {
          // 调用API更新测试状态
        await api.put(`/tests/${test.id}/start`)
          // 更新本地状态
          const testIndex = this.tests.findIndex(t => t.id === test.id)
          if (testIndex !== -1) {
            this.tests[testIndex].status = 'ongoing'
            this.tests[testIndex].hasStarted = true
          }
        } catch (error) {
          console.error('开始测试失败:', error)
          this.$message.error('开始测试失败')
        }
      }
    },
    async reviewTest(test) {
      try {
        // 调用API获取答卷数据
        const response = await api.get(`/tests/${test.id}/review`)
        // 这里应该跳转到答卷查看页面或显示答卷详情
        this.$message.success('跳转到答卷查看页面')
      } catch (error) {
        console.error('获取答卷数据失败:', error)
        this.$message.error('获取答卷数据失败')
      }
    },
    // 获取测试列表
    async fetchTests() {
      try {
        const response = await api.get('/tests')
        this.tests = response.data
      } catch (error) {
        console.error('获取测试列表失败:', error)
        this.$message.error('获取测试列表失败')
        this.tests = []
      }
    },
    
    // 获取测试题目
    async fetchTestQuestions(testId) {
      try {
        const response = await api.get(`/tests/${testId}/questions`)
        this.questions = response.data.map(q => ({
          ...q,
          isAnswered: !!q.answer && (q.type !== 'multiple_choice' || q.answer.length > 0),
          isMarked: q.isMarked || false
        }))
      } catch (error) {
        console.error('获取测试题目失败:', error)
        this.$message.error('获取测试题目失败')
        this.questions = []
      }
    },
            isMarked: false
          }
        ]
      } else if (this.currentTest.type === 'midterm') {
        // 期中考试模拟题目
        this.questions = [
          {
            id: 1,
            type: 'single_choice',
            stem: '以下哪个是Python的基本数据类型？',
            options: ['Array', 'List', 'ArrayList', 'Vector'],
            answer: '',
            score: 2,
            isAnswered: true,
            isMarked: false
          },
          {
            id: 2,
            type: 'single_choice',
            stem: 'Python中，以下哪个语句用于捕获异常？',
            options: ['try', 'catch', 'except', 'finally'],
            answer: '',
            score: 2,
            isAnswered: false,
            isMarked: true
          },
          {
            id: 3,
            type: 'programming',
            stem: '编写一个函数，计算斐波那契数列的第n项。',
            description: '斐波那契数列的定义为：F(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2) (n ≥ 2)。请编写一个函数，输入n，返回斐波那契数列的第n项。',
            answer: '',
            score: 10,
            isAnswered: false,
            isMarked: false
          }
        ]
      }
    },
    formatQuestionStem(stem) {
      // 将题目内容中的特殊字符转换为HTML格式
      return stem.replace(/\n/g, '<br>')
    },
    startTimer() {
      // 清除之前的计时器
      if (this.timer) {
        clearInterval(this.timer)
      }
      
      // 计算剩余时间
      const now = new Date()
      const endTime = new Date(this.currentTest.endTime)
      let remainingSeconds = Math.floor((endTime - now) / 1000)
      
      // 初始化剩余时间显示
      this.updateRemainingTime(remainingSeconds)
      
      // 启动计时器
      this.timer = setInterval(() => {
        remainingSeconds--
        
        if (remainingSeconds <= 0) {
          // 时间到，自动提交
          clearInterval(this.timer)
          this.autoSubmitTest()
          return
        }
        
        this.updateRemainingTime(remainingSeconds)
      }, 1000)
    },
    updateRemainingTime(seconds) {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = seconds % 60
      
      if (hours > 0) {
        this.remainingTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      } else {
        this.remainingTime = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      }
    },
    previousQuestion() {
      if (this.currentQuestionIndex > 0) {
        this.currentQuestionIndex--
      }
    },
    nextQuestion() {
      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.currentQuestionIndex++
      }
    },
    goToQuestion(index) {
      this.currentQuestionIndex = index
    },
    markAsAnswered() {
      if (this.currentQuestion) {
        this.currentQuestion.isAnswered = true
      }
    },
    toggleMark() {
      if (this.currentQuestion) {
        this.currentQuestion.isMarked = !this.currentQuestion.isMarked
      }
    },
    toggleFullScreen() {
      this.isFullScreen = !this.isFullScreen
      // 实际应用中这里应该实现全屏切换逻辑
    },
    async saveTest() {
      try {
        // 调用API保存答题进度
        await api.post(`/tests/${this.currentTestId}/save`, {
          questions: this.questions
        })
        
        // 更新最后保存时间
        if (this.currentTest) {
          const testIndex = this.tests.findIndex(t => t.id === this.currentTest.id)
          if (testIndex !== -1) {
            this.tests[testIndex].lastSavedTime = new Date().toISOString()
          }
        }
        
        this.$message.success('答题进度已保存')
      } catch (error) {
        console.error('保存答题失败:', error)
        this.$message.error('保存答题失败')
      }
    },
    confirmSubmitTest() {
      this.showSubmitConfirmDialog = true
    },
    handleCloseSubmitConfirmDialog() {
      this.showSubmitConfirmDialog = false
    },
    async submitTest() {
      try {
        // 调用API提交试卷
        const response = await api.post(`/tests/${this.currentTestId}/submit`, {
          questions: this.questions
        })
        
        this.$message.success('试卷提交成功')
        
        // 清除计时器
        if (this.timer) {
          clearInterval(this.timer)
        }
        
        // 关闭对话框
        this.showSubmitConfirmDialog = false
        this.showTestDialog = false
        this.currentTest = null
        this.currentTestId = null
        this.questions = []
        
        // 重新获取测试列表以更新状态
        await this.fetchTests()
      } catch (error) {
        console.error('提交试卷失败:', error)
        this.$message.error('提交试卷失败')
      }
    },
    autoSubmitTest() {
      // 时间到自动提交
      this.$confirm('考试时间已到，是否自动提交试卷？', '时间提醒', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.submitTest()
      }).catch(() => {
        // 用户取消自动提交，但仍然强制关闭考试窗口
        this.showTestDialog = false
        this.currentTest = null
        this.currentTestId = null
        this.questions = []
        if (this.timer) {
          clearInterval(this.timer)
        }
        this.$message.info('考试已结束')
      })
    },
    async runCode() {
      try {
        // 调用API运行代码
        const response = await api.post('/code/run', {
          code: this.currentQuestion?.answer || ''
        })
        this.$message.success('代码运行成功，控制台输出结果')
      } catch (error) {
        console.error('运行代码失败:', error)
        this.$message.error('运行代码失败')
      }
    },
    async submitCode() {
      try {
        // 调用API提交代码测试
        const response = await api.post('/code/submit', {
          code: this.currentQuestion?.answer || '',
          testId: this.currentTestId,
          questionId: this.currentQuestion?.id
        })
        this.$message.success('代码测试通过！')
        this.markAsAnswered()
      } catch (error) {
        console.error('提交代码失败:', error)
        this.$message.error('提交代码失败')
      }
    }
  },
  
  // 页面加载时获取测试列表
  async mounted() {
    await this.fetchTests()
  },
  
  watch: {
    activeTab() {
      // 切换标签页时重置分页
      this.currentPage = 1
    }
  },
  beforeUnmount() {
    // 组件卸载前清除计时器
    if (this.timer) {
      clearInterval(this.timer)
    }
  }
}
</script>

<style scoped>
.tests-container {
  padding: 20px;
}

.tests-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tests-tabs {
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

.test-card {
  margin-bottom: 20px;
}

.test-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.test-card-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.test-card-title h4 {
  margin: 0;
}

.important-badge {
  padding: 2px 8px;
  background-color: #f56c6c;
  color: #fff;
  border-radius: 4px;
  font-size: 12px;
}

.test-card-info {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 15px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #606266;
}

.test-card-schedule {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.schedule-item {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 5px;
}

.schedule-item:last-child {
  margin-bottom: 0;
}

.schedule-label {
  font-weight: 500;
  min-width: 80px;
}

.countdown {
  font-weight: 500;
}

.countdown.warning {
  color: #e6a23c;
}

.test-card-description {
  margin-bottom: 15px;
  line-height: 1.6;
}

.test-card-instructions {
  background-color: #ecf5ff;
  padding: 10px;
  border-radius: 4px;
}

.test-card-instructions h5 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #409eff;
}

.test-card-instructions ul {
  margin: 0;
  padding-left: 20px;
}

.test-card-instructions li {
  margin-bottom: 5px;
}

.test-card-footer {
  display: flex;
  justify-content: flex-end;
}

.test-card-actions {
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

/* 测试详情对话框样式 */
.test-details {
  max-height: 70vh;
  overflow-y: auto;
}

.test-details-header {
  margin-bottom: 20px;
}

.description-card,
.instructions-card,
.questions-card {
  margin-bottom: 20px;
}

.card-subtitle {
  font-size: 16px;
  font-weight: 500;
}

.test-description,
.test-instructions {
  line-height: 1.6;
}

.test-instructions ul {
  margin: 0;
  padding-left: 20px;
}

.test-instructions li {
  margin-bottom: 5px;
}

.score-display {
  display: flex;
  align-items: baseline;
}

.score-value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  margin-right: 5px;
}

.score-full {
  font-size: 14px;
  color: #909399;
}

/* 测试进行中对话框样式 */
.test-dialog {
  max-height: 80vh;
  overflow-y: auto;
}

.test-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 20px;
}

.test-info .test-title {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 5px;
}

.test-info .test-course {
  color: #606266;
}

.test-timer {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  background-color: #fdf6ec;
  border-radius: 4px;
  font-weight: 500;
}

.test-timer.warning {
  color: #e6a23c;
}

.timer-text {
  font-size: 18px;
}

.test-content {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.test-sidebar {
  width: 250px;
  flex-shrink: 0;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.sidebar-header h4 {
  margin: 0;
}

.question-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.question-nav-item {
  width: 40px;
  height: 40px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.question-nav-item:hover {
  border-color: #409eff;
  color: #409eff;
}

.question-nav-item.current {
  background-color: #409eff;
  color: #fff;
  border-color: #409eff;
}

.question-nav-item.answered {
  background-color: #f0f9eb;
  border-color: #67c23a;
}

.question-nav-item.marked {
  background-color: #fdf6ec;
  border-color: #e6a23c;
}

.nav-stats {
  margin-bottom: 15px;
}

.nav-stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.nav-stat-value.answered {
  color: #67c23a;
  font-weight: 500;
}

.nav-stat-value.unanswered {
  color: #909399;
}

.nav-stat-value.marked {
  color: #e6a23c;
  font-weight: 500;
}

.nav-legend {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border: 1px solid #dcdfe6;
  border-radius: 2px;
}

.legend-color.answered {
  background-color: #f0f9eb;
  border-color: #67c23a;
}

.legend-color.marked {
  background-color: #fdf6ec;
  border-color: #e6a23c;
}

.legend-color.current {
  background-color: #409eff;
  border-color: #409eff;
}

.test-main {
  flex: 1;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.question-number {
  font-weight: 500;
  font-size: 16px;
}

.mark-button {
  color: #909399;
}

.mark-button.marked {
  color: #e6a23c;
}

.question-content {
  margin-bottom: 20px;
}

.question-stem {
  font-size: 16px;
  line-height: 1.8;
  margin-bottom: 20px;
}

.question-options {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.option-item {
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  transition: all 0.3s;
}

.option-item:hover {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.option-label {
  font-weight: 500;
  margin-right: 10px;
}

.question-fill {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.fill-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.fill-number {
  font-weight: 500;
  min-width: 60px;
}

.question-short-answer {
  width: 100%;
}

.question-programming {
  width: 100%;
}

.programming-description {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.programming-input {
  margin-bottom: 10px;
}

.programming-actions {
  display: flex;
  gap: 10px;
}

.test-footer {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.warning-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background-color: #fdf6ec;
  border-radius: 4px;
  color: #e6a23c;
}

.test-actions {
  display: flex;
  justify-content: space-between;
}

/* 提交确认对话框样式 */
.submit-confirm {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px;
}

.confirm-icon {
  font-size: 48px;
  color: #e6a23c;
  margin-bottom: 20px;
}

.confirm-message h3 {
  margin-top: 0;
  margin-bottom: 10px;
}

.confirm-message p {
  color: #606266;
  margin-bottom: 20px;
}

.confirm-stats {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
}

.confirm-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.confirm-stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}

.confirm-stat-value {
  font-size: 24px;
  font-weight: bold;
}

.confirm-stat-value.answered {
  color: #67c23a;
}

.confirm-stat-value.unanswered {
  color: #f56c6c;
}

.confirm-warning {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  background-color: #fdf6ec;
  border-radius: 4px;
  color: #e6a23c;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .test-content {
    flex-direction: column;
  }
  
  .test-sidebar {
    width: 100%;
  }
  
  .test-actions {
    flex-direction: column;
    gap: 10px;
  }
}
</style>