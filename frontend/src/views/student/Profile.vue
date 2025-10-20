<template>
  <div class="profile-container">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <span>个人基本信息</span>
          <el-button type="primary" @click="toggleEdit">
            {{ isEditing ? '取消' : '编辑' }}
          </el-button>
        </div>
      </template>
      
      <el-form :model="studentInfo" :rules="profileRules" ref="profileFormRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="24" class="avatar-section">
            <el-avatar size="120" :src="studentInfo.avatar || defaultAvatar">
              {{ getInitials(studentInfo.name) }}
            </el-avatar>
            <div v-if="isEditing">
              <el-upload
                class="avatar-uploader"
                action="#"
                :show-file-list="false"
                :auto-upload="false"
                :on-change="handleAvatarChange"
              >
                <el-button type="primary">更换头像</el-button>
              </el-upload>
            </div>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="学号" prop="studentNo">
              <el-input v-model="studentInfo.studentNo" :disabled="!isEditing"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="studentInfo.name" :disabled="!isEditing"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="studentInfo.gender" :disabled="!isEditing">
                <el-radio label="男">男</el-radio>
                <el-radio label="女">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出生日期" prop="birthday">
              <el-date-picker
                v-model="studentInfo.birthday"
                type="date"
                placeholder="选择日期"
                :disabled="!isEditing"
                style="width: 100%;"
              ></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="手机号码" prop="phone">
              <el-input v-model="studentInfo.phone" :disabled="!isEditing"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电子邮箱" prop="email">
              <el-input v-model="studentInfo.email" :disabled="!isEditing"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="联系地址" prop="address">
              <el-input v-model="studentInfo.address" type="textarea" :rows="3" :disabled="!isEditing"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="入学日期" prop="enrollmentDate">
              <el-date-picker
                v-model="studentInfo.enrollmentDate"
                type="date"
                placeholder="选择日期"
                :disabled="!isEditing"
                style="width: 100%;"
              ></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学生状态">
              <el-tag :type="getStatusType(studentInfo.status)">{{ studentInfo.status }}</el-tag>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item v-if="isEditing" class="submit-section">
          <el-button type="primary" @click="submitForm">保存修改</el-button>
          <el-button @click="cancelEdit">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <span>账户安全设置</span>
        </div>
      </template>
      
      <el-form :model="accountInfo" :rules="accountRules" ref="accountFormRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="accountInfo.username" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色">
              <el-tag type="info">学生</el-tag>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="修改密码">
              <el-button type="primary" @click="showPasswordDialog = true">修改密码</el-button>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="上次登录时间">
              <span>{{ lastLoginTime }}</span>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 修改密码弹窗 -->
    <el-dialog
      v-model="showPasswordDialog"
      title="修改密码"
      width="500px"
    >
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="120px">
        <el-form-item label="原密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" show-password></el-input>
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showPasswordDialog = false">取消</el-button>
          <el-button type="primary" @click="changePassword">确认修改</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'StudentProfile',
  data() {
    return {
      isEditing: false,
      showPasswordDialog: false,
      defaultAvatar: '',
      originalInfo: {},
      studentInfo: {
        studentNo: '2023001001',
        name: '学生用户',
        gender: '男',
        birthday: '2005-01-15',
        phone: '13800138000',
        email: 'student@example.com',
        address: '北京市海淀区',
        enrollmentDate: '2023-09-01',
        status: '在读',
        avatar: ''
      },
      accountInfo: {
        username: 'student001',
        role: '学生'
      },
      lastLoginTime: '2025-10-20 08:30:45',
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      profileRules: {
        studentNo: [
          { required: true, message: '请输入学号', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入姓名', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { pattern: /^1[3456789]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入电子邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的电子邮箱', trigger: 'blur' }
        ]
      },
      accountRules: {},
      passwordRules: {
        oldPassword: [
          { required: true, message: '请输入原密码', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请确认新密码', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              if (value !== this.passwordForm.newPassword) {
                callback(new Error('两次输入的密码不一致'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    toggleEdit() {
      if (!this.isEditing) {
        // 保存原始数据
        this.originalInfo = JSON.parse(JSON.stringify(this.studentInfo))
      }
      this.isEditing = !this.isEditing
    },
    cancelEdit() {
      // 恢复原始数据
      this.studentInfo = JSON.parse(JSON.stringify(this.originalInfo))
      this.isEditing = false
    },
    submitForm() {
      this.$refs.profileFormRef.validate((valid) => {
        if (valid) {
          // 模拟提交
          this.$message.success('个人信息修改成功')
          this.isEditing = false
        }
      })
    },
    changePassword() {
      this.$refs.passwordFormRef.validate((valid) => {
        if (valid) {
          // 模拟修改密码
          this.$message.success('密码修改成功')
          this.showPasswordDialog = false
          this.passwordForm = {
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
          }
        }
      })
    },
    handleAvatarChange(file) {
      // 模拟上传头像
      this.$message.success('头像上传成功')
      // 在实际应用中，这里应该处理文件上传逻辑
    },
    getInitials(name) {
      if (!name) return '用'
      return name.charAt(0)
    },
    getStatusType(status) {
      const statusMap = {
        '在读': 'success',
        '休学': 'warning',
        '毕业': 'info',
        '退学': 'danger'
      }
      return statusMap[status] || 'default'
    }
  }
}
</script>

<style scoped>
.profile-container {
  padding: 20px;
}

.profile-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.avatar-section {
  text-align: center;
  margin-bottom: 30px;
}

.avatar-uploader {
  margin-top: 10px;
}

.submit-section {
  text-align: center;
  margin-top: 20px;
}
</style>