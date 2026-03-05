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
      role: localStorage.getItem("role") || null,
      alertMessage: "",
      alertType: "success"
    }
  },
  methods: {
    setRole(newRole) {
      this.role = newRole
    },
    clearRole() {
      this.role = null
    },
    showAlert(message, type="success") {
      this.alertMessage = message
      this.alertType = type

      setTimeout(() => {
        this.alertMessage = ""
      }, 4000)
    }
  },
  template: `
    <div>
  
      <!-- GLOBAL ALERT -->
      <div v-if="alertMessage"
           :class="'alert alert-' + alertType"
           style="position:fixed; top:20px; right:20px; z-index:9999; min-width:250px;">
  
        {{ alertMessage }}
  
        <button type="button"
                class="btn-close float-end"
                @click="alertMessage=''">
        </button>
  
      </div>
  
      <Sidebar v-if="role"/>
      <router-view v-else/>
  
    </div>
  `
})

app.component("Sidebar", Sidebar)
app.use(router)
app.mount("#app")

