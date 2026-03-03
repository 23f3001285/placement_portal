const StudentProfile = {
  template: `
    <div>

      <h4 class="mb-3">Edit Profile</h4>

      <div class="card shadow-sm p-4">

        <div v-if="message"
             class="alert alert-success">
          {{ message }}
        </div>

        <div class="mb-3">
          <label class="form-label">Education</label>
          <input v-model="education"
                 class="form-control">
        </div>

        <div class="mb-3">
          <label class="form-label">CGPA</label>
          <input v-model="cgpa"
                 type="number"
                 step="0.01"
                 class="form-control">
        </div>

        <div class="mb-3">
          <label class="form-label">Skills</label>
          <textarea v-model="skills"
                    class="form-control"></textarea>
        </div>

        <div class="mb-3">
          <label class="form-label">Resume</label>

          <input type="file"
                 class="form-control"
                 @change="handleFile">

          <div v-if="resumeName"
               class="mt-2 text-muted">
            Current Resume: {{ resumeName }}
          </div>
        </div>

        <button class="btn btn-primary"
                @click="updateProfile">
          Save Changes
        </button>

      </div>

    </div>
  `,
  data() {
    return {
      education: "",
      cgpa: "",
      skills: "",
      resumeFile: null,
      resumeName: "",
      message: ""
    }
  },
  async mounted() {
    const res = await axios.get("/student/profile")
    this.education = res.data.education
    this.cgpa = res.data.cgpa
    this.skills = res.data.skills
    this.resumeName = res.data.resume
  },
  methods: {

    handleFile(event) {
      this.resumeFile = event.target.files[0]
    },

    async updateProfile() {
      const formData = new FormData()
      formData.append("education", this.education)
      formData.append("cgpa", this.cgpa)
      formData.append("skills", this.skills)

      if (this.resumeFile) {
        formData.append("resume", this.resumeFile)
      }

      await axios.put("/student/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })

      this.message = "Profile updated successfully"
    }

  }
}