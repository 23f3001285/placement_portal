const AdminDashboard = {
  template: `
  <div>

    <h4 class="mb-4">Admin Analytics Dashboard</h4>

    <div class="row mb-4">

      <div class="col-md-3 mb-3">
        <div class="card shadow-sm text-center p-3">
          <h6 class="text-muted">Students</h6>
          <h3>{{ stats.total_students }}</h3>
        </div>
      </div>

      <div class="col-md-3 mb-3">
        <div class="card shadow-sm text-center p-3">
          <h6 class="text-muted">Companies</h6>
          <h3>{{ stats.total_companies }}</h3>
        </div>
      </div>

      <div class="col-md-3 mb-3">
        <div class="card shadow-sm text-center p-3">
          <h6 class="text-muted">Drives</h6>
          <h3>{{ stats.total_jobs }}</h3>
        </div>
      </div>

      <div class="col-md-3 mb-3">
        <div class="card shadow-sm text-center p-3">
          <h6 class="text-muted">Applications</h6>
          <h3>{{ stats.total_applications }}</h3>
        </div>
      </div>

    </div>

    <div class="card shadow-sm p-4">
      <h5 class="mb-3">System Overview</h5>
      <canvas id="adminChart"></canvas>
    </div>

  </div>
`,
  data() {
    return {
      stats: {}
    }
  },
  async mounted() {
    const res = await axios.get("/admin/dashboard")
    this.stats = res.data

    this.$nextTick(() => {
      const ctx = document.getElementById("adminChart")

      new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["Students", "Companies", "Drives", "Applications"],
          datasets: [{
            label: "System Metrics",
            data: [
              this.stats.total_students,
              this.stats.total_companies,
              this.stats.total_jobs,
              this.stats.total_applications
            ],
            backgroundColor: [
              "#0d6efd",
              "#198754",
              "#ffc107",
              "#dc3545"
            ]
          }]
        }
      })
    })
  }
}

