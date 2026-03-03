const Navbar = {
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container-fluid">
        <span class="navbar-brand">Placement Portal</span>

        <div class="collapse navbar-collapse">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">

            <li class="nav-item" v-if="role==='admin'">
              <router-link class="nav-link" to="/admin">Dashboard</router-link>
            </li>

            <li class="nav-item" v-if="role==='admin'">
              <router-link class="nav-link" to="/admin/companies">Companies</router-link>
            </li>

            <li class="nav-item" v-if="role==='admin'">
              <router-link class="nav-link" to="/admin/drives">Drives</router-link>
            </li>

            <li class="nav-item" v-if="role==='admin'">
              <router-link class="nav-link" to="/admin/students">Students</router-link>
            </li>

            <li class="nav-item" v-if="role==='company'">
              <router-link class="nav-link" to="/company">Dashboard</router-link>
            </li>

            <li class="nav-item" v-if="role==='student'">
              <router-link class="nav-link" to="/student">Dashboard</router-link>
            </li>

            <li class="nav-item" v-if="role==='student'">
              <router-link class="nav-link" to="/student/profile">Profile</router-link>
            </li>

          </ul>

          <div class="d-flex align-items-center text-white">
            <span class="me-3 text-capitalize">
              {{ role }}
            </span>
            <button class="btn btn-outline-light btn-sm"
                    @click="logout">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  `,
  computed: {
    role() {
      return localStorage.getItem("role")
    }
  },
  methods: {
    logout() {
      localStorage.clear()
      this.$root.role = null
      this.$router.push("/")
    }
  }
}