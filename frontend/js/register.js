console.log("REGISTER FILE LOADED")
const StudentRegister = {
  template: `
    <div class="container mt-5">
      <h3>Student Registration</h3>

      <input v-model="email" class="form-control mb-2" placeholder="Email">
      <input v-model="password" type="password" class="form-control mb-2" placeholder="Password">
      <input v-model="education" class="form-control mb-2" placeholder="Education">
      <input v-model="cgpa" class="form-control mb-2" placeholder="CGPA">
      <textarea v-model="skills" class="form-control mb-2" placeholder="Skills"></textarea>

      <button class="btn btn-success" @click="register">
        Register
      </button>

      <p class="mt-3">
        Already have an account?
        <router-link to="/">Login</router-link>
      </p>
    </div>
  `,
  data() {
    return {
      email: "",
      password: "",
      education: "",
      cgpa: "",
      skills: ""
    }
  },
  methods: {
    async register() {
      await axios.post("/auth/register/student", {
        email: this.email,
        password: this.password,
        education: this.education,
        cgpa: this.cgpa,
        skills: this.skills
      })
      alert("Student registered successfully")
      this.$router.push("/")
    }
  }
}

const CompanyRegister = {
  template: `
    <div class="container mt-5">
      <h3>Company Registration</h3>

      <input v-model="email" class="form-control mb-2" placeholder="Email">
      <input v-model="password" type="password" class="form-control mb-2" placeholder="Password">
      <input v-model="name" class="form-control mb-2" placeholder="Company Name">
      <input v-model="industry" class="form-control mb-2" placeholder="Industry">
      <input v-model="location" class="form-control mb-2" placeholder="Location">

      <button class="btn btn-success" @click="register">
        Register
      </button>

      <p class="mt-3">
        Already have an account?
        <router-link to="/">Login</router-link>
      </p>
    </div>
  `,
  data() {
    return {
      email: "",
      password: "",
      name: "",
      industry: "",
      location: ""
    }
  },
  methods: {
    async register() {
      await axios.post("/auth/register/company", {
        email: this.email,
        password: this.password,
        name: this.name,
        industry: this.industry,
        location: this.location
      })
      alert("Company registered. Await admin approval.")
      this.$router.push("/")
    }
  }
}