const AdminCompanies = {
  template: `
    <div>
      <h4 class="mb-3">Manage Companies</h4>

      <input class="form-control mb-3"
             v-model="searchQuery"
             placeholder="Search companies by name"
             @input="fetchCompanies">

      <div class="row">
        <div class="col-md-4 mb-3"
             v-for="company in companies"
             :key="company.id">

          <div class="card shadow-sm p-3">
            <h5>{{ company.name }}</h5>
            <p><strong>Industry:</strong> {{ company.industry }}</p>

            <span class="badge"
                  :class="{
                    'bg-warning text-dark': company.status==='Pending',
                    'bg-success': company.status==='Approved',
                    'bg-danger': company.status==='Rejected'
                  }">
              {{ company.status }}
            </span>

            <div class="mt-3">

                <!-- Pending -->
                <button v-if="company.status === 'Pending'"
                        class="btn btn-success btn-sm me-2"
                        @click="approve(company.id)">
                  Approve
                </button>

                <button v-if="company.status === 'Pending'"
                        class="btn btn-danger btn-sm"
                        @click="reject(company.id)">
                  Reject
                </button>

                <!-- Approved + Active -->
                <button v-if="company.status === 'Approved' && company.is_active"
                        class="btn btn-warning btn-sm"
                        @click="deactivateCompany(company.id)">
                  Deactivate
                </button>

                <!-- Approved + Deactivated -->
                <button v-if="company.status === 'Approved' && !company.is_active"
                        class="btn btn-success btn-sm"
                        @click="activateCompany(company.id)">
                  Activate
                </button>

            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  data() {
      return {
      companies: [],
      searchQuery: ""
    }
  },
  async mounted() {
    await this.fetchCompanies()
  },
  methods: {
    async fetchCompanies() {
      const res = await axios.get(`/admin/companies?q=${this.searchQuery}`)
      this.companies = res.data
    },
    async approve(id) {
      await axios.put(`/admin/company/${id}/approve`)
      this.fetchCompanies()
    },
    async reject(id) {
      await axios.put(`/admin/company/${id}/reject`)
      this.fetchCompanies()
    },
    async deactivateCompany(companyId) {
      await axios.put(`/admin/company/${companyId}/deactivate`)
      this.fetchCompanies()
    },

    async activateCompany(companyId) {
      await axios.put(`/admin/company/${companyId}/activate`)
      this.fetchCompanies()
    }

  }
}

const AdminStudents = {
  template: `
    <div>
      <h4 class="mb-3">Manage Students</h4>

      <input class="form-control mb-3"
             v-model="searchQuery"
             placeholder="Search students by email"
             @input="fetchStudents">

      <div class="card shadow-sm mb-2 p-3"
           v-for="student in students"
           :key="student.id">
        
        <span class="badge bg-danger" v-if="!student.is_active">
            Blacklisted
        </span>   

        <div class="d-flex justify-content-between align-items-center">
          <div>
            <strong>{{ student.email }}</strong>
            <div>CGPA: {{ student.cgpa }}</div>
            <div>Skills: {{ student.skills }}</div>
          </div>

          <button v-if="student.is_active"
        class="btn btn-danger btn-sm me-2"
                  @click="deactivate(student.id)">
            Deactivate
          </button>

          <button v-else
                  class="btn btn-success btn-sm"
                  @click="activate(student.id)">
            Activate
          </button>
        </div>

      </div>

    </div>
  `,
  data() {
    return {
      students: [],
      searchQuery: ""
    }
  },
  async mounted() {
    await this.fetchStudents()
  },
  methods: {
    async fetchStudents() {
      const res = await axios.get(`/admin/students?q=${this.searchQuery}`)
      this.students = res.data
    },
    async deactivate(id) {
      await axios.put(`/admin/user/${id}/deactivate`)
      this.fetchStudents()
    },
    async activate(id) {
      await axios.put(`/admin/user/${id}/activate`)
      this.fetchStudents()
    }
  }
}

const AdminDrives = {
  template: `
    <div>
      <h4 class="mb-3">Manage Placement Drives</h4>

      <div class="row">
        <div class="col-md-4 mb-3"
             v-for="job in jobs"
             :key="job.id">

          <div class="card shadow-sm p-3">
            <h5>{{ job.title }}</h5>

            <span class="badge"
                  :class="{
                    'bg-warning text-dark': job.status==='Pending',
                    'bg-success': job.status==='Approved',
                    'bg-danger': job.status==='Rejected'
                  }">
              {{ job.status }}
            </span>

            <div class="mt-3">
              <button v-if="job.status === 'Pending'"
                      class="btn btn-success btn-sm me-2"
                      @click="approve(job.id)">
                Approve
              </button>

              <button v-if="job.status === 'Pending'"
                      class="btn btn-danger btn-sm"
                      @click="reject(job.id)">
                Reject
              </button>
            </div>
          </div>

        </div>
      </div>

      <hr class="my-4">

      <h5>All Applications</h5>

      <div class="card shadow-sm mb-2 p-3"
           v-for="app in applications"
           :key="app.application_id">

        <div class="d-flex justify-content-between">
          <div>
            Student ID: {{ app.student_id }}
            <br>
            Job ID: {{ app.job_id }}
          </div>

          <span class="badge bg-secondary">
            {{ app.status }}
          </span>
        </div>

      </div>

    </div>
  `,
  data() {
    return {
      jobs: [],
      applications: []
    }
  },
  async mounted() {
    await this.fetchJobs()
    await this.fetchApplications()
  },
  methods: {
    async fetchJobs() {
      const res = await axios.get("/admin/jobs")
      this.jobs = res.data
    },
    async fetchApplications() {
      const res = await axios.get("/admin/applications")
      this.applications = res.data
    },
    async approve(id) {
      await axios.put(`/admin/job/${id}/approve`)
      this.fetchJobs()
    },
    async reject(id) {
      await axios.put(`/admin/job/${id}/reject`)
      this.fetchJobs()
    }
  }
}

