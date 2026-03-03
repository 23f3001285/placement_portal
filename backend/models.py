from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # admin, company, student
    is_active = db.Column(db.Boolean, default=True)
    company = db.relationship("Company", backref="user", uselist=False)
    student = db.relationship("Student", backref="user", uselist=False)


class Company(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    industry = db.Column(db.String(100))
    location = db.Column(db.String(100))
    approval_status = db.Column(db.String(20), default="Pending")
    jobs = db.relationship("JobPosition", backref="company", cascade="all, delete", lazy=True)


class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    education = db.Column(db.String(200))
    skills = db.Column(db.Text)
    cgpa = db.Column(db.Float)
    resume = db.Column(db.String(200))
    applications = db.relationship("Application", backref="student", lazy=True)


class JobPosition(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey("company.id"), nullable=False)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text)
    salary = db.Column(db.String(50))
    skills_required = db.Column(db.Text)
    min_cgpa = db.Column(db.Float, default=0.0)
    status = db.Column(db.String(20), default="Pending")  # Pending / Approved / Closed
    applications = db.relationship("Application", backref="job", lazy=True)
    experience_required = db.Column(db.String(100))
    benefits = db.Column(db.Text)


class Application(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("student.id"), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey("job_position.id"), nullable=False)
    status = db.Column(db.String(30), default="Applied")  # Applied / Shortlisted / Interview / Selected / Rejected
    interview_date = db.Column(db.DateTime, nullable=True)
    interview_location = db.Column(db.String(200), nullable=True)
    applied_on = db.Column(db.DateTime, default=datetime.utcnow)
    placement = db.relationship("Placement", backref="application", uselist=False)
    feedback = db.Column(db.Text)


class Placement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    application_id = db.Column(db.Integer, db.ForeignKey("application.id"), nullable=False)
    company_id = db.Column(db.Integer, db.ForeignKey("company.id"), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey("student.id"), nullable=False)
    position = db.Column(db.String(120))
    salary = db.Column(db.String(50))
    joining_date = db.Column(db.Date)
