-- ============================================================
--  EmpNexus Database Schema
--  SQLite-compatible DDL (used via sql.js in-browser)
--  NOTE: net_salary is a plain REAL column, computed on INSERT/UPDATE
--        in the seed data to avoid GENERATED ALWAYS AS syntax issues.
-- ============================================================

CREATE TABLE IF NOT EXISTS Department (
  dept_id   INTEGER PRIMARY KEY AUTOINCREMENT,
  dept_name TEXT    NOT NULL UNIQUE,
  location  TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS Role (
  role_id   INTEGER PRIMARY KEY AUTOINCREMENT,
  role_name TEXT    NOT NULL,
  title     TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS Employee (
  emp_id    INTEGER PRIMARY KEY AUTOINCREMENT,
  name      TEXT    NOT NULL,
  address   TEXT,
  gender    TEXT    CHECK(gender IN ('Male','Female','Other')),
  email     TEXT    UNIQUE NOT NULL,
  phone     TEXT,
  dob       TEXT,
  dept_id   INTEGER REFERENCES Department(dept_id),
  salary    REAL    NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS Login (
  login_id  INTEGER PRIMARY KEY AUTOINCREMENT,
  username  TEXT    NOT NULL UNIQUE,
  password  TEXT    NOT NULL,
  emp_id    INTEGER REFERENCES Employee(emp_id),
  role_id   INTEGER REFERENCES Role(role_id)
);

-- net_salary stored as plain column (basic + allowances - deductions)
CREATE TABLE IF NOT EXISTS Payroll (
  payroll_id    INTEGER PRIMARY KEY AUTOINCREMENT,
  emp_id        INTEGER REFERENCES Employee(emp_id),
  month         TEXT    NOT NULL,
  basic_salary  REAL    NOT NULL,
  allowances    REAL    NOT NULL DEFAULT 0,
  deductions    REAL    NOT NULL DEFAULT 0,
  net_salary    REAL    NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS Attendance (
  att_id    INTEGER PRIMARY KEY AUTOINCREMENT,
  emp_id    INTEGER REFERENCES Employee(emp_id),
  date      TEXT    NOT NULL,
  status    TEXT    NOT NULL CHECK(status IN ('Present','Absent','Leave','Holiday'))
);

CREATE TABLE IF NOT EXISTS Leave (
  leave_id    INTEGER PRIMARY KEY AUTOINCREMENT,
  emp_id      INTEGER REFERENCES Employee(emp_id),
  start_date  TEXT    NOT NULL,
  end_date    TEXT    NOT NULL,
  leave_type  TEXT    NOT NULL CHECK(leave_type IN ('Sick','Casual','Earned','Maternity','Unpaid')),
  reason      TEXT,
  status      TEXT    NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending','Approved','Rejected'))
);

CREATE TABLE IF NOT EXISTS Project (
  project_id  INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  start_date  TEXT    NOT NULL,
  end_date    TEXT,
  status      TEXT    NOT NULL DEFAULT 'Active' CHECK(status IN ('Active','Completed','On Hold'))
);

CREATE TABLE IF NOT EXISTS Employee_Project (
  emp_id      INTEGER REFERENCES Employee(emp_id),
  project_id  INTEGER REFERENCES Project(project_id),
  assigned_on TEXT    NOT NULL,
  role        TEXT    NOT NULL,
  PRIMARY KEY (emp_id, project_id)
);
