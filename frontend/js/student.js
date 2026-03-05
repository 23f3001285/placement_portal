const StudentDashboard = {
  template: `
    <div>

      <h4 class="mb-3">Student Dashboard</h4>

      <!-- Profile Button -->
      <router-link to="/student/profile"
                   class="btn btn-outline-primary btn-sm mb-3">
        Edit Profile
      </router-link>

      <!-- Job Search -->
      <div class="card shadow-sm p-3 mb-4">
        <h5>Search Placement Drives</h5>
        <div v-if="placements.length === 0"
             class="text-muted text-center py-4">
          No placements yet
        </div>

        <input v-model="searchQuery"
               class="form-control form-control-sm"
               placeholder="Search by title or skills"
               @input="filterJobs">
      </div>

      <!-- Available Jobs -->
      <h5>Available Placement Drives</h5>

      <div class="row">
        <div class="col-md-4 mb-3"
             v-for="job in filteredJobs"
             :key="job.job_id">

          <div class="card shadow-sm p-3 h-100">
            <h5>{{ job.title }}</h5>

            <p><strong>Salary:</strong> {{ job.salary || 'Not specified' }}</p>
            <p><strong>Skills:</strong> {{ job.skills_required || 'N/A' }}</p>

            <button class="btn btn-success btn-sm mt-auto"
                    @click="apply(job.job_id)">
              Apply
            </button>
          </div>

        </div>
      </div>

      <hr class="my-4">

      <!-- My Applications -->
      <h5>My Applications</h5>

      <div class="card shadow-sm mb-3 p-3"
           v-for="app in applications"
           :key="app.application_id">

        <div class="d-flex justify-content-between align-items-center">
          <div>
            <strong>Job ID:</strong> {{ app.job_id }}
            <br>
            <small>Applied On: {{ formatDate(app.applied_on) }}</small>
          </div>

          <span class="badge me-2 align-self-center"
                :class="{
                  'bg-secondary': app.status==='Applied',
                  'bg-warning text-dark': app.status==='Shortlisted',
                  'bg-info': app.status==='Interview',
                  'bg-success': app.status==='Selected',
                  'bg-danger': app.status==='Rejected'
                }">
            {{ app.status }}
          </span>

          <div v-if="app.interview_date" class="mt-1">
            <small class="text-info">
              Interview: {{ app.interview_date }} ({{ app.interview_location }})
            </small>
          </div>

          <div v-if="app.feedback" class="mt-1">
            <small class="text-muted">
              Feedback: {{ app.feedback }}
            </small>
          </div>

        </div>
      </div>

      <hr class="my-4">

      <!-- Placement History -->
      <h5>Placement History</h5>

      <div v-if="placements.length === 0"
           class="alert alert-light">
        No placements yet.
      </div>

      <div class="card shadow-sm mb-3 p-3"
           v-for="p in placements"
           :key="p.company_id">

        <h6>{{ p.position }}</h6>
        <div>Company ID: {{ p.company_id }}</div>
        <div>Salary: {{ p.salary }}</div>
        <div>Joining Date: {{ p.joining_date }}</div>

        <button v-if="p.placement_id"
                @click="downloadOffer(p.placement_id)"
                class="btn btn-success btn-sm">
          Download Offer Letter
        </button>
      </div>

      <hr class="my-4">

      <!-- Export -->
      <button class="btn btn-outline-primary"
              @click="exportCSV">
        Export Applications as CSV
      </button>

    </div>
  `,
  data() {
    return {
      jobs: [],
      filteredJobs: [],
      applications: [],
      placements: [],
      searchQuery: ""
    }
  },
  async mounted() {
    await this.fetchJobs()
    await this.fetchApplications()
    await this.fetchPlacements()
  },
  methods: {

    async fetchJobs() {
      const res = await axios.get("/student/jobs")
      this.jobs = res.data
      this.filteredJobs = res.data
    },

    async fetchApplications() {
      const res = await axios.get("/student/applications")
      this.applications = res.data
    },

    async fetchPlacements() {
      const res = await axios.get("/student/placements")
      this.placements = res.data
    },

    filterJobs() {
      const q = this.searchQuery.toLowerCase()

      this.filteredJobs = this.jobs.filter(j =>
        j.title.toLowerCase().includes(q) ||
        (j.skills_required && j.skills_required.toLowerCase().includes(q))
      )
    },

    async apply(jobId) {
      try {
        await axios.post(`/student/jobs/${jobId}/apply`)
      
        this.$root.showAlert("Application submitted successfully", "success")
      
        await this.fetchApplications()
      
      } catch (err) {
      
        this.$root.showAlert(
          err.response?.data?.message || "Application failed",
          "danger"
        )
      
      }
    },

    async exportCSV() {
      try {
      
        await axios.post("/student/export")
      
        this.$root.showAlert(
          "Export started. You will be notified when it's ready.",
          "info"
        )
      
      } catch (err) {
      
        this.$root.showAlert("Export failed", "danger")
      
      }
    },

    async downloadOffer(id) {
      const res = await axios.get(`/company/offer/${id}`, {
        responseType: "blob"
      })
    
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", "offer_letter.pdf")
      document.body.appendChild(link)
      link.click()
    },

    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString()
    }

  }
}

