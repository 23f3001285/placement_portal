// Axios config
axios.defaults.baseURL = "http://127.0.0.1:5000"

axios.interceptors.request.use(config => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Create app
const app = Vue.createApp({
  data() {
    return {
      role: localStorage.getItem("role") || null
    }
  },
  methods: {
    setRole(newRole) {
      this.role = newRole
    },
    clearRole() {
      this.role = null
    }
  },
  template: `
    <div>
      <Sidebar v-if="role"/>
      <router-view v-else/>
    </div>
  `
})

app.component("Sidebar", Sidebar)
app.use(router)
app.mount("#app")

