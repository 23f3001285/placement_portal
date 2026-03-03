const Sidebar = {
  template: `
    <div class="d-flex">

      <!-- Sidebar -->
      <div class="bg-dark text-white p-3"
           style="width: 240px; min-height: 100vh;">

        <h5 class="mb-4">Placement Portal</h5>

        <ul class="nav nav-pills flex-column">

          <!-- ADMIN -->
          <template v-if="role==='admin'">
            <li class="nav-item">
              <router-link class="nav-link text-white"
                           to="/admin">
                Dashboard
              </router-link>
            </li>

            <li class="nav-item">
              <router-link class="nav-link text-white"
                           to="/admin/companies">
                Companies
              </router-link>
            </li>

            <li class="nav-item">
              <router-link class="nav-link text-white"
                           to="/admin/drives">
                Drives
              </router-link>
            </li>

            <li class="nav-item">
              <router-link class="nav-link text-white"
                           to="/admin/students">
                Students
              </router-link>
            </li>
          </template>

          <!-- COMPANY -->
          <template v-if="role==='company'">
            <li class="nav-item">
              <router-link class="nav-link text-white"
                           to="/company">
                Dashboard
              </router-link>
            </li>
          </template>

          <!-- STUDENT -->
          <template v-if="role==='student'">
            <li class="nav-item">
              <router-link class="nav-link text-white"
                           to="/student">
                Dashboard
              </router-link>
            </li>

            <li class="nav-item">
              <router-link class="nav-link text-white"
                           to="/student/profile">
                Profile
              </router-link>
            </li>
          </template>

        </ul>

        <hr class="bg-light">

        <div class="mt-auto">
          <small class="d-block mb-2 text-capitalize">
            {{ role }}
          </small>

          <button class="btn btn-outline-light btn-sm w-100"
                  @click="logout">
            Logout
          </button>
        </div>

      </div>

      <!-- Main Content -->
      <div class="flex-fill p-4">
        <router-view/>
      </div>

    </div>
  `,
  computed: {
    role() {
      return this.$root.role
    }
  },
  methods: {
    logout() {
      localStorage.clear()
      this.$root.clearRole()
      this.$router.push("/")
    }
  }
}