const routes = [
  { path: "/", component: Login },
  { path: "/register/student", component: StudentRegister },
  { path: "/register/company", component: CompanyRegister },
  { path: "/admin", component: AdminDashboard },
  { path: "/admin/companies", component: AdminCompanies },
  { path: "/admin/students", component: AdminStudents },
  { path: "/admin/drives", component: AdminDrives },
  { path: "/company", component: CompanyDashboard },
  { path: "/student", component: StudentDashboard },
  { path: "/student/profile", component: StudentProfile}
]

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const role = localStorage.getItem("role")

  // Allow public routes
  if (to.path === "/" ||
      to.path.startsWith("/register")) {
    return next()
  }

  if (!role) {
    return next("/")
  }

  if (to.path.startsWith("/admin") && role !== "admin")
    return next("/")

  if (to.path.startsWith("/company") && role !== "company")
    return next("/")

  if (to.path.startsWith("/student") && role !== "student")
    return next("/")

  next()
})