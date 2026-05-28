import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const API = "http://localhost:3001";

function App() {
  // ================= STATES =================
  const [page, setPage] = useState("login");
  const [section, setSection] = useState("home");

  const [admin, setAdmin] = useState({
    username: "",
    password: "", // ✅ FIXED: was missing, caused uncontrolled input warning
  });

  // ================= REGISTER =================
  const [studentForm, setStudentForm] = useState({
    firstname: "",
    lastname: "",
    gender: "",
    fathername: "",
    mothername: "",
    telephone: "",
    district: "",
    province: "",
    country: "",
    email: "",
    trade: "",
    former_school: "",
  });

  // ================= ATTENDANCE =================
  const [attendanceForm, setAttendanceForm] = useState({
    teacher_name: "",
    teacher_trade: "",
    email: "",
  });

  // ================= TEACHER REQUEST =================
  const [teacherRequest, setTeacherRequest] = useState({
    teacher_name: "",
    trade: "",
    email: "",
    reason: "",
  });

  // ================= DASHBOARD =================
  const [table, setTable] = useState("register");
  const [data, setData] = useState({});
  const [editItem, setEditItem] = useState(null);
  const [addItem, setAddItem] = useState(null);

  // ================= HOME SLIDESHOW =================
  const studentUniformSlides = [
    "/stad.png.png",
    "/students.png.png",
    "/food.png.png",
    "/tito.png.png",
    "/ignace.png",
    "/NESA.png",
    "/Screenshot 2026-05-23 144919.png",
    "/Screenshot 2026-05-23 144931.png",
    "/Screenshot 2026-05-23 145113.png",
    "/Screenshot 2026-05-23 145125.png",
    "/Screenshot 2026-05-23 145323.png",
    "/Screenshot 2026-05-23 145334.png",
    "/Screenshot 2026-05-23 145442.png",
    "/Screenshot 2026-05-23 145510.png",
    "/Screenshot 2026-05-23 145522.png",
    "/Screenshot 2026-05-24 071042.png",
    "/Screenshot 2026-05-24 071154.png",
  ];

  // ================= DEPARTMENTS =================
  const departments = [
    {
      key: "ict_department",
      title: "ICT Department",
      description:
        "Focuses on programming, networking, software development, and practical lab skills for real-world problem solving and learn some basic skills for computer hard ware maintainancies.",
      image: "/ictdepartment.png.png.png",
    },
    {
      key: "construction_building",
      title: "construction and building department",
      description:
        "Construction studies involve learning many subjects that help students understand how buildings and infrastructure are planned, designed, and built. These subjects include building technology, which teaches about construction materials and methods; technical drawing, which helps students create building plans; mathematics, used for measurements and calculations; physics, which explains forces and structures; and engineering basics for designing safe buildings.",
      image: "/construction.png.png.png",
    },
    {
      key: "religion_department",
      title: "religiondepartment",
      description:
        "Religion is a system of beliefs, values, and practices that helps people understand life, the universe, and their relationship with a higher power or spiritual reality. Different religions teach moral principles, guide behavior, and provide ways for people to worship and connect with others in their communities.",
      image: "/religion.png.png.png",
    },
    {
      key: "olevel_department",
      title: "olevel department",
      description:
        "IN musamvu_tss we have another department called olevel or lowersecondary that contain s1,s2 and s3 every student can register in class based on school year program for promote students to next year.",
      image: "/olevel.png.png.png",
    },
    {
      key: "ict_accounting_department",
      title: "ICT and accounting department",
      description:
        "Here students learn well about accounting with information technology(ICT) and also students use ICT for quickbook software for run transactions suge100and other computer skills,literacy and so on.",
      image: "/ict accounting.pmg.png.png",
    },
    {
      key: "business_entrepreneurship",
      title: "business and interpreneur department",
      description:
        "A business is an economic activity where people produce or sell goods and services with the aim of making profit. Entrepreneurship is the process of identifying opportunities, starting a business, and managing it while taking risks to earn profit.",
      image: "/accounting business.png.png.png",
    },
  ];

  // ================= PATTERNERS =================
  const patterners = [
    {
      key: "industry_partner",
      title: "Industry Partners",
      description:
        "Our partners provide real internship opportunities, equipment support, and mentorship for hands-on learning.",
      image: "https://picsum.photos/seed/industry/500/350",
    },
    {
      key: "government_partners",
      title: "Government & Education Support",
      description:
        "We collaborate with public institutions to strengthen curriculum alignment and student development programs.",
      image: "https://picsum.photos/seed/government/500/350",
    },
    {
      key: "community_orgs",
      title: "Community Organizations",
      description:
        "Community-based partners help with outreach, student support, and practical training exposure.",
      image: "https://picsum.photos/seed/community/500/350",
    },
    {
      key: "international_programs",
      title: "International Programs",
      description:
        "Some programs connect students with global opportunities, exchange learning, and advanced technical exposure.",
      image: "https://picsum.photos/seed/international/500/350",
    },
  ];

  const columns = {
    register: [
      "id",
      "firstname",
      "lastname",
      "gender",
      "fathername",
      "mothername",
      "telephone",
      "district",
      "province",
      "country",
      "email",
      "trade",
      "former_school",
    ],

    students: [
      "id",
      "firstname",
      "lastname",
      "gender",
      "email",
      "telephone",
      "district",
      "province",
      "country",
    ],

    teachers: [
      "id",
      "fullname",
      "gender",
      "email",
      "telephone",
      "trade",
      "district",
      "province",
      "country",
    ],

    parents: [
      "id",
      "fullname",
      "email",
      "telephone",
      "district",
      "province",
      "country",
    ],

    workers: [
      "id",
      "fullname",
      "email",
      "telephone",
      "job",
      "district",
      "province",
      "country",
    ],

    teacher_attendance: [
      "id",
      "date",
      "teacher_name",
      "teacher_trade",
      "email",
      "start_job",
      "end_job",
    ],

    teacher_request: [
      "id",
      "teacher_name",
      "trade",
      "email",
      "reason",
      "created_at",
    ],
  };

  const cols = columns[table] || [];

  // ================= LOAD DATA =================
  const loadData = async () => {
    try {
      const res = await fetch(`${API}/admin-dashboard`);
      const result = await res.json();

      if (result.success) {
        setData(result.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ================= LOGIN =================
  const login = async () => {
    try {
      const res = await fetch(`${API}/admin-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(admin),
      });

      const result = await res.json();

      if (result.success) {
        alert("Login Success");
        setPage("dashboard");
        loadData();
      } else {
        alert(result.message);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // ================= REGISTER =================
  const registerStudent = async () => {
    try {
      const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(studentForm),
      });

      const result = await res.json();

      if (result.success) {
        alert("Student Registered Successfully");

        setStudentForm({
          firstname: "",
          lastname: "",
          gender: "",
          fathername: "",
          mothername: "",
          telephone: "",
          district: "",
          province: "",
          country: "",
          email: "",
          trade: "",
          former_school: "",
        });

        loadData();
      } else {
        alert(result.error);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // ================= ADD NEW =================
  const addNew = async () => {
    try {
      const res = await fetch(`${API}/${table}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addItem),
      });

      const result = await res.json();

      if (result.success) {
        alert("Added Successfully");
        setAddItem(null);
        loadData();
      } else {
        alert(result.error);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // ================= ATTENDANCE START =================
  const startAttendance = async () => {
    try {
      const res = await fetch(`${API}/teacher-attendance/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(attendanceForm),
      });

      const result = await res.json();

      if (result.success) {
        alert("Attendance Started");
        loadData();
      } else {
        alert(result.error);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // ================= ATTENDANCE END =================
  const endAttendance = async () => {
    try {
      const res = await fetch(`${API}/teacher-attendance/end`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(attendanceForm),
      });

      const result = await res.json();

      if (result.success) {
        alert("Attendance Ended");
        loadData();
      } else {
        alert(result.error);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // ================= TEACHER REQUEST =================
  const submitTeacherRequest = async () => {
    try {
      const res = await fetch(`${API}/teacher-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(teacherRequest),
      });

      const result = await res.json();

      if (result.success) {
        alert("Request Submitted Successfully");

        setTeacherRequest({
          teacher_name: "",
          trade: "",
          email: "",
          reason: "",
        });

        loadData();
      } else {
        alert(result.error);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // ================= APPROVE STUDENT =================
  const approveRegister = async (id) => {
    try {
      const res = await fetch(`${API}/register/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const result = await res.json();

      if (result.success) {
        alert("Approved Successfully");
        loadData();
      } else {
        alert(result.error || result.message || "Approve failed");
      }
    } catch (err) {
      console.log(err);
    }
  };

  // ================= DELETE =================
  const remove = async (id) => {
    try {
      const res = await fetch(`${API}/${table}/${id}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (result.success) {
        alert("Deleted Successfully");
        loadData();
      }
    } catch (err) {
      console.log(err);
    }
  };

  // ================= UPDATE =================
  const update = async () => {
    try {
      const res = await fetch(`${API}/${table}/${editItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editItem),
      });

      const result = await res.json();

      if (result.success) {
        alert("Updated Successfully");
        setEditItem(null);
        loadData();
      }
    } catch (err) {
      console.log(err);
    }
  };

  // ================= LOGIN PAGE =================
  if (page === "login") {
    return (
      <div style={{ background: "#002244", minHeight: "100vh" }}>
        <nav
          className="navbar navbar-expand-lg navbar-dark px-4"
          style={{ background: "#001933" }}
        >
          <div className="container-fluid">
            <h3 className="text-white fw-bold">MUSAMVU TSS</h3>

            <div className="d-flex flex-wrap gap-2">
              <button
                className="btn btn-light"
                onClick={() => setSection("home")}
              >
                Home
              </button>

              <button
                className="btn btn-light"
                onClick={() => setSection("about")}
              >
                About
              </button>

              <button
                className="btn btn-light"
                onClick={() => setSection("contact")}
              >
                Contact
              </button>

              <button
                className="btn btn-light"
                onClick={() => setSection("patterners")}
              >
                Patterners
              </button>

              <button
                className="btn btn-light"
                onClick={() => setSection("departments")}
              >
                Departments
              </button>

              <button
                className="btn btn-light"
                onClick={() => setSection("register")}
              >
                Register
              </button>

              <button
                className="btn btn-light"
                onClick={() => setSection("teacher_attendance")}
              >
                Attendance
              </button>

              <button
                className="btn btn-light"
                onClick={() => setSection("teacher_request")}
              >
                Request
              </button>

              <button
                className="btn btn-warning"
                onClick={() => setSection("admin")}
              >
                Admin
              </button>
            </div>
          </div>
        </nav>

        {/* HOME */}
        {section === "home" && (
          <div className="container py-5">
            <div className="card p-5">
              <h1 className="text-primary">MUSAMVU TECHNICAL SECONDARY SCHOOL</h1>

              <div className="text-center my-4">
                <img
                  src="/methjodist.png"
                  alt="FREE_METHODIST_LIBRE_OF_RWANDA"
                  style={{ maxWidth: 320, width: "100%", height: "auto" }}
                />
                <div className="mt-2 fw-bold">
                  <p>FREE_METHODIST_LIBRE_OF_RWANDA</p><br />
                  Actes 20:28
                </div>
              </div>

              {/* STUDENT UNIFORM SLIDESHOW (2s) */}
              <div className="mt-4">
                <h4 className="mb-3 text-primary">
                  musamvu students perfotm sports in stadium in ngoma
                </h4>

                <div
                  id="uniformCarousel"
                  className="carousel slide"
                  data-bs-ride="carousel"
                  data-bs-interval="2000"
                >
                  <div className="carousel-inner">
                    {studentUniformSlides.map((src, idx) => (
                      <div
                        key={src}
                        className={`carousel-item ${idx === 0 ? "active" : ""}`}
                      >
                        <img
                          src={src}
                          alt="Student in uniform"
                          className="d-block w-100"
                          style={{ height: 320, objectFit: "cover" }}
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    className="carousel-control-prev"
                    type="button"
                    data-bs-target="#uniformCarousel"
                    data-bs-slide="prev"
                  >
                    <span
                      className="carousel-control-prev-icon"
                      aria-hidden="true"
                    ></span>
                    <span className="visually-hidden">Previous</span>
                  </button>

                  <button
                    className="carousel-control-next"
                    type="button"
                    data-bs-target="#uniformCarousel"
                    data-bs-slide="next"
                  >
                    <span
                      className="carousel-control-next-icon"
                      aria-hidden="true"
                    ></span>
                    <span className="visually-hidden">Next</span>
                  </button>
                </div>
              </div>

              <p className="mt-4">
                Welcome to Musamvu Technical Secondary School where locate in
                ngoma,kibungo.
              </p>

              <div className="mt-4">
                <h4 className="mb-2">Quick Links</h4>
                <div className="d-flex flex-wrap gap-2">
                  <button
                    className="btn btn-primary"
                    onClick={() => setSection("departments")}
                  >
                    Explore Departments
                  </button>
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => setSection("patterners")}
                  >
                    Our Patterners
                  </button>
                  <button
                    className="btn btn-success"
                    onClick={() => setSection("register")}
                  >
                    Student Registration
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABOUT */}
        {section === "about" && (
          <div className="container py-5">
            <div className="card p-5">
              <h1>ABOUT MUSAMVU TSS</h1>

              <p>
                Musamvu Technical Secondary School is a modern technical school found in
                Rwanda. The school provides quality education, technology skills,
                professional training and discipline.

                Musamvu Technical Secondary School is a modern technical school found in
                Rwanda. The school provides quality education, technology skills,
              </p>

              <h3>Mission</h3>
              <p>
                To provide practical and professional education for all students.
                To deliver high-quality, hands-on technical training and moral education that empowers students with market-relevant skills, fosters a culture of creativity, and prepares them to confidently meet global industrial demands.
              </p>

              <h3>Vision</h3>
              <p>
                To become the leading technical secondary school in Rwanda.
                your are going to buil musamvu tsssyetem provides words as 3 paragraphs to about page
                Musamvu Technical Secondary School (TSS) is a premier technical institution dedicated to equipping students with practical, market-relevant vocational skills. Founded on the principles of academic excellence and hands-on training, the school offers a dynamic learning environment where theoretical knowledge meets real-world application. Through modern workshops and a robust curriculum, Musamvu TSS empowers young minds to become innovative problem-solvers and skilled professionals who are ready to meet the demands of the rapidly evolving industrial landscape.
                At the core of Musamvu TSS is a commitment to fostering creativity, discipline, and entrepreneurship among its student body. The school boasts a team of highly qualified instructors who guide learners through specialized technical tracks, ensuring that every graduate possesses both the technical competence and the soft skills required for the modern workforce. By emphasizing community-based projects and ethical professional conduct, the institution shapes well-rounded citizens who are prepared to drive economic growth and technological advancement in their communities.
                Looking toward the future, Musamvu TSS strives to expand its strategic partnerships with leading industries to provide students with valuable internship and job placement opportunities. The campus continuously upgrades its infrastructure and technologies to stay ahead of global educational trends and vocational standards. By choosing Musamvu TSS, students embark on a transformative educational journey that turns passions into sustainable careers and builds a solid foundation for lifelong personal and professional success.
              </p>
            </div>
          </div>
        )}

        {/* CONTACT */}
        {section === "contact" && (
          <div className="container py-5">
            <div className="card p-5">
              <h1>CONTACT INFORMATION</h1>

              <p>Email: musamvu@gmail.com</p>
              <p>Email: ignaceitangishatse9@gmail.com</p>
              <p>Phone: +250785870082</p>
              <p>District: Ngoma</p>
              <p>Country: Rwanda</p>
            </div>
          </div>
        )}

        {/* PATTERNERS */}
        {section === "patterners" && (
          <div className="container py-5">
            <div className="card p-4">
              <h2 className="mb-3">Patterners</h2>
              <p className="mb-4">
                Here are our partners who support training, mentorship, and student
                development.
              </p>

              <div className="row g-3">
                {patterners.map((p) => (
                  <div key={p.key} className="col-md-6 col-lg-4">
                    <div className="card h-100">
                      <img
                        src={p.image}
                        alt={p.title}
                        style={{ height: 180, objectFit: "cover" }}
                      />
                      <div className="card-body">
                        <h5 className="card-title">{p.title}</h5>
                        <p className="card-text">{p.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DEPARTMENTS */}
        {section === "departments" && (
          <div className="container py-5">
            <div className="card p-4">
              <h2 className="mb-3">Departments</h2>
              <p className="mb-4">
                Each department focuses on practical skills, technical training, and career
                readiness.
              </p>

              <div className="mb-4">
                <div
                  id="departmentsCarousel"
                  className="carousel slide"
                  data-bs-ride="carousel"
                  data-bs-interval="2000"
                >
                  <div className="carousel-inner">
                    {departments.map((d, idx) => (
                      <div
                        key={d.key}
                        className={`carousel-item ${idx === 0 ? "active" : ""}`}
                      >
                        <img
                          src={d.image}
                          className="d-block w-100"
                          alt={d.title}
                          style={{ height: 320, objectFit: "cover" }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="row g-3">
                {departments.map((d) => (
                  <div key={d.key} className="col-md-6 col-lg-4">
                    <div className="card h-100">
                      <img
                        src={d.image}
                        alt={d.title}
                        style={{ height: 180, objectFit: "cover" }}
                      />
                      <div className="card-body">
                        <h5 className="card-title">{d.title}</h5>
                        <p className="card-text">{d.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <button
                  className="btn btn-primary"
                  onClick={() => setSection("register")}
                >
                  Register as a Student
                </button>
              </div>
            </div>
          </div>
        )}

        {/* REGISTER */}
        {section === "register" && (
          <div className="container py-5">
            <div className="card p-4">
              <h2>Student Registration</h2>

              {Object.keys(studentForm).map((field) =>
                field === "gender" ? (
                  <select
                    key={field}
                    className="form-control mb-3"
                    value={studentForm[field]}
                    onChange={(e) =>
                      setStudentForm({
                        ...studentForm,
                        [field]: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Gender</option>
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                ) : (
                  <input
                    key={field}
                    className="form-control mb-3"
                    placeholder={field}
                    value={studentForm[field]}
                    onChange={(e) =>
                      setStudentForm({
                        ...studentForm,
                        [field]: e.target.value,
                      })
                    }
                  />
                )
              )}

              <button className="btn btn-primary" onClick={registerStudent}>
                Register Student
              </button>
            </div>
          </div>
        )}

        {/* ATTENDANCE */}
        {section === "teacher_attendance" && (
          <div className="container py-5">
            <div className="card p-4">
              <h2>Teacher Attendance</h2>

              <input
                className="form-control mb-3"
                placeholder="Teacher Name"
                value={attendanceForm.teacher_name}
                onChange={(e) =>
                  setAttendanceForm({
                    ...attendanceForm,
                    teacher_name: e.target.value,
                  })
                }
              />

              <input
                className="form-control mb-3"
                placeholder="Teacher Trade"
                value={attendanceForm.teacher_trade}
                onChange={(e) =>
                  setAttendanceForm({
                    ...attendanceForm,
                    teacher_trade: e.target.value,
                  })
                }
              />

              <input
                className="form-control mb-3"
                placeholder="Email"
                value={attendanceForm.email}
                onChange={(e) =>
                  setAttendanceForm({
                    ...attendanceForm,
                    email: e.target.value,
                  })
                }
              />

              <button
                className="btn btn-success me-2"
                onClick={startAttendance}
              >
                Start Job
              </button>

              <button className="btn btn-danger" onClick={endAttendance}>
                End Job
              </button>
            </div>
          </div>
        )}

        {/* TEACHER REQUEST */}
        {section === "teacher_request" && (
          <div className="container py-5">
            <div className="card p-4">
              <h2>Teacher Request</h2>

              <input
                type="text"
                className="form-control mb-3"
                placeholder="Teacher Name"
                value={teacherRequest.teacher_name}
                onChange={(e) =>
                  setTeacherRequest({
                    ...teacherRequest,
                    teacher_name: e.target.value,
                  })
                }
              />

              <input
                type="text"
                className="form-control mb-3"
                placeholder="Trade"
                value={teacherRequest.trade}
                onChange={(e) =>
                  setTeacherRequest({
                    ...teacherRequest,
                    trade: e.target.value,
                  })
                }
              />

              <input
                type="email"
                className="form-control mb-3"
                placeholder="Email"
                value={teacherRequest.email}
                onChange={(e) =>
                  setTeacherRequest({
                    ...teacherRequest,
                    email: e.target.value,
                  })
                }
              />

              <textarea
                className="form-control mb-3"
                placeholder="Reason"
                rows="4"
                value={teacherRequest.reason}
                onChange={(e) =>
                  setTeacherRequest({
                    ...teacherRequest,
                    reason: e.target.value,
                  })
                }
              />

              <button
                className="btn btn-primary w-100"
                onClick={submitTeacherRequest}
              >
                Submit Request
              </button>
            </div>
          </div>
        )}

        {/* ADMIN */}
        {section === "admin" && (
          <div className="container py-5">
            <div className="card p-4 col-md-4 mx-auto">
              <h2 className="mb-4">Admin Login</h2>

              <input
                type="text"
                className="form-control mb-3"
                placeholder="Username"
                value={admin.username}
                onChange={(e) =>
                  setAdmin({
                    ...admin,
                    username: e.target.value,
                  })
                }
              />

              <input
                type="password"
                className="form-control mb-3"
                placeholder="Password"
                value={admin.password}
                onChange={(e) =>
                  setAdmin({
                    ...admin,
                    password: e.target.value,
                  })
                }
              />

              <button className="btn btn-primary" onClick={login}>
                Login
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ================= DASHBOARD =================
  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>MUSAMVU ADMIN DASHBOARD</h3>

        <button className="btn btn-danger" onClick={() => setPage("login")}>
          Logout
        </button>
      </div>

      <div className="card p-3">
        <div className="row mb-3">
          <div className="col-md-6">
            <select
              className="form-control"
              value={table}
              onChange={(e) => setTable(e.target.value)}
            >
              {Object.keys(columns).map((tb) => (
                <option key={tb} value={tb}>
                  {tb}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6 text-end">
            {table !== "teacher_attendance" && table !== "teacher_request" && (
              <button
                className="btn btn-success"
                onClick={() => {
                  const obj = {};
                  cols.forEach((c) => {
                    if (c !== "id") obj[c] = "";
                  });
                  setAddItem(obj);
                }}
              >
                Add New
              </button>
            )}
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-bordered table-sm">
            <thead className="table-dark">
              <tr>
                {cols.map((c) => (
                  <th key={c}>{c}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {(data[table] || []).map((item) => (
                <tr key={item.id}>
                  {cols.map((c) => (
                    <td key={c}>{item[c]}</td>
                  ))}

                  <td>
                    {table !== "teacher_attendance" &&
                      table !== "teacher_request" && (
                        <>
                          {table === "register" && (
                            <button
                              className="btn btn-success btn-sm me-2"
                              onClick={() => approveRegister(item.id)}
                            >
                              Approve
                            </button>
                          )}

                          <button
                            className="btn btn-warning btn-sm me-2"
                            onClick={() => setEditItem(item)}
                          >
                            Edit
                          </button>

                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => remove(item.id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT MODAL */}
      {editItem && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "#00000088" }}
        >
          <div className="bg-white p-4 rounded col-md-4">
            <h3>Edit Data</h3>

            {cols.map((c) =>
              c !== "id" ? (
                <input
                  key={c}
                  className="form-control mb-2"
                  placeholder={c}
                  value={editItem[c] || ""}
                  onChange={(e) =>
                    setEditItem({
                      ...editItem,
                      [c]: e.target.value,
                    })
                  }
                />
              ) : null
            )}

            <button className="btn btn-success me-2" onClick={update}>
              Update
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => setEditItem(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ADD MODAL */}
      {addItem && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "#00000088" }}
        >
          <div className="bg-white p-4 rounded col-md-4">
            <h3>Add New Data</h3>

            {cols.map((c) =>
              c !== "id" ? (
                <input
                  key={c}
                  className="form-control mb-2"
                  placeholder={c}
                  value={addItem[c] || ""}
                  onChange={(e) =>
                    setAddItem({
                      ...addItem,
                      [c]: e.target.value,
                    })
                  }
                />
              ) : null
            )}

            <button className="btn btn-primary me-2" onClick={addNew}>
              Save
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => setAddItem(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;