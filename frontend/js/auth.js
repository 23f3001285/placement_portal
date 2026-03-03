const Login = {
  template: `
    <div class="container d-flex justify-content-center align-items-center" style="min-height: 80vh;">
      <div class="card shadow p-4" style="width: 400px;">
        <h4 class="text-center mb-3">Placement Portal Login</h4>

        <div v-if="error" class="alert alert-danger py-2">
          {{ error }}
        </div>

        <input v-model="email"
               class="form-control mb-2"
               placeholder="Email">

        <input v-model="password"
               type="password"
               class="form-control mb-3"
               placeholder="Password">

        <button class="btn btn-primary w-100"
                :disabled="loading"
                @click="login">
          {{ loading ? "Logging in..." : "Login" }}
        </button>

        <hr>

        <p class="text-center mb-1">New user?</p>

        <div class="d-flex justify-content-center gap-2">
          <router-link to="/register/student"
                       class="btn btn-outline-success btn-sm">
            Student
          </router-link>

          <router-link to="/register/company"
                       class="btn btn-outline-info btn-sm">
            Company
          </router-link>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      email: "",
      password: "",
      error: "",
      loading: false
    }
  },
  methods: {
    async login() {
      try {
        this.error = ""
        this.loading = true

        const res = await axios.post("/auth/login", {
          email: this.email,
          password: this.password
        })

        localStorage.setItem("token", res.data.access_token)
        localStorage.setItem("role", res.data.role)
        this.$root.setRole(res.data.role)

        this.$router.push(`/${res.data.role}`)

      } catch (err) {
        this.error = err.response?.data?.message || "Login failed"
      } finally {
        this.loading = false
      }
    }
  }
}

