import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

/* ===================== DATABASE ===================== */
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "musamvu_db",
  waitForConnections: true,
  connectionLimit: 10,
});

/* ===================== TEST DATABASE ===================== */
(async function testDB() {
  try {
    const conn = await pool.getConnection();
    console.log("🟢 Database connected successfully");
    conn.release();
  } catch (err) {
    console.log("🔴 Database connection failed:", err.message);
  }
})();

/* ===================== EMAIL CONFIG ===================== */
// ⚠️  IMPORTANT: Gmail no longer allows plain passwords.
//     You MUST use a Gmail App Password:
//     1. Go to https://myaccount.google.com/security
//     2. Enable 2-Step Verification
//     3. Go to "App passwords" and generate one for "Mail"
//     4. Put that 16-character password in SMTP_PASS (or replace below)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "ignaceitangishatse9@gmail.com";
const SMTP_USER   = process.env.SMTP_USER   || "ignaceitangishatse9@gmail.com";
const SMTP_PASS   = process.env.SMTP_PASS   || "YOUR_APP_PASSWORD_HERE"; // <-- replace!

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // SSL
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

transporter.verify((error) => {
  if (error) {
    console.log("❌ Email configuration error:", error.message);
    console.log("   → Make sure SMTP_PASS is a Gmail App Password, not your account password.");
  } else {
    console.log("📧 Email server is ready → mails will be sent to", ADMIN_EMAIL);
  }
});

/* ===================== SEND EMAIL HELPER ===================== */
async function sendEmail({ to, subject, text }) {
  try {
    const info = await transporter.sendMail({
      from: `"Musamvu TSS" <${SMTP_USER}>`,
      to,
      subject,
      text,
    });
    console.log("✅ Email sent to:", to, "| Subject:", subject, "| ID:", info.messageId);
    return true;
  } catch (err) {
    console.error("❌ Email error — to:", to, "| Subject:", subject);
    console.error("   Reason:", err.message);
    return false;
  }
}

