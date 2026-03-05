const CompanyDashboard = {
  template: `
    <div>

      <h4 class="mb-4">Company Dashboard</h4>

      <!-- Approval Warning -->
      <div v-if="companyStatus !== 'Approved'"
           class="alert"
           :class="{
             'alert-warning': companyStatus==='Pending',
             'alert-danger': companyStatus==='Rejected'
           }">
        Your company status: <strong>{{ companyStatus }}</strong>
      </div>

      <!-- Summary Cards -->
      <div v-if="companyStatus==='Approved'"
           class="row mb-4">

        <div class="col-md-6 mb-3">
          <div class="card shadow-sm text-center p-3">
            <h6 class="text-muted">Total Drives</h6>
            <h3>{{ summary.total_jobs }}</h3>
          </div>
        </div>

        <div class="col-md-6 mb-3">
          <div class="card shadow-sm text-center p-3">
            <h6 class="text-muted">Total Applications</h6>
            <h3>{{ summary.total_applications }}</h3>
          </div>
        </div>

      </div>

      <!-- Create Drive -->
      <div v-if="companyStatus==='Approved'"
           class="card shadow-sm p-4 mb-4">

        <h5 class="mt-4 mb-3">Create Placement Drive</h5>

        <input v-model="newJob.title"
               class="form-control mb-2"
               placeholder="Job Title">

        <input v-model="newJob.salary"
               class="form-control mb-2"
               placeholder="Salary">

        <textarea v-model="newJob.description"
                  class="form-control mb-2"
                  placeholder="Description"></textarea>

        <input v-model="newJob.skills_required"
               class="form-control mb-3"
               placeholder="Skills Required">

        <button class="btn btn-primary"
                @click="createJob">
          Submit for Approval
        </button>
      </div>

      <!-- Drives List -->
      <h5 class="mt-4 mb-3">Your Drives</h5>

      <div class="card shadow-sm mb-3 p-3"
           v-for="job in jobs"
           :key="job.id">

        <div class="d-flex justify-content-between align-items-center">

          <div>
            <h6>{{ job.title }}</h6>
            <div><small>{{ job.salary }}</small></div>
            <div><small>{{ job.skills_required }}</small></div>
          </div>

          <div>

            <span class="badge me-2"
                  :class="{
                    'bg-warning text-dark': job.status==='Pending',
                    'bg-success': job.status==='Approved',
                    'bg-danger': job.status==='Rejected',
                    'bg-dark': job.status==='Closed'
                  }">
              {{ job.status }}
            </span>

            <button class="btn btn-outline-primary btn-sm me-1"
                    @click="loadApplicants(job.id)">
              Applicants
            </button>

            <button v-if="job.status==='Approved'"
                    class="btn btn-outline-danger btn-sm"
                    @click="closeJob(job.id)">
              Close
            </button>

          </div>

        </div>
      </div>

      <!-- Applicants Panel -->
      <div v-if="applications.length"
           class="mt-4">

        <h5 class="mt-4 mb-3">Applicants</h5>

        <div class="card shadow-sm p-3 mb-2"
             v-for="app in applications"
             :key="app.application_id">

          <div class="d-flex justify-content-between">

            <div>
              Student ID: {{ app.student_id }}
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

          </div>

          <div class="mt-2">

            <button v-if="app.status === 'Applied'"
                    class="btn btn-warning btn-sm me-1"
                    @click="updateStatus(app.application_id, 'Shortlisted')">
              Shortlist
            </button>

            <button v-if="app.status === 'Applied' || app.status === 'Shortlisted'"
                    class="btn btn-danger btn-sm me-1"
                    @click="updateStatus(app.application_id, 'Rejected')">
              Reject
            </button>

            <button v-if="app.status === 'Shortlisted'"
                    class="btn btn-info btn-sm me-1"
                    @click="updateStatus(app.application_id, 'Interview')">
              Interview
            </button>

            <button v-if="app.status === 'Interview'"
                    class="btn btn-success btn-sm me-1"
                    @click="updateStatus(app.application_id, 'Selected')">
              Select
            </button>

            <button class="btn btn-sm btn-outline-secondary"
                    @click="viewStudent(app.student_id)">
              View Profile
            </button>

          </div>

        </div>

      </div>
      <div v-if="selectedStudent" class="card p-3 mt-3">
        <h6>Student Profile</h6>
        <p><strong>Education:</strong> {{ selectedStudent.education }}</p>
        <p><strong>CGPA:</strong> {{ selectedStudent.cgpa }}</p>
        <p><strong>Skills:</strong> {{ selectedStudent.skills }}</p>

        <a v-if="selectedStudent.resume"
           :href="resumeUrl(selectedStudent.resume)"
           target="_blank"
           class="btn btn-sm btn-outline-primary">
          Download Resume
        </a>
      </div>

    </div>
  `,
  data() {
    return {
      companyStatus: "",
      summary: {},
      jobs: [],
      applications: [],
      selectedJobId: null,
      selectedStudent: null,
      newJob: {
        title: "",
        description: "",
        salary: "",
        skills_required: ""
      }
    }
  },
  async mounted() {
    await this.fetchDashboard()
    await this.loadJobs()
  },
  methods: {

    async fetchDashboard() {
      try {
        const res = await axios.get("/company/dashboard")
        this.companyStatus = "Approved"
        this.summary = res.data
      } catch (err) {
        this.companyStatus = err.response?.data?.approval_status || "Rejected"
      }
    },

    async loadJobs() {
      const res = await axios.get("/company/jobs")
      this.jobs = res.data
    },

    async createJob() {
      try {
        await axios.post("/company/jobs", this.newJob)
        this.$root.showAlert("Drive submitted for approval", "success")
        this.loadJobs()      
      } catch (err) {
        this.$root.showAlert(
          err.response?.data?.message || "Drive creation failed",
          "danger"
        )
      
      }
    },

    async loadApplicants(jobId) {
      this.selectedJobId = jobId
      const res = await axios.get(`/company/jobs/${jobId}/applications`)
      this.applications = res.data
    },

    async updateStatus(applicationId, status) {

      let payload = { status }

      if (status === "Interview") {
        const dateInput = prompt("Enter interview date (YYYY-MM-DDTHH:MM)")
        const locationInput = prompt("Enter interview location/link")
      
        payload.interview_date = dateInput
        payload.interview_location = locationInput
      }
    
      if (status === "Rejected" || status === "Selected") {
        const feedbackInput = prompt("Enter feedback (optional)")
        payload.feedback = feedbackInput
      }
    
      try {
        await axios.put(`/company/applications/${applicationId}/status`, payload)
      } catch (err) {
        this.$root.showAlert(err.response?.data?.message, "danger")
      }
    
      // ALWAYS refresh after attempt
      this.loadApplicants(this.selectedJobId)
    },

    async closeJob(jobId) {
      try {
        await axios.put(`/company/jobs/${jobId}/close`)     
        this.$root.showAlert("Drive closed successfully", "warning")
        this.loadJobs()      
      } catch (err) {      
        this.$root.showAlert(
          err.response?.data?.message || "Failed to close drive",
          "danger"
        )     
      }
    },

    async viewStudent(studentId) {
      try {
        const res = await axios.get(`/company/student/${studentId}`)     
        this.selectedStudent = res.data
      } catch (err) {      
        this.$root.showAlert(
          err.response?.data?.message || "Failed to load student profile",
          "danger"
        )      
      }
    },

    resumeUrl(filename) {
      return axios.defaults.baseURL + "/student/resume/" + filename
    }

  }
}

