<template>
  <div class="login-container">
    <div class="login-form">
      <h2 class="login-title">课程管理系统 - 登录</h2>

      <el-form
        :model="loginForm"
        :rules="loginRules"
        ref="loginFormRef"
        label-width="80px"
      >
        <!-- 用户名 -->
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
          ></el-input>
        </el-form-item>

        <!-- 密码 -->
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          ></el-input>
        </el-form-item>

        <!-- 角色选择 -->
        <el-form-item label="角色" prop="role">
          <el-select v-model="loginForm.role" placeholder="请选择角色">
            <el-option label="学生" value="student"></el-option>
            <el-option label="教师" value="teacher"></el-option>
            <el-option label="管理员" value="admin"></el-option>
          </el-select>
        </el-form-item>

        <!-- 记住我 -->
        <el-form-item>
          <el-checkbox v-model="rememberMe">记住我</el-checkbox>
        </el-form-item>

        <!-- 登录按钮 -->
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            @click="handleLogin"
            class="login-btn"
          >
            {{ loading ? '正在登录...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import api from "../services/axios";

export default {
  name: "Login",
  data() {
    return {
      loginForm: {
        username: localStorage.getItem("rememberUsername") || "",
        password: "",
        role: "",
      },
      rememberMe: !!localStorage.getItem("rememberUsername"),
      loading: false,
      loginRules: {
        username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
        password: [{ required: true, message: "请输入密码", trigger: "blur" }],
        role: [{ required: true, message: "请选择角色", trigger: "change" }],
      },
    };
  },
  methods: {
    async handleLogin() {
      this.$refs.loginFormRef.validate(async (valid) => {
        if (!valid) return;

        this.loading = true;
        try {
          // 调用真实登录API进行用户验证 - 只发送后端需要的参数
          const { username, password } = this.loginForm;
          const res = await api.post("/auth/login", { username, password });
          
          // 从正确的响应结构中获取数据
          const { token, user } = res.data.data;
          // 根据后端实际返回的数据，使用loginForm中的role值作为用户角色
          const role = this.loginForm.role;

          // 记住用户名
          if (this.rememberMe) {
            localStorage.setItem("rememberUsername", this.loginForm.username);
          } else {
            localStorage.removeItem("rememberUsername");
          }

          // 存储登录信息
          localStorage.setItem("token", token);
          localStorage.setItem("userRole", role);
          localStorage.setItem("userInfo", JSON.stringify(user));

          // 跳转到不同角色的首页
          const routeMap = {
            student: "/student/dashboard",
            teacher: "/teacher/dashboard",
            admin: "/admin/dashboard",
          };
          this.$router.push(routeMap[role]);
        } catch (error) {
          // 显示更具体的错误信息
          const errorMsg = error.response?.data?.message || "登录失败，请检查用户名或密码";
          this.$message.error(errorMsg);
        } finally {
          this.loading = false;
        }
      });
    },
  },
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
}

.login-form {
  width: 90%;
  max-width: 420px;
  padding: 30px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.login-title {
  text-align: center;
  margin-bottom: 30px;
  color: #303133;
  font-weight: 600;
}

.login-btn {
  width: 100%;
}
</style>