/* ===================== TABLES ===================== */
const TABLES = {
  register: {
    tableName: "students",
    columns: [
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
  },

  students: {
    tableName: "students",
    columns: [
      "firstname",
      "lastname",
      "gender",
      "email",
      "telephone",
      "district",
      "province",
      "country",
    ],
  },

  teachers: {
    tableName: "teachers",
    columns: [
      "fullname",
      "gender",
      "email",
      "telephone",
      "trade",
      "district",
      "province",
      "country",
    ],
  },

  parents: {
    tableName: "parents",
    columns: ["fullname", "email", "telephone", "district", "province", "country"],
  },

  workers: {
    tableName: "workers",
    columns: ["fullname", "email", "telephone", "job", "district", "province", "country"],
  },
};

const ATTENDANCE_TABLE = "teacher_attendance";
const REQUEST_TABLE    = "teacher_request";

/* ===================== HELPERS ===================== */
const insertSQL = (table, cols) =>
  `INSERT INTO ${table} (${cols.join(",")}) VALUES (${cols.map(() => "?").join(",")})`;

const updateSQL = (table, cols) =>
  `UPDATE ${table} SET ${cols.map((c) => `${c}=?`).join(",")} WHERE id=?`;

const selectSQL = (table) => `SELECT * FROM ${table} ORDER BY id DESC`;
const deleteSQL = (table) => `DELETE FROM ${table} WHERE id=?`;

/* ===================== ADMIN LOGIN ===================== */
app.post("/admin-login", (req, res) => {
  const { username, password } = req.body;

  if (
    username === (process.env.ADMIN_USER || "admin") &&
    password === (process.env.ADMIN_PASS || "admin123")
  ) {
    return res.json({ success: true });
  }

  return res.status(401).json({ success: false, message: "Invalid login" });
});

/* ===================== DASHBOARD ===================== */
app.get("/admin-dashboard", async (req, res) => {
  try {
    const data = {};

    for (const [key, meta] of Object.entries(TABLES)) {
      const [rows] = await pool.query(selectSQL(meta.tableName));
      data[key] = rows;
    }

    const [attendance] = await pool.query(
      `SELECT * FROM ${ATTENDANCE_TABLE} ORDER BY id DESC`
    );
    const [requests] = await pool.query(
      `SELECT * FROM ${REQUEST_TABLE} ORDER BY id DESC`
    );

    data.teacher_attendance = attendance;
    data.teacher_request    = requests;

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ===================== REGISTER STUDENT ===================== */
app.post("/register", async (req, res) => {
  try {
    const cols   = TABLES.register.columns;
    const values = cols.map((c) => req.body[c]);

    const [result] = await pool.query(insertSQL(TABLES.register.tableName, cols), values);

    const { firstname, lastname, email, trade } = req.body;

    if (email) {
      const studentName = `${firstname || ""} ${lastname || ""}`.trim();
      await sendEmail({
        to: email,
        subject: "✅ Musamvu TSS Registration Received",
        text:
          `Dear ${studentName || "Student"},\r\n\r\n` +
          `Thank you for registering at Musamvu TSS.\r\n\r\n` +
          `We have received your registration. Our administration will review it and send you an approval message when it is approved.\r\n\r\n` +
          `Trade: ${trade || "N/A"}\r\n\r\n` +
          `Best regards,\r\nMusamvu TSS Administration`,
      });
    } else {
      console.warn("⚠️  Student registration has no email — skipping confirmation email");
    }

    res.json({ success: true, insertedId: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ===================== APPROVE STUDENT ===================== */
app.post("/register/approve", async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, error: "Missing id" });
    }

    const [rows] = await pool.query(`SELECT * FROM students WHERE id=?`, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: "Student not found" });
    }

    const student = rows[0];

    await pool.query(
      `UPDATE students SET status='approved', approved_at=NOW() WHERE id=?`,
      [id]
    );

    if (student.email) {
      const studentName = `${student.firstname || ""} ${student.lastname || ""}`.trim();
      await sendEmail({
        to: student.email,
        subject: "✅ Your Registration Has Been Approved - Musamvu TSS",
        text:
          `Dear ${studentName},\r\n\r\n` +
          `Congratulations! 🎉\r\n\r\n` +
          `Your registration at Musamvu TSS has been APPROVED by the administration.\r\n\r\n` +
          `Full Name : ${student.firstname || ""} ${student.lastname || ""}\r\n` +
          `Trade     : ${student.trade || "N/A"}\r\n` +
          `Approved  : ${new Date().toLocaleString()}\r\n\r\n` +
          `You may now proceed with the next steps for enrollment.\r\n\r\n` +
          `Best regards,\r\nMusamvu TSS Administration`,
      });
    } else {
      console.warn("⚠️  Student has no email — skipping approval email");
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ===================== GENERIC CREATE ===================== */
app.post("/:table", async (req, res) => {
  try {
    const meta = TABLES[req.params.table];

    if (!meta) {
      return res.status(400).json({ success: false, message: "Invalid table" });
    }

    const values    = meta.columns.map((c) => req.body[c]);
    const [result]  = await pool.query(insertSQL(meta.tableName, meta.columns), values);

    res.json({ success: true, insertedId: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ===================== UPDATE ===================== */
app.put("/:table/:id", async (req, res) => {
  try {
    const meta = TABLES[req.params.table];

    if (!meta) {
      return res.status(400).json({ success: false, message: "Invalid table" });
    }

    const values = [...meta.columns.map((c) => req.body[c]), req.params.id];
    const [result] = await pool.query(updateSQL(meta.tableName, meta.columns), values);

    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ===================== DELETE ===================== */
app.delete("/:table/:id", async (req, res) => {
  try {
    const meta = TABLES[req.params.table];

    if (!meta) {
      return res.status(400).json({ success: false, message: "Invalid table" });
    }

    const [result] = await pool.query(deleteSQL(meta.tableName), [req.params.id]);

    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ===================== TEACHER ATTENDANCE — START ===================== */
app.post("/teacher-attendance/start", async (req, res) => {
  try {
    const { teacher_name = "", teacher_trade = "", email = "" } = req.body;

    // Validate
    const missing = [];
    if (!teacher_name.trim())  missing.push("teacher_name");
    if (!teacher_trade.trim()) missing.push("teacher_trade");
    if (!email.trim())         missing.push("email");

    if (missing.length) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        missing,
      });
    }

    // Insert record
    const sql = `
      INSERT INTO ${ATTENDANCE_TABLE}
        (date, teacher_name, teacher_trade, email, start_job, end_job)
      VALUES (CURDATE(), ?, ?, ?, NOW(), NULL)
    `;
    const [result] = await pool.query(sql, [
      teacher_name.trim(),
      teacher_trade.trim(),
      email.trim(),
    ]);

    console.log(`📋 Attendance STARTED — ID: ${result.insertId} | Teacher: ${teacher_name}`);

    // ✅ Send notification email to admin
    const emailSent = await sendEmail({
      to: ADMIN_EMAIL,
      subject: "⏱️ Teacher Attendance STARTED — Musamvu TSS",
      text:
        `A teacher has started their attendance.\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `  Teacher : ${teacher_name.trim()}\n` +
        `  Trade   : ${teacher_trade.trim()}\n` +
        `  Email   : ${email.trim()}\n` +
        `  Time    : ${new Date().toLocaleString()}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `Musamvu TSS System`,
    });

    return res.json({
      success: true,
      insertedId: result.insertId,
      emailSent,
    });
  } catch (err) {
    console.error("❌ Attendance start error:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/* ===================== TEACHER ATTENDANCE — END ===================== */
app.post("/teacher-attendance/end", async (req, res) => {
  try {
    const { teacher_name = "", teacher_trade = "", email = "" } = req.body;

    // Validate
    const missing = [];
    if (!teacher_name.trim())  missing.push("teacher_name");
    if (!teacher_trade.trim()) missing.push("teacher_trade");
    if (!email.trim())         missing.push("email");

    if (missing.length) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        missing,
      });
    }

    // Update record
    const sql = `
      UPDATE ${ATTENDANCE_TABLE}
      SET end_job = NOW()
      WHERE teacher_name  = ?
        AND teacher_trade = ?
        AND email         = ?
        AND end_job IS NULL
      ORDER BY id DESC
      LIMIT 1
    `;
    const [result] = await pool.query(sql, [
      teacher_name.trim(),
      teacher_trade.trim(),
      email.trim(),
    ]);

    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        error:
          "No active attendance found to end. " +
          "Check teacher_name, teacher_trade, email, and that attendance was started today.",
      });
    }

    console.log(`📋 Attendance ENDED — Teacher: ${teacher_name}`);

    // ✅ Send notification email to admin
    const emailSent = await sendEmail({
      to: ADMIN_EMAIL,
      subject: "✅ Teacher Attendance ENDED — Musamvu TSS",
      text:
        `A teacher has ended their attendance.\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `  Teacher : ${teacher_name.trim()}\n` +
        `  Trade   : ${teacher_trade.trim()}\n` +
        `  Email   : ${email.trim()}\n` +
        `  Time    : ${new Date().toLocaleString()}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `Musamvu TSS System`,
    });

    return res.json({
      success: true,
      affectedRows: result.affectedRows,
      emailSent,
    });
  } catch (err) {
    console.error("❌ Attendance end error:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/* ===================== TEACHER REQUEST ===================== */
app.post("/teacher-request", async (req, res) => {
  try {
    const {
      teacher_name = "",
      trade        = "",
      email        = "",
      reason       = "",
    } = req.body;

    console.log("📩 Incoming teacher-request:", req.body);

    // Validate
    const missing = [];
    if (!teacher_name.trim()) missing.push("teacher_name");
    if (!trade.trim())        missing.push("trade");
    if (!email.trim())        missing.push("email");
    if (!reason.trim())       missing.push("reason");

    if (missing.length) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        missing,
      });
    }

    // Insert record
    const sql = `
      INSERT INTO ${REQUEST_TABLE}
        (teacher_name, trade, email, reason, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `;
    const [result] = await pool.query(sql, [
      teacher_name.trim(),
      trade.trim(),
      email.trim(),
      reason.trim(),
    ]);

    console.log(`📋 Teacher request saved — ID: ${result.insertId} | Teacher: ${teacher_name}`);

    // ✅ Send notification email to admin
    const emailSent = await sendEmail({
      to: ADMIN_EMAIL,
      subject: "📝 New Teacher Request — Musamvu TSS",
      text:
        `A teacher has submitted a new request.\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `  Teacher : ${teacher_name.trim()}\n` +
        `  Trade   : ${trade.trim()}\n` +
        `  Email   : ${email.trim()}\n` +
        `  Reason  : ${reason.trim()}\n` +
        `  Time    : ${new Date().toLocaleString()}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `Musamvu TSS System`,
    });

    return res.status(200).json({
      success: true,
      message: "Request submitted successfully",
      insertedId: result.insertId,
      emailSent,
    });
  } catch (err) {
    console.error("❌ Teacher request error:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/* ===================== START SERVER ===================== */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});