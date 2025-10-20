<template>
  <div class="resources-container">
    <el-card class="resources-card">
      <template #header>
        <div class="card-header">
          <span>工具与资源</span>
          <el-button type="primary" size="small" @click="refreshResources">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <!-- 资源分类标签页 -->
      <el-tabs v-model="activeTab" @tab-click="handleTabClick" class="resources-tabs">
        <el-tab-pane label="学习资料" name="learning">
          <span class="tab-badge" v-if="newLearningMaterials > 0">{{ newLearningMaterials }}</span>
        </el-tab-pane>
        <el-tab-pane label="常用工具" name="tools"></el-tab-pane>
        <el-tab-pane label="参考书籍" name="books"></el-tab-pane>
        <el-tab-pane label="我的收藏" name="favorites">
          <span class="tab-badge" v-if="favoriteCount > 0">{{ favoriteCount }}</span>
        </el-tab-pane>
        <el-tab-pane label="历史记录" name="history"></el-tab-pane>
      </el-tabs>

      <!-- 搜索和筛选区域 -->
      <el-card class="search-filter-card" shadow="never">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="资源名称" v-if="activeTab !== 'tools'">
            <el-input v-model="searchForm.name" placeholder="请输入资源名称"></el-input>
          </el-form-item>
          <el-form-item label="工具名称" v-else>
            <el-input v-model="searchForm.name" placeholder="请输入工具名称"></el-input>
          </el-form-item>
          
          <!-- 学习资料筛选 -->
          <el-form-item label="课程" v-if="activeTab === 'learning'">
            <el-select v-model="searchForm.course" placeholder="选择课程">
              <el-option label="全部" value="all"></el-option>
              <el-option 
                v-for="course in courses" 
                :key="course.id" 
                :label="course.name" 
                :value="course.id"
              ></el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item label="类型" v-if="activeTab === 'learning'">
            <el-select v-model="searchForm.materialType" placeholder="选择资料类型">
              <el-option label="全部" value="all"></el-option>
              <el-option label="讲义" value="lecture"></el-option>
              <el-option label="课件" value="slides"></el-option>
              <el-option label="习题集" value="exercises"></el-option>
              <el-option label="实验指导" value="experiment"></el-option>
              <el-option label="其他" value="other"></el-option>
            </el-select>
          </el-form-item>
          
          <!-- 工具筛选 -->
          <el-form-item label="工具类型" v-if="activeTab === 'tools'">
            <el-select v-model="searchForm.toolType" placeholder="选择工具类型">
              <el-option label="全部" value="all"></el-option>
              <el-option label="编程工具" value="programming"></el-option>
              <el-option label="设计工具" value="design"></el-option>
              <el-option label="文档工具" value="document"></el-option>
              <el-option label="学习工具" value="learning"></el-option>
              <el-option label="其他" value="other"></el-option>
            </el-select>
          </el-form-item>
          
          <!-- 参考书籍筛选 -->
          <el-form-item label="分类" v-if="activeTab === 'books'">
            <el-select v-model="searchForm.bookCategory" placeholder="选择分类">
              <el-option label="全部" value="all"></el-option>
              <el-option label="教材" value="textbook"></el-option>
              <el-option label="教辅" value="reference"></el-option>
              <el-option label="专著" value="monograph"></el-option>
              <el-option label="期刊" value="journal"></el-option>
              <el-option label="其他" value="other"></el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item label="作者/出版社" v-if="activeTab === 'books'">
            <el-input v-model="searchForm.authorOrPublisher" placeholder="请输入作者或出版社"></el-input>
          </el-form-item>
          
          <!-- 通用搜索按钮 -->
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
        
        <!-- 高级筛选区域 -->
        <div class="advanced-filters" v-if="showAdvancedFilters">
          <el-divider>高级筛选</el-divider>
          <el-form :inline="true" :model="advancedForm">
            <!-- 学习资料高级筛选 -->
            <template v-if="activeTab === 'learning'">
              <el-form-item label="上传日期">
                <el-date-picker
                  v-model="advancedForm.dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  value-format="YYYY-MM-DD"
                ></el-date-picker>
              </el-form-item>
              <el-form-item label="文件格式">
                <el-select v-model="advancedForm.fileFormat" placeholder="选择文件格式" multiple>
                  <el-option label="PDF" value="pdf"></el-option>
                  <el-option label="Word" value="doc"></el-option>
                  <el-option label="Excel" value="xls"></el-option>
                  <el-option label="PPT" value="ppt"></el-option>
                  <el-option label="图片" value="image"></el-option>
                  <el-option label="视频" value="video"></el-option>
                  <el-option label="音频" value="audio"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="上传者">
                <el-input v-model="advancedForm.uploader" placeholder="请输入上传者"></el-input>
              </el-form-item>
            </template>
            
            <!-- 工具高级筛选 -->
            <template v-if="activeTab === 'tools'">
              <el-form-item label="是否在线">
                <el-select v-model="advancedForm.onlineStatus">
                  <el-option label="全部" value="all"></el-option>
                  <el-option label="在线使用" value="online"></el-option>
                  <el-option label="本地安装" value="offline"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="免费/付费">
                <el-select v-model="advancedForm.freeStatus">
                  <el-option label="全部" value="all"></el-option>
                  <el-option label="免费" value="free"></el-option>
                  <el-option label="付费" value="paid"></el-option>
                </el-select>
              </el-form-item>
            </template>
            
            <!-- 参考书籍高级筛选 -->
            <template v-if="activeTab === 'books'">
              <el-form-item label="出版日期">
                <el-date-picker
                  v-model="advancedForm.dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  value-format="YYYY-MM-DD"
                ></el-date-picker>
              </el-form-item>
              <el-form-item label="可获取方式">
                <el-select v-model="advancedForm.accessMethod" multiple>
                  <el-option label="在线阅读" value="online"></el-option>
                  <el-option label="下载" value="download"></el-option>
                  <el-option label="图书馆" value="library"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="ISBN">
                <el-input v-model="advancedForm.isbn" placeholder="请输入ISBN"></el-input>
              </el-form-item>
            </template>
            
            <!-- 通用高级筛选按钮 -->
            <el-form-item>
              <el-button type="primary" @click="applyAdvancedFilters">应用</el-button>
              <el-button @click="resetAdvancedFilters">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
        
        <div class="filter-actions">
          <el-button type="text" @click="toggleAdvancedFilters">
            {{ showAdvancedFilters ? '收起高级筛选' : '展开高级筛选' }}
          </el-button>
        </div>
      </el-card>

      <!-- 资源列表 -->
      <div class="resources-list">
        <!-- 学习资料列表 -->
        <template v-if="activeTab === 'learning'">
          <el-table :data="paginatedResources" style="width: 100%">
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column prop="name" label="资料名称" min-width="200">
              <template #default="scope">
                <div class="resource-name">
                  <el-icon :class="getFileIconClass(scope.row.fileFormat)"></el-icon>
                  <span>{{ scope.row.name }}</span>
                  <el-tag size="small" v-if="scope.row.isNew" type="success">新</el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="courseName" label="所属课程" width="150"></el-table-column>
            <el-table-column prop="type" label="类型" width="100">
              <template #default="scope">
                <el-tag :type="getMaterialTypeTagType(scope.row.type)">
                  {{ getMaterialTypeText(scope.row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="fileFormat" label="格式" width="80"></el-table-column>
            <el-table-column prop="fileSize" label="大小" width="80">
              <template #default="scope">
                {{ formatFileSize(scope.row.fileSize) }}
              </template>
            </el-table-column>
            <el-table-column prop="uploader" label="上传者" width="100"></el-table-column>
            <el-table-column prop="uploadDate" label="上传日期" width="120">
              <template #default="scope">
                {{ formatDate(scope.row.uploadDate) }}
              </template>
            </el-table-column>
            <el-table-column prop="downloadCount" label="下载次数" width="100"></el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="scope">
                <el-button type="primary" size="small" @click="previewResource(scope.row)">
                  <el-icon><View /></el-icon>
                  预览
                </el-button>
                <el-button type="success" size="small" @click="downloadResource(scope.row)">
                  <el-icon><Download /></el-icon>
                  下载
                </el-button>
                <el-button 
                  :icon="scope.row.isFavorite ? 'StarFilled' : 'Star'" 
                  type="text" 
                  size="small" 
                  :class="['favorite-button', { 'favorited': scope.row.isFavorite }]"
                  @click="toggleFavorite(scope.row)"
                ></el-button>
              </template>
            </el-table-column>
          </el-table>
        </template>

        <!-- 常用工具列表 -->
        <template v-else-if="activeTab === 'tools'">
          <div class="tools-grid">
            <div 
              v-for="tool in paginatedResources" 
              :key="tool.id"
              class="tool-card"
            >
              <el-card :body-style="{ padding: '20px' }" shadow="hover">
                <div class="tool-header">
                  <div class="tool-icon">
                    <el-icon :size="40">{{ getToolIcon(tool.type) }}</el-icon>
                  </div>
                  <div class="tool-info">
                    <h4 class="tool-name">{{ tool.name }}</h4>
                    <div class="tool-tags">
                      <el-tag size="small" :type="getToolTypeTagType(tool.type)">
                        {{ getToolTypeText(tool.type) }}
                      </el-tag>
                      <el-tag size="small" :type="tool.isOnline ? 'success' : 'warning'">
                        {{ tool.isOnline ? '在线使用' : '本地安装' }}
                      </el-tag>
                      <el-tag size="small" :type="tool.isFree ? 'info' : 'danger'">
                        {{ tool.isFree ? '免费' : '付费' }}
                      </el-tag>
                    </div>
                  </div>
                </div>
                
                <div class="tool-description">
                  <p>{{ tool.description }}</p>
                </div>
                
                <div class="tool-stats">
                  <div class="stat-item">
                    <el-icon><User /></el-icon>
                    <span>{{ tool.usageCount }}人使用</span>
                  </div>
                  <div class="stat-item">
                    <el-icon><StarFilled /></el-icon>
                    <span>{{ tool.rating }}分</span>
                  </div>
                  <div class="stat-item">
                    <el-icon><Calendar /></el-icon>
                    <span>更新于{{ formatDate(tool.updateDate) }}</span>
                  </div>
                </div>
                
                <div class="tool-footer">
                  <el-button 
                    type="primary" 
                    size="small" 
                    @click="useTool(tool)"
                    :disabled="tool.status !== 'normal'"
                  >
                    {{ tool.isOnline ? '在线使用' : '获取链接' }}
                  </el-button>
                  <el-button 
                    :icon="tool.isFavorite ? 'StarFilled' : 'Star'" 
                    type="text" 
                    size="small" 
                    :class="['favorite-button', { 'favorited': tool.isFavorite }]"
                    @click="toggleFavorite(tool)"
                  ></el-button>
                </div>
              </el-card>
            </div>
          </div>
        </template>

        <!-- 参考书籍列表 -->
        <template v-else-if="activeTab === 'books'">
          <div class="books-grid">
            <div 
              v-for="book in paginatedResources" 
              :key="book.id"
              class="book-card"
            >
              <el-card :body-style="{ padding: '0' }" shadow="hover">
                <div class="book-content">
                  <div class="book-cover">
                    <img :src="book.coverUrl" :alt="book.name" @error="handleImageError($event)" />
                  </div>
                  <div class="book-info">
                    <h4 class="book-name">{{ book.name }}</h4>
                    <div class="book-author">{{ book.author }}</div>
                    <div class="book-publisher">{{ book.publisher }} · {{ book.publishYear }}</div>
                    <div class="book-isbn" v-if="book.isbn">ISBN: {{ book.isbn }}</div>
                    <div class="book-tags">
                      <el-tag size="small" :type="getBookCategoryTagType(book.category)">
                        {{ getBookCategoryText(book.category) }}
                      </el-tag>
                    </div>
                    <div class="book-description">{{ book.description }}</div>
                    <div class="book-actions">
                      <el-button 
                        v-if="book.accessMethods.includes('online')" 
                        type="primary" 
                        size="small" 
                        @click="readBookOnline(book)"
                      >
                        在线阅读
                      </el-button>
                      <el-button 
                        v-if="book.accessMethods.includes('download')" 
                        type="success" 
                        size="small" 
                        @click="downloadBook(book)"
                      >
                        下载
                      </el-button>
                      <el-button 
                        v-if="book.accessMethods.includes('library')" 
                        type="info" 
                        size="small" 
                        @click="checkLibraryAvailability(book)"
                      >
                        图书馆查询
                      </el-button>
                      <el-button 
                        :icon="book.isFavorite ? 'StarFilled' : 'Star'" 
                        type="text" 
                        size="small" 
                        :class="['favorite-button', { 'favorited': book.isFavorite }]"
                        @click="toggleFavorite(book)"
                      ></el-button>
                    </div>
                  </div>
                </div>
              </el-card>
            </div>
          </div>
        </template>

        <!-- 我的收藏列表 -->
        <template v-else-if="activeTab === 'favorites'">
          <el-table :data="paginatedResources" style="width: 100%">
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column prop="name" label="资源名称" min-width="250">
              <template #default="scope">
                <div class="resource-name">
                  <el-icon :class="getResourceIconClass(scope.row)"></el-icon>
                  <span>{{ scope.row.name }}</span>
                  <el-tag size="small" :type="getResourceTypeTagType(scope.row)">
                    {{ getResourceTypeText(scope.row) }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="source" label="来源" width="120"></el-table-column>
            <el-table-column prop="favoriteDate" label="收藏时间" width="150">
              <template #default="scope">
                {{ formatDateTime(scope.row.favoriteDate) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="scope">
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="viewResource(scope.row)"
                  :disabled="!scope.row.canView"
                >
                  查看
                </el-button>
                <el-button 
                  v-if="scope.row.canDownload"
                  type="success" 
                  size="small" 
                  @click="downloadResource(scope.row)"
                >
                  下载
                </el-button>
                <el-button 
                  type="danger" 
                  size="small" 
                  @click="removeFavorite(scope.row)"
                >
                  取消收藏
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </template>

        <!-- 历史记录列表 -->
        <template v-else-if="activeTab === 'history'">
          <el-table :data="paginatedResources" style="width: 100%">
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column prop="name" label="资源名称" min-width="250">
              <template #default="scope">
                <div class="resource-name">
                  <el-icon :class="getResourceIconClass(scope.row)"></el-icon>
                  <span>{{ scope.row.name }}</span>
                  <el-tag size="small" :type="getResourceTypeTagType(scope.row)">
                    {{ getResourceTypeText(scope.row) }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="action" label="操作类型" width="100">
              <template #default="scope">
                <el-tag :type="getActionTagType(scope.row.action)">
                  {{ getActionText(scope.row.action) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="source" label="来源" width="120"></el-table-column>
            <el-table-column prop="accessTime" label="访问时间" width="150">
              <template #default="scope">
                {{ formatDateTime(scope.row.accessTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="scope">
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="viewResource(scope.row)"
                  :disabled="!scope.row.canView"
                >
                  查看
                </el-button>
                <el-button 
                  v-if="scope.row.canDownload"
                  type="success" 
                  size="small" 
                  @click="downloadResource(scope.row)"
                >
                  下载
                </el-button>
                <el-button 
                  type="danger" 
                  size="small" 
                  @click="removeHistory(scope.row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </template>

        <!-- 空状态 -->
        <div v-if="paginatedResources.length === 0" class="empty-state">
          <el-empty description="暂无资源"></el-empty>
        </div>
      </div>

      <!-- 批量操作区域 -->
      <div class="batch-actions" v-if="(activeTab === 'learning' || activeTab === 'favorites' || activeTab === 'history') && selectedResources.length > 0">
        <el-button type="danger" @click="batchDelete">批量删除</el-button>
        <el-button 
          v-if="activeTab === 'learning' && selectedResources.length > 0" 
          type="success" 
          @click="batchDownload"
        >
          批量下载
        </el-button>
        <el-button 
          v-if="activeTab !== 'favorites' && selectedResources.length > 0" 
          type="primary" 
          @click="batchAddToFavorites"
        >
          批量收藏
        </el-button>
      </div>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredResources.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </el-card>

    <!-- 资源预览对话框 -->
    <el-dialog
      v-model="showPreviewDialog"
      :title="previewResourceData?.name"
      width="90%"
      height="90vh"
      :before-close="handleClosePreviewDialog"
    >
      <div class="preview-container">
        <div v-if="previewResourceData" class="preview-content">
          <!-- 根据文件格式显示不同的预览方式 -->
          <div v-if="previewResourceData.fileFormat === 'pdf'" class="pdf-preview">
            <div class="preview-placeholder">
              <el-icon><Document /></el-icon>
              <p>PDF 预览功能</p>
              <p>这里将显示PDF文档内容</p>
            </div>
          </div>
          
          <div v-else-if="['doc', 'docx'].includes(previewResourceData.fileFormat)" class="word-preview">
            <div class="preview-placeholder">
              <el-icon><Document /></el-icon>
              <p>Word 预览功能</p>
              <p>这里将显示Word文档内容</p>
            </div>
          </div>
          
          <div v-else-if="['xls', 'xlsx'].includes(previewResourceData.fileFormat)" class="excel-preview">
            <div class="preview-placeholder">
              <el-icon><Document /></el-icon>
              <p>Excel 预览功能</p>
              <p>这里将显示Excel文档内容</p>
            </div>
          </div>
          
          <div v-else-if="['ppt', 'pptx'].includes(previewResourceData.fileFormat)" class="ppt-preview">
            <div class="preview-placeholder">
              <el-icon><Document /></el-icon>
              <p>PPT 预览功能</p>
              <p>这里将显示PPT文档内容</p>
            </div>
          </div>
          
          <div v-else-if="['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(previewResourceData.fileFormat)" class="image-preview">
            <img :src="previewResourceData.fileUrl" :alt="previewResourceData.name" />
          </div>
          
          <div v-else-if="['mp4', 'avi', 'mov', 'wmv'].includes(previewResourceData.fileFormat)" class="video-preview">
            <video :src="previewResourceData.fileUrl" controls width="100%" height="auto"></video>
          </div>
          
          <div v-else-if="['mp3', 'wav', 'ogg', 'flac'].includes(previewResourceData.fileFormat)" class="audio-preview">
            <audio :src="previewResourceData.fileUrl" controls></audio>
          </div>
          
          <div v-else-if="['txt', 'md', 'html', 'css', 'js', 'json', 'xml', 'php', 'java', 'py', 'cpp', 'c'].includes(previewResourceData.fileFormat)" class="text-preview">
            <pre><code>{{ previewResourceData.content }}</code></pre>
          </div>
          
          <div v-else class="unknown-preview">
            <div class="preview-placeholder">
              <el-icon><Document /></el-icon>
              <p>不支持预览此文件格式</p>
              <el-button type="primary" @click="downloadResource(previewResourceData)">下载文件</el-button>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClosePreviewDialog">关闭</el-button>
          <el-button type="success" @click="downloadResource(previewResourceData)">
            <el-icon><Download /></el-icon>
            下载
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 工具使用对话框 -->
    <el-dialog
      v-model="showToolDialog"
      :title="currentTool?.name"
      width="70%"
      :before-close="handleCloseToolDialog"
    >
      <div class="tool-dialog-content" v-if="currentTool">
        <div class="tool-dialog-header">
          <div class="tool-dialog-icon">
            <el-icon :size="60">{{ getToolIcon(currentTool.type) }}</el-icon>
          </div>
          <div class="tool-dialog-info">
            <h3>{{ currentTool.name }}</h3>
            <div class="tool-dialog-tags">
              <el-tag size="small" :type="getToolTypeTagType(currentTool.type)">
                {{ getToolTypeText(currentTool.type) }}
              </el-tag>
              <el-tag size="small" :type="currentTool.isOnline ? 'success' : 'warning'">
                {{ currentTool.isOnline ? '在线使用' : '本地安装' }}
              </el-tag>
              <el-tag size="small" :type="currentTool.isFree ? 'info' : 'danger'">
                {{ currentTool.isFree ? '免费' : '付费' }}
              </el-tag>
            </div>
            <div class="tool-dialog-stats">
              <span class="stat-item">
                <el-icon><User /></el-icon>
                {{ currentTool.usageCount }}人使用
              </span>
              <span class="stat-item">
                <el-icon><StarFilled /></el-icon>
                {{ currentTool.rating }}分
              </span>
              <span class="stat-item">
                <el-icon><Calendar /></el-icon>
                更新于{{ formatDate(currentTool.updateDate) }}
              </span>
            </div>
          </div>
        </div>
        
        <div class="tool-dialog-description">
          <h4>工具介绍</h4>
          <p>{{ currentTool.description }}</p>
        </div>
        
        <div class="tool-dialog-features" v-if="currentTool.features && currentTool.features.length > 0">
          <h4>主要功能</h4>
          <ul>
            <li v-for="(feature, index) in currentTool.features" :key="index">{{ feature }}</li>
          </ul>
        </div>
        
        <div class="tool-dialog-usage" v-if="currentTool.usageGuide">
          <h4>使用说明</h4>
          <p>{{ currentTool.usageGuide }}</p>
        </div>
        
        <div class="tool-dialog-access" v-if="currentTool.accessInfo">
          <h4>访问信息</h4>
          <p>{{ currentTool.accessInfo }}</p>
        </div>
        
        <div class="tool-dialog-links" v-if="currentTool.links && currentTool.links.length > 0">
          <h4>相关链接</h4>
          <div class="links-list">
            <a 
              v-for="(link, index) in currentTool.links" 
              :key="index"
              :href="link.url"
              target="_blank"
              class="link-item"
            >
              <el-icon><Link /></el-icon>
              {{ link.name }}
            </a>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseToolDialog">关闭</el-button>
          <el-button 
            type="primary" 
            @click="openTool(currentTool)"
            :disabled="currentTool.status !== 'normal'"
          >
            {{ currentTool.isOnline ? '立即使用' : '获取安装包' }}
          </el-button>
          <el-button 
            :icon="currentTool.isFavorite ? 'StarFilled' : 'Star'" 
            type="warning" 
            @click="toggleFavorite(currentTool)"
          >
            {{ currentTool.isFavorite ? '取消收藏' : '收藏工具' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 书籍在线阅读对话框 -->
    <el-dialog
      v-model="showBookReadDialog"
      :title="currentBook?.name + ' - 在线阅读'"
      width="90%"
      height="90vh"
      :before-close="handleCloseBookReadDialog"
    >
      <div class="book-reader-container">
        <div class="book-reader-sidebar">
          <div class="book-reader-info">
            <h4>{{ currentBook?.name }}</h4>
            <div class="book-reader-author">{{ currentBook?.author }}</div>
            <div class="book-reader-progress">
              <el-progress 
                :percentage="bookProgress" 
                :format="formatBookProgress"
                :status="bookProgress === 100 ? 'success' : 'primary'"
              ></el-progress>
              <div class="progress-text">已读 {{ Math.round(bookProgress) }}%</div>
            </div>
            <div class="book-reader-toc">
              <h5>目录</h5>
              <div class="toc-list">
                <div 
                  v-for="(chapter, index) in bookChapters" 
                  :key="index"
                  :class="['toc-item', { 'active': currentChapterIndex === index }]"
                  @click="goToChapter(index)"
                >
                  {{ chapter.title }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="book-reader-content">
          <div class="reader-navigation">
            <el-button type="text" @click="previousChapter" :disabled="currentChapterIndex === 0">
              <el-icon><ArrowLeft /></el-icon> 上一章
            </el-button>
            <div class="reader-progress-indicator">
              {{ currentChapterIndex + 1 }} / {{ bookChapters.length }}
            </div>
            <el-button type="text" @click="nextChapter" :disabled="currentChapterIndex === bookChapters.length - 1">
              下一章 <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
          
          <div class="reader-chapter-title">
            {{ bookChapters[currentChapterIndex]?.title }}
          </div>
          
          <div class="reader-chapter-content">
            <p v-for="(paragraph, index) in currentChapterContent" :key="index">
              {{ paragraph }}
            </p>
          </div>
          
          <div class="reader-footer">
            <el-button type="text" @click="toggleReaderSettings">
              <el-icon><Setting /></el-icon> 设置
            </el-button>
            <el-button type="text" @click="addBookmark">
              <el-icon><Collection /></el-icon> 添加书签
            </el-button>
            <el-button type="text" @click="showBookmarks">
              <el-icon><StarFilled /></el-icon> 书签
            </el-button>
          </div>
        </div>
        
        <!-- 阅读器设置面板 -->
        <div class="reader-settings-panel" v-if="showReaderSettings">
          <h4>阅读器设置</h4>
          <div class="setting-item">
            <label>字体大小</label>
            <el-slider v-model="fontSize" :min="12" :max="24" :step="1" show-stops></el-slider>
          </div>
          <div class="setting-item">
            <label>行间距</label>
            <el-slider v-model="lineHeight" :min="1" :max="3" :step="0.1" show-stops></el-slider>
          </div>
          <div class="setting-item">
            <label>背景主题</label>
            <el-radio-group v-model="theme">
              <el-radio :label="'light'">浅色</el-radio>
              <el-radio :label="'sepia'">护眼</el-radio>
              <el-radio :label="'dark'">夜间</el-radio>
            </el-radio-group>
          </div>
          <div class="setting-item">
            <label>字体</label>
            <el-select v-model="fontFamily">
              <el-option label="默认" value="default"></el-option>
              <el-option label="宋体" value="song"></el-option>
              <el-option label="黑体" value="hei"></el-option>
              <el-option label="楷体" value="kai"></el-option>
              <el-option label="微软雅黑" value="yahei"></el-option>
            </el-select>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseBookReadDialog">关闭</el-button>
          <el-button type="success" @click="downloadBook(currentBook)">
            <el-icon><Download /></el-icon>
            下载
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { 
  Refresh, View, Download, Star, StarFilled, Document, User, Calendar, 
  Link, ArrowLeft, ArrowRight, Setting, Collection
} from '@element-plus/icons-vue'
import api from '../../services/axios'

export default {
  name: 'StudentResources',
  components: {
    Refresh,
    View,
    Download,
    Star,
    StarFilled,
    Document,
    User,
    Calendar,
    Link,
    ArrowLeft,
    ArrowRight,
    Setting,
    Collection
  },
  data() {
    return {
      activeTab: 'learning',
      currentPage: 1,
      pageSize: 10,
      showAdvancedFilters: false,
      showPreviewDialog: false,
      showToolDialog: false,
      showBookReadDialog: false,
      selectedResources: [],
      previewResourceData: null,
      currentTool: null,
      currentBook: null,
      // 搜索表单
      searchForm: {
        name: '',
        course: 'all',
        materialType: 'all',
        toolType: 'all',
        bookCategory: 'all',
        authorOrPublisher: ''
      },
      // 高级筛选表单
      advancedForm: {
        dateRange: null,
        fileFormat: [],
        uploader: '',
        onlineStatus: 'all',
        freeStatus: 'all',
        accessMethod: [],
        isbn: ''
      },
      // 阅读器设置
      showReaderSettings: false,
      fontSize: 16,
      lineHeight: 1.5,
      theme: 'light',
      fontFamily: 'default',
      currentChapterIndex: 0,
      bookProgress: 0,
      bookChapters: [],
      currentChapterContent: [],
      // 从后端获取的数据
      courses: [],
      learningMaterials: [],
      tools: [],
      books: [],
      favorites: [],
      history: []
        },
        {
          id: 2,
          name: '流程图绘制工具',
          type: 'design',
          description: '在线绘制流程图、思维导图等图表工具，简单易用。',
          features: ['多种图表类型', '拖拽式操作', '模板库', '导出多种格式', '协作编辑'],
          usageGuide: '选择图表类型，拖拽元素到画布中进行绘制。',
          isOnline: true,
          isFree: false,
          usageCount: 2154,
          rating: 4.6,
          updateDate: '2025-10-15T00:00:00',
          status: 'normal',
          isFavorite: false,
          links: [
            { name: '官方网站', url: '#' },
            { name: '功能介绍', url: '#' }
          ]
        },
        {
          id: 3,
          name: '文献管理工具',
          type: 'document',
          description: '管理学术文献，支持导入、分类、引用等功能。',
          features: ['文献导入', '自动分类', '引用生成', '全文检索', '参考文献管理'],
          usageGuide: '导入文献文件，系统自动提取元数据并进行分类管理。',
          isOnline: false,
          isFree: true,
          usageCount: 1892,
          rating: 4.5,
          updateDate: '2025-10-10T00:00:00',
          status: 'normal',
          isFavorite: false,
          accessInfo: '下载后安装即可使用',
          links: [
            { name: '下载链接', url: '#' },
            { name: '使用手册', url: '#' }
          ]
        },
        {
          id: 4,
          name: '在线翻译工具',
          type: 'learning',
          description: '多语言在线翻译工具，支持文本、文档、图片翻译。',
          features: ['多语言支持', '文档翻译', '图片翻译', '离线翻译', '发音功能'],
          usageGuide: '输入或上传需要翻译的内容，选择源语言和目标语言。',
          isOnline: true,
          isFree: true,
          usageCount: 5432,
          rating: 4.7,
          updateDate: '2025-10-20T00:00:00',
          status: 'normal',
          isFavorite: false,
          links: [
            { name: '在线使用', url: '#' },
            { name: '移动应用', url: '#' }
          ]
        },
        {
          id: 5,
          name: '数据分析工具',
          type: 'programming',
          description: '数据可视化和分析工具，支持多种数据源和图表类型。',
          features: ['数据导入', '可视化图表', '统计分析', '数据导出', '实时更新'],
          usageGuide: '导入数据文件，选择合适的图表类型进行可视化分析。',
          isOnline: true,
          isFree: false,
          usageCount: 987,
          rating: 4.4,
          updateDate: '2025-10-12T00:00:00',
          status: 'normal',
          isFavorite: true,
          links: [
            { name: '官方网站', url: '#' },
            { name: '价格方案', url: '#' }
          ]
        }
      ],
      // 参考书籍数据
      books: [
        {
          id: 1,
          name: '计算机科学导论',
          author: '张三',
          publisher: '高等教育出版社',
          publishYear: '2024',
          isbn: '978-7-04-000001-1',
          category: 'textbook',
          description: '本书系统介绍计算机科学的基本概念、原理和技术，适合计算机相关专业入门学习。',
          coverUrl: 'https://via.placeholder.com/120x180?text=Computer+Science',
          accessMethods: ['online', 'download', 'library'],
          isFavorite: true
        },
        {
          id: 2,
          name: 'Python编程从入门到实践',
          author: '李四',
          publisher: '电子工业出版社',
          publishYear: '2023',
          isbn: '978-7-121-000002-2',
          category: 'reference',
          description: 'Python入门经典书籍，适合零基础学习者，包含基础语法和实战项目。',
          coverUrl: 'https://via.placeholder.com/120x180?text=Python',
          accessMethods: ['online', 'download'],
          isFavorite: false
        },
        {
          id: 3,
          name: '数据结构与算法分析',
          author: '王五',
          publisher: '机械工业出版社',
          publishYear: '2024',
          isbn: '978-7-111-000003-3',
          category: 'textbook',
          description: '深入讲解数据结构与算法的设计与分析方法，是计算机专业核心课程教材。',
          coverUrl: 'https://via.placeholder.com/120x180?text=Data+Structures',
          accessMethods: ['online', 'library'],
          isFavorite: true
        },
        {
          id: 4,
          name: '人工智能：现代方法',
          author: '赵六',
          publisher: '清华大学出版社',
          publishYear: '2023',
          isbn: '978-7-302-000004-4',
          category: 'monograph',
          description: '全面介绍人工智能的理论和实践，是AI领域的经典著作。',
          coverUrl: 'https://via.placeholder.com/120x180?text=AI',
          accessMethods: ['online', 'download', 'library'],
          isFavorite: false
        },
        {
          id: 5,
          name: '计算机网络：自顶向下方法',
          author: '钱七',
          publisher: '人民邮电出版社',
          publishYear: '2024',
          isbn: '978-7-115-000005-5',
          category: 'textbook',
          description: '采用自顶向下方法讲解计算机网络的基本原理和技术，内容深入浅出。',
          coverUrl: 'https://via.placeholder.com/120x180?text=Networks',
          accessMethods: ['online', 'download'],
          isFavorite: false
        }
      ],
      // 收藏数据
      favorites: [
        {
          id: 1,
          name: '程序设计基础实验指导书',
          type: 'learning_material',
          source: '高等数学',
          favoriteDate: '2025-10-18T14:30:00',
          canView: true,
          canDownload: true
        },
        {
          id: 2,
          name: '代码编辑器',
          type: 'tool',
          source: '常用工具',
          favoriteDate: '2025-10-15T09:15:00',
          canView: true,
          canDownload: false
        },
        {
          id: 3,
          name: '计算机科学导论',
          type: 'book',
          source: '参考书籍',
          favoriteDate: '2025-10-12T16:45:00',
          canView: true,
          canDownload: true
        },
        {
          id: 4,
          name: '数据分析工具',
          type: 'tool',
          source: '常用工具',
          favoriteDate: '2025-10-10T11:20:00',
          canView: true,
          canDownload: false
        },
        {
          id: 5,
          name: '数据结构与算法分析',
          type: 'book',
          source: '参考书籍',
          favoriteDate: '2025-10-08T10:00:00',
          canView: true,
          canDownload: false
        }
      ],
      // 历史记录数据
      history: [
        {
          id: 1,
          name: '高等数学第一章课件',
          type: 'learning_material',
          action: 'view',
          source: '高等数学',
          accessTime: '2025-10-20T14:30:00',
          canView: true,
          canDownload: true
        },
        {
          id: 2,
          name: '代码编辑器',
          type: 'tool',
          action: 'use',
          source: '常用工具',
          accessTime: '2025-10-20T10:15:00',
          canView: true,
          canDownload: false
        },
        {
          id: 3,
          name: 'Python编程从入门到实践',
          type: 'book',
          action: 'download',
          source: '参考书籍',
          accessTime: '2025-10-19T16:45:00',
          canView: true,
          canDownload: true
        },
        {
          id: 4,
          name: '大学物理习题集',
          type: 'learning_material',
          action: 'download',
          source: '大学物理',
          accessTime: '2025-10-19T09:20:00',
          canView: true,
          canDownload: true
        },
        {
          id: 5,
          name: '在线翻译工具',
          type: 'tool',
          action: 'use',
          source: '常用工具',
          accessTime: '2025-10-18T11:00:00',
          canView: true,
          canDownload: false
        },
        {
          id: 6,
          name: '计算机网络基础讲义',
          type: 'learning_material',
          action: 'view',
          source: '计算机基础',
          accessTime: '2025-10-18T10:30:00',
          canView: true,
          canDownload: true
        }
      ]
    }
  },
  
  // 页面加载时获取数据
  async mounted() {
    await this.refreshResources()
  },
  
  computed: {
    // 根据当前标签页获取资源数据
    currentResources() {
      switch (this.activeTab) {
        case 'learning':
          return this.learningMaterials
        case 'tools':
          return this.tools
        case 'books':
          return this.books
        case 'favorites':
          return this.favorites
        case 'history':
          return this.history
        default:
          return []
      }
    },
    // 过滤后的资源
    filteredResources() {
      let filtered = [...this.currentResources]
      
      // 基本搜索过滤
      if (this.searchForm.name) {
        filtered = filtered.filter(item => 
          item.name.toLowerCase().includes(this.searchForm.name.toLowerCase())
        )
      }
      
      // 根据标签页类型进行特定过滤
      if (this.activeTab === 'learning') {
        // 课程过滤
        if (this.searchForm.course !== 'all') {
          filtered = filtered.filter(item => item.courseId === parseInt(this.searchForm.course))
        }
        // 资料类型过滤
        if (this.searchForm.materialType !== 'all') {
          filtered = filtered.filter(item => item.type === this.searchForm.materialType)
        }
        // 高级筛选
        if (this.advancedForm.dateRange && this.advancedForm.dateRange.length === 2) {
          const startDate = new Date(this.advancedForm.dateRange[0])
          const endDate = new Date(this.advancedForm.dateRange[1])
          filtered = filtered.filter(item => {
            const itemDate = new Date(item.uploadDate)
            return itemDate >= startDate && itemDate <= endDate
          })
        }
        if (this.advancedForm.fileFormat.length > 0) {
          filtered = filtered.filter(item => this.advancedForm.fileFormat.includes(item.fileFormat))
        }
        if (this.advancedForm.uploader) {
          filtered = filtered.filter(item => 
            item.uploader.toLowerCase().includes(this.advancedForm.uploader.toLowerCase())
          )
        }
      } else if (this.activeTab === 'tools') {
        // 工具类型过滤
        if (this.searchForm.toolType !== 'all') {
          filtered = filtered.filter(item => item.type === this.searchForm.toolType)
        }
        // 高级筛选
        if (this.advancedForm.onlineStatus !== 'all') {
          filtered = filtered.filter(item => item.isOnline === (this.advancedForm.onlineStatus === 'online'))
        }
        if (this.advancedForm.freeStatus !== 'all') {
          filtered = filtered.filter(item => item.isFree === (this.advancedForm.freeStatus === 'free'))
        }
      } else if (this.activeTab === 'books') {
        // 书籍分类过滤
        if (this.searchForm.bookCategory !== 'all') {
          filtered = filtered.filter(item => item.category === this.searchForm.bookCategory)
        }
        // 作者/出版社过滤
        if (this.searchForm.authorOrPublisher) {
          filtered = filtered.filter(item => 
            item.author.toLowerCase().includes(this.searchForm.authorOrPublisher.toLowerCase()) ||
            item.publisher.toLowerCase().includes(this.searchForm.authorOrPublisher.toLowerCase())
          )
        }
        // 高级筛选
        if (this.advancedForm.dateRange && this.advancedForm.dateRange.length === 2) {
          const startYear = this.advancedForm.dateRange[0].split('-')[0]
          const endYear = this.advancedForm.dateRange[1].split('-')[0]
          filtered = filtered.filter(item => {
            const publishYear = item.publishYear
            return publishYear >= startYear && publishYear <= endYear
          })
        }
        if (this.advancedForm.accessMethod.length > 0) {
          filtered = filtered.filter(item => 
            item.accessMethods.some(method => this.advancedForm.accessMethod.includes(method))
          )
        }
        if (this.advancedForm.isbn) {
          filtered = filtered.filter(item => 
            item.isbn && item.isbn.includes(this.advancedForm.isbn)
          )
        }
      }
      
      return filtered
    },
    // 分页后的资源
    paginatedResources() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredResources.slice(start, end)
    },
    // 未读学习资料数量
    newLearningMaterials() {
      return this.learningMaterials.filter(item => item.isNew).length
    },
    // 收藏数量
    favoriteCount() {
      return this.favorites.length
    }
  },
  methods: {
    // 获取课程列表
    async fetchCourses() {
      try {
        const response = await api.get('/courses')
        this.courses = response.data
      } catch (error) {
        console.error('获取课程列表失败:', error)
        this.$message.error('获取课程列表失败')
        // 失败时使用空数组
        this.courses = []
      }
    },
    
    // 获取学习资料
    async fetchLearningMaterials() {
      try {
        const response = await api.get('/resources/learning-materials')
        this.learningMaterials = response.data
      } catch (error) {
        console.error('获取学习资料失败:', error)
        this.$message.error('获取学习资料失败')
        this.learningMaterials = []
      }
    },
    
    // 获取工具列表
    async fetchTools() {
      try {
        const response = await api.get('/resources/tools')
        this.tools = response.data
      } catch (error) {
        console.error('获取工具列表失败:', error)
        this.$message.error('获取工具列表失败')
        this.tools = []
      }
    },
    
    // 获取参考书籍
    async fetchBooks() {
      try {
        const response = await api.get('/resources/books')
        this.books = response.data
      } catch (error) {
        console.error('获取参考书籍失败:', error)
        this.$message.error('获取参考书籍失败')
        this.books = []
      }
    },
    
    // 获取收藏列表
    async fetchFavorites() {
      try {
        const response = await api.get('/resources/favorites')
        this.favorites = response.data
      } catch (error) {
        console.error('获取收藏列表失败:', error)
        this.$message.error('获取收藏列表失败')
        this.favorites = []
      }
    },
    
    // 获取历史记录
    async fetchHistory() {
      try {
        const response = await api.get('/resources/history')
        this.history = response.data
      } catch (error) {
        console.error('获取历史记录失败:', error)
        this.$message.error('获取历史记录失败')
        this.history = []
      }
    },
    
    // 刷新所有资源
    async refreshResources() {
      this.$message.loading('正在刷新资源...', 0)
      try {
        await Promise.all([
          this.fetchCourses(),
          this.fetchLearningMaterials(),
          this.fetchTools(),
          this.fetchBooks(),
          this.fetchFavorites(),
          this.fetchHistory()
        ])
        this.$message.success('资源列表已刷新')
      } catch (error) {
        console.error('刷新资源失败:', error)
        this.$message.error('刷新资源失败')
      }
    },
    
    handleTabClick() {
      // 切换标签页时重置分页和筛选
      this.currentPage = 1
      this.resetSearch()
      this.showAdvancedFilters = false
      this.resetAdvancedFilters()
    },
    handleSearch() {
      // 搜索时重置分页
      this.currentPage = 1
    },
    resetSearch() {
      // 重置搜索表单
      this.searchForm = {
        name: '',
        course: 'all',
        materialType: 'all',
        toolType: 'all',
        bookCategory: 'all',
        authorOrPublisher: ''
      }
    },
    toggleAdvancedFilters() {
      this.showAdvancedFilters = !this.showAdvancedFilters
    },
    applyAdvancedFilters() {
      // 应用高级筛选
      this.currentPage = 1
    },
    resetAdvancedFilters() {
      // 重置高级筛选表单
      this.advancedForm = {
        dateRange: null,
        fileFormat: [],
        uploader: '',
        onlineStatus: 'all',
        freeStatus: 'all',
        accessMethod: [],
        isbn: ''
      }
    },
    handleSizeChange(size) {
      this.pageSize = size
    },
    handleCurrentChange(current) {
      this.currentPage = current
    },
    // 原有方法已被新的刷新方法替代
    // 文件图标类
    getFileIconClass(format) {
      const iconMap = {
        pdf: 'el-icon-document',
        doc: 'el-icon-document',
        docx: 'el-icon-document',
        xls: 'el-icon-document',
        xlsx: 'el-icon-document',
        ppt: 'el-icon-document',
        pptx: 'el-icon-document',
        txt: 'el-icon-document',
        md: 'el-icon-document',
        html: 'el-icon-document',
        css: 'el-icon-document',
        js: 'el-icon-document',
        json: 'el-icon-document',
        xml: 'el-icon-document',
        php: 'el-icon-document',
        java: 'el-icon-document',
        py: 'el-icon-document',
        cpp: 'el-icon-document',
        c: 'el-icon-document',
        jpg: 'el-icon-picture',
        jpeg: 'el-icon-picture',
        png: 'el-icon-picture',
        gif: 'el-icon-picture',
        bmp: 'el-icon-picture',
        mp4: 'el-icon-video-camera',
        avi: 'el-icon-video-camera',
        mov: 'el-icon-video-camera',
        wmv: 'el-icon-video-camera',
        mp3: 'el-icon-microphone',
        wav: 'el-icon-microphone',
        ogg: 'el-icon-microphone',
        flac: 'el-icon-microphone'
      }
      return iconMap[format] || 'el-icon-document'
    },
    // 资料类型标签类型
    getMaterialTypeTagType(type) {
      const typeMap = {
        lecture: 'primary',
        slides: 'success',
        exercises: 'warning',
        experiment: 'danger',
        other: 'info'
      }
      return typeMap[type] || 'default'
    },
    // 资料类型文本
    getMaterialTypeText(type) {
      const typeMap = {
        lecture: '讲义',
        slides: '课件',
        exercises: '习题集',
        experiment: '实验指导',
        other: '其他'
      }
      return typeMap[type] || type
    },
    // 工具图标
    getToolIcon(type) {
      const iconMap = {
        programming: 'Code',
        design: 'Edit',
        document: 'Document',
        learning: 'Reading',
        other: 'Tools'
      }
      return iconMap[type] || 'Tools'
    },
    // 工具类型标签类型
    getToolTypeTagType(type) {
      const typeMap = {
        programming: 'primary',
        design: 'success',
        document: 'info',
        learning: 'warning',
        other: 'default'
      }
      return typeMap[type] || 'default'
    },
    // 工具类型文本
    getToolTypeText(type) {
      const typeMap = {
        programming: '编程工具',
        design: '设计工具',
        document: '文档工具',
        learning: '学习工具',
        other: '其他'
      }
      return typeMap[type] || type
    },
    // 书籍分类标签类型
    getBookCategoryTagType(category) {
      const typeMap = {
        textbook: 'primary',
        reference: 'success',
        monograph: 'warning',
        journal: 'danger',
        other: 'info'
      }
      return typeMap[category] || 'default'
    },
    // 书籍分类文本
    getBookCategoryText(category) {
      const typeMap = {
        textbook: '教材',
        reference: '教辅',
        monograph: '专著',
        journal: '期刊',
        other: '其他'
      }
      return typeMap[category] || category
    },
    // 资源图标类
    getResourceIconClass(resource) {
      if (resource.type === 'learning_material') {
        return 'el-icon-document'
      } else if (resource.type === 'tool') {
        return 'el-icon-tools'
      } else if (resource.type === 'book') {
        return 'el-icon-reading'
      }
      return 'el-icon-document'
    },
    // 资源类型标签类型
    getResourceTypeTagType(resource) {
      if (resource.type === 'learning_material') {
        return 'primary'
      } else if (resource.type === 'tool') {
        return 'success'
      } else if (resource.type === 'book') {
        return 'info'
      }
      return 'default'
    },
    // 资源类型文本
    getResourceTypeText(resource) {
      const typeMap = {
        learning_material: '学习资料',
        tool: '工具',
        book: '书籍'
      }
      return typeMap[resource.type] || resource.type
    },
    // 操作标签类型
    getActionTagType(action) {
      const typeMap = {
        view: 'primary',
        download: 'success',
        use: 'info'
      }
      return typeMap[action] || 'default'
    },
    // 操作文本
    getActionText(action) {
      const actionMap = {
        view: '查看',
        download: '下载',
        use: '使用'
      }
      return actionMap[action] || action
    },
    // 格式化文件大小
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },
    // 格式化日期
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    },
    // 格式化日期时间
    formatDateTime(dateString) {
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    },
    // 处理图片错误
    handleImageError(event) {
      event.target.src = 'https://via.placeholder.com/120x180?text=No+Cover'
    },
    // 预览资源
    previewResource(resource) {
      this.previewResourceData = resource
      this.showPreviewDialog = true
      this.addToHistory(resource, 'view')
    },
    // 处理关闭预览对话框
    handleClosePreviewDialog() {
      this.showPreviewDialog = false
      this.previewResourceData = null
    },
    // 下载资源
    downloadResource(resource) {
      // 模拟下载
      this.$message.success(`正在下载: ${resource.name}`)
      this.addToHistory(resource, 'download')
      
      // 更新下载次数
      if (this.activeTab === 'learning') {
        const index = this.learningMaterials.findIndex(item => item.id === resource.id)
        if (index !== -1) {
          this.learningMaterials[index].downloadCount++
        }
      }
    },
    // 切换收藏状态
    toggleFavorite(resource) {
      resource.isFavorite = !resource.isFavorite
      const message = resource.isFavorite ? '已添加到收藏' : '已取消收藏'
      this.$message.success(message)
      
      if (resource.isFavorite) {
        this.addToFavorites(resource)
      } else {
        this.removeFromFavorites(resource)
      }
    },
    // 添加到收藏
    addToFavorites(resource) {
      // 检查是否已经在收藏列表中
      const exists = this.favorites.some(item => item.name === resource.name)
      if (!exists) {
        let type, source
        if (this.activeTab === 'learning') {
          type = 'learning_material'
          source = resource.courseName
        } else if (this.activeTab === 'tools') {
          type = 'tool'
          source = '常用工具'
        } else if (this.activeTab === 'books') {
          type = 'book'
          source = '参考书籍'
        }
        
        this.favorites.push({
          id: Date.now(),
          name: resource.name,
          type,
          source,
          favoriteDate: new Date().toISOString(),
          canView: true,
          canDownload: this.activeTab !== 'tools'
        })
      }
    },
    // 从收藏中移除
    removeFromFavorites(resource) {
      // 从收藏列表中移除
      const index = this.favorites.findIndex(item => item.name === resource.name)
      if (index !== -1) {
        this.favorites.splice(index, 1)
      }
    },
    // 添加到历史记录
    addToHistory(resource, action) {
      let type, source
      if (this.activeTab === 'learning') {
        type = 'learning_material'
        source = resource.courseName
      } else if (this.activeTab === 'tools') {
        type = 'tool'
        source = '常用工具'
      } else if (this.activeTab === 'books') {
        type = 'book'
        source = '参考书籍'
      }
      
      // 添加到历史记录开头
      this.history.unshift({
        id: Date.now(),
        name: resource.name,
        type,
        action,
        source,
        accessTime: new Date().toISOString(),
        canView: true,
        canDownload: this.activeTab !== 'tools'
      })
      
      // 限制历史记录数量
      if (this.history.length > 100) {
        this.history.pop()
      }
    },
    // 使用工具
    useTool(tool) {
      this.currentTool = tool
      this.showToolDialog = true
      this.addToHistory(tool, 'use')
    },
    // 处理关闭工具对话框
    handleCloseToolDialog() {
      this.showToolDialog = false
      this.currentTool = null
    },
    // 打开工具
    openTool(tool) {
      // 模拟打开工具
      if (tool.isOnline) {
        window.open(tool.links[0].url, '_blank')
        this.$message.success('工具已打开')
      } else {
        // 模拟下载
        this.$message.success(`正在下载: ${tool.name} 安装包`)
      }
    },
    // 在线阅读书籍
    readBookOnline(book) {
      this.currentBook = book
      this.showBookReadDialog = true
      this.addToHistory(book, 'view')
      
      // 模拟章节数据
      this.bookChapters = [
        { title: '前言' },
        { title: '第一章 计算机基础知识' },
        { title: '第二章 数据表示与存储' },
        { title: '第三章 计算机系统' },
        { title: '第四章 程序设计基础' },
        { title: '第五章 计算机网络基础' },
        { title: '第六章 多媒体技术' },
        { title: '第七章 数据库基础' },
        { title: '第八章 软件工程' },
        { title: '后记' }
      ]
      
      // 模拟章节内容
      this.loadChapterContent(0)
      
      // 模拟阅读进度
      this.bookProgress = Math.random() * 80
    },
    // 下载书籍
    downloadBook(book) {
      // 模拟下载
      this.$message.success(`正在下载: ${book.name}`)
      this.addToHistory(book, 'download')
    },
    // 检查图书馆可用性
    checkLibraryAvailability(book) {
      this.$message.info(`正在查询《${book.name}》在图书馆的可用性`)
      // 模拟查询结果
      setTimeout(() => {
        this.$message.success(`《${book.name}》在图书馆有2本可借`)
      }, 1000)
    },
    // 处理关闭书籍阅读对话框
    handleCloseBookReadDialog() {
      this.showBookReadDialog = false
      this.currentBook = null
      this.currentChapterIndex = 0
      this.bookChapters = []
      this.currentChapterContent = []
      this.showReaderSettings = false
    },
    // 加载章节内容
    loadChapterContent(chapterIndex) {
      // 模拟章节内容
      this.currentChapterContent = [
        `这是${this.bookChapters[chapterIndex]?.title}的内容。`,
        '计算机科学是研究计算机系统和计算理论的学科，涵盖了硬件、软件、算法和数据结构等多个方面。',
        '在现代社会中，计算机技术已经渗透到各行各业，成为推动社会发展的重要力量。',
        '学习计算机科学不仅能够掌握实用的技能，还能够培养逻辑思维和解决问题的能力。',
        '本章节将介绍计算机的基本概念、发展历史以及计算机科学的主要研究方向。',
        '通过本章的学习，读者将对计算机科学有一个全面的认识，为后续的学习打下基础。',
        '计算机是一种能够按照程序指令自动进行数据处理的电子设备，它由硬件和软件两部分组成。',
        '硬件是计算机的物理部分，包括中央处理器、内存、硬盘、输入输出设备等。',
        '软件是计算机的逻辑部分，包括操作系统、应用程序和编程语言等。',
        '计算机科学的发展经历了多个阶段，从早期的电子管计算机到晶体管计算机，再到集成电路计算机和大规模集成电路计算机。',
        '随着技术的不断进步，计算机的性能不断提高，体积不断减小，价格不断降低，应用范围也越来越广泛。',
        '在信息时代，计算机科学的重要性日益凸显，成为各个领域不可或缺的基础学科。',
        '通过学习计算机科学，我们可以更好地理解和利用计算机技术，为社会的发展做出贡献。'
      ]
    },
    // 前往章节
    goToChapter(index) {
      this.currentChapterIndex = index
      this.loadChapterContent(index)
      
      // 更新阅读进度
      this.bookProgress = (index / this.bookChapters.length) * 100
    },
    // 上一章
    previousChapter() {
      if (this.currentChapterIndex > 0) {
        this.goToChapter(this.currentChapterIndex - 1)
      }
    },
    // 下一章
    nextChapter() {
      if (this.currentChapterIndex < this.bookChapters.length - 1) {
        this.goToChapter(this.currentChapterIndex + 1)
      }
    },
    // 切换阅读器设置
    toggleReaderSettings() {
      this.showReaderSettings = !this.showReaderSettings
    },
    // 添加书签
    addBookmark() {
      this.$message.success(`已在《${this.bookChapters[this.currentChapterIndex]?.title}》添加书签`)
    },
    // 显示书签
    showBookmarks() {
      this.$message.info('书签功能待实现')
    },
    // 格式化书籍进度
    formatBookProgress(percentage) {
      return `已读 ${percentage}%`
    },
    // 查看资源
    viewResource(resource) {
      // 根据资源类型进行不同的查看操作
      if (resource.type === 'learning_material') {
        // 查找对应的学习资料
        const material = this.learningMaterials.find(m => m.name === resource.name)
        if (material) {
          this.previewResource(material)
        }
      } else if (resource.type === 'tool') {
        // 查找对应的工具
        const tool = this.tools.find(t => t.name === resource.name)
        if (tool) {
          this.useTool(tool)
        }
      } else if (resource.type === 'book') {
        // 查找对应的书籍
        const book = this.books.find(b => b.name === resource.name)
        if (book) {
          this.readBookOnline(book)
        }
      }
    },
    // 移除收藏
    removeFavorite(resource) {
      this.$confirm('确定要取消收藏该资源吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 从收藏列表中移除
        const index = this.favorites.findIndex(item => item.id === resource.id)
        if (index !== -1) {
          this.favorites.splice(index, 1)
        }
        
        // 同时更新对应的资源收藏状态
        if (resource.type === 'learning_material') {
          const material = this.learningMaterials.find(m => m.name === resource.name)
          if (material) {
            material.isFavorite = false
          }
        } else if (resource.type === 'tool') {
          const tool = this.tools.find(t => t.name === resource.name)
          if (tool) {
            tool.isFavorite = false
          }
        } else if (resource.type === 'book') {
          const book = this.books.find(b => b.name === resource.name)
          if (book) {
            book.isFavorite = false
          }
        }
        
        this.$message.success('取消收藏成功')
      }).catch(() => {
        // 取消操作
      })
    },
    // 移除历史记录
    removeHistory(resource) {
      this.$confirm('确定要删除该历史记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 从历史记录中移除
        const index = this.history.findIndex(item => item.id === resource.id)
        if (index !== -1) {
          this.history.splice(index, 1)
        }
        
        this.$message.success('删除成功')
      }).catch(() => {
        // 取消操作
      })
    },
    // 批量删除
    batchDelete() {
      this.$confirm(`确定要删除选中的 ${this.selectedResources.length} 项吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        if (this.activeTab === 'favorites') {
          // 批量删除收藏
          this.selectedResources.forEach(resource => {
            const index = this.favorites.findIndex(item => item.id === resource.id)
            if (index !== -1) {
              this.favorites.splice(index, 1)
            }
          })
        } else if (this.activeTab === 'history') {
          // 批量删除历史记录
          this.selectedResources.forEach(resource => {
            const index = this.history.findIndex(item => item.id === resource.id)
            if (index !== -1) {
              this.history.splice(index, 1)
            }
          })
        } else if (this.activeTab === 'learning') {
          // 批量删除学习资料
          this.selectedResources.forEach(resource => {
            const index = this.learningMaterials.findIndex(item => item.id === resource.id)
            if (index !== -1) {
              this.learningMaterials.splice(index, 1)
            }
          })
        }
        
        this.selectedResources = []
        this.$message.success('批量删除成功')
      }).catch(() => {
        // 取消操作
      })
    },
    // 批量下载
    batchDownload() {
      if (this.activeTab === 'learning') {
        this.$message.success(`开始批量下载 ${this.selectedResources.length} 个文件`)
        // 模拟下载
        this.selectedResources.forEach(resource => {
          this.addToHistory(resource, 'download')
          // 更新下载次数
          const index = this.learningMaterials.findIndex(item => item.id === resource.id)
          if (index !== -1) {
            this.learningMaterials[index].downloadCount++
          }
        })
        
        this.selectedResources = []
      }
    },
    // 批量添加到收藏
    batchAddToFavorites() {
      this.selectedResources.forEach(resource => {
        if (!resource.isFavorite) {
          this.toggleFavorite(resource)
        }
      })
      
      this.selectedResources = []
      this.$message.success('批量收藏成功')
    }
  }
}
</script>

<style scoped>
.resources-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.resources-card {
  background-color: #fff;
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.resources-tabs {
  margin-bottom: 20px;
}

.tab-badge {
  background-color: #f56c6c;
  color: #fff;
  font-size: 12px;
  border-radius: 10px;
  padding: 0 6px;
  margin-left: 4px;
}

.search-filter-card {
  margin-bottom: 20px;
}

.search-form {
  margin-bottom: 15px;
}

.advanced-filters {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
}

.filter-actions {
  text-align: right;
  margin-top: 10px;
}

.resources-list {
  margin-bottom: 20px;
}

/* 学习资料列表样式 */
.resource-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.favorite-button {
  color: #dcdfe6;
}

.favorite-button.favorited {
  color: #f7ba2a;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
}

.batch-actions {
  margin-bottom: 15px;
  display: flex;
  gap: 10px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* 工具网格样式 */
.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.tool-card {
  height: 100%;
}

.tool-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 15px;
}

.tool-icon {
  color: #409eff;
}

.tool-name {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 500;
}

.tool-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tool-description {
  margin-bottom: 15px;
  color: #606266;
  line-height: 1.6;
}

.tool-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  color: #909399;
  font-size: 14px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.tool-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 书籍网格样式 */
.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(600px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.book-card {
  height: 100%;
}

.book-content {
  display: flex;
  padding: 20px;
}

.book-cover {
  width: 120px;
  height: 180px;
  margin-right: 20px;
  flex-shrink: 0;
}

.book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.book-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.book-name {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 500;
}

.book-author,
.book-publisher,
.book-isbn {
  margin-bottom: 8px;
  color: #606266;
  font-size: 14px;
}

.book-tags {
  margin-bottom: 12px;
}

.book-description {
  margin-bottom: auto;
  color: #909399;
  font-size: 14px;
  line-height: 1.6;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.book-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

/* 预览对话框样式 */
.preview-container {
  height: calc(100vh - 180px);
  overflow-y: auto;
}

.preview-content {
  padding: 20px;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #909399;
}

.preview-placeholder .el-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

.image-preview {
  text-align: center;
}

.image-preview img {
  max-width: 100%;
  max-height: 600px;
  object-fit: contain;
}

.video-preview,
.audio-preview {
  text-align: center;
}

.text-preview pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 4px;
  max-height: 500px;
  overflow-y: auto;
}

/* 工具对话框样式 */
.tool-dialog-content {
  padding: 20px 0;
}

.tool-dialog-header {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.tool-dialog-icon {
  color: #409eff;
}

.tool-dialog-info h3 {
  margin: 0 0 10px 0;
  font-size: 20px;
  font-weight: 500;
}

.tool-dialog-tags {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.tool-dialog-stats {
  display: flex;
  gap: 20px;
  color: #909399;
  font-size: 14px;
}

.tool-dialog-description,
.tool-dialog-features,
.tool-dialog-usage,
.tool-dialog-access {
  margin-bottom: 20px;
}

.tool-dialog-features ul {
  margin: 10px 0;
  padding-left: 20px;
}

.tool-dialog-features li {
  margin-bottom: 5px;
}

.tool-dialog-links {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.links-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.link-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #409eff;
  text-decoration: none;
}

.link-item:hover {
  color: #66b1ff;
}

/* 书籍阅读器样式 */
.book-reader-container {
  height: calc(100vh - 180px);
  display: flex;
  position: relative;
}

.book-reader-sidebar {
  width: 300px;
  background-color: #f5f7fa;
  padding: 20px;
  overflow-y: auto;
  border-right: 1px solid #ebeef5;
  flex-shrink: 0;
}

.book-reader-info h4 {
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: 500;
}

.book-reader-author {
  margin-bottom: 15px;
  color: #606266;
}

.book-reader-progress {
  margin-bottom: 20px;
}

.progress-text {
  text-align: right;
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.book-reader-toc h5 {
  margin: 0 0 10px 0;
  font-size: 16px;
  font-weight: 500;
}

.toc-list {
  max-height: 400px;
  overflow-y: auto;
}

.toc-item {
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  margin-bottom: 4px;
  font-size: 14px;
  color: #606266;
}

.toc-item:hover {
  background-color: #eef2f7;
}

.toc-item.active {
  background-color: #409eff;
  color: #fff;
}

.book-reader-content {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.reader-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.reader-chapter-title {
  font-size: 24px;
  font-weight: 500;
  margin-bottom: 30px;
  text-align: center;
}

.reader-chapter-content {
  flex: 1;
}

.reader-chapter-content p {
  text-indent: 2em;
  margin-bottom: 15px;
  line-height: 1.8;
  font-size: 16px;
}

.reader-footer {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: 30px;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
}

.reader-settings-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 10;
  width: 300px;
}

.reader-settings-panel h4 {
  margin: 0 0 15px 0;
  font-size: 18px;
  font-weight: 500;
}

.setting-item {
  margin-bottom: 20px;
}

.setting-item label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .resources-container {
    padding: 10px;
  }
  
  .tools-grid {
    grid-template-columns: 1fr;
  }
  
  .books-grid {
    grid-template-columns: 1fr;
  }
  
  .book-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .book-cover {
    margin-right: 0;
    margin-bottom: 20px;
  }
  
  .book-actions {
    justify-content: center;
  }
  
  .book-reader-container {
    flex-direction: column;
  }
  
  .book-reader-sidebar {
    width: 100%;
    height: 200px;
    border-right: none;
    border-bottom: 1px solid #ebeef5;
  }
  
  .reader-footer {
    flex-wrap: wrap;
    gap: 15px;
  }
}
</style>