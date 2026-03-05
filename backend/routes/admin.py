import json
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from backend.models import db, User, Company, Student, JobPosition, Application
from backend.routes.utils import admin_required
from backend.cache import redis_client
from backend.tasks.reports import generate_monthly_report

admin_bp = Blueprint("admin", __name__)

@admin_bp.route("/dashboard", methods=["GET"])
@jwt_required()
@admin_required
def admin_dashboard():
    cache_key = "admin_dashboard"

    cached = redis_client.get(cache_key)
    if cached:
        return jsonify(json.loads(cached))

    data = {
        "total_students": Student.query.count(),
        "total_companies": Company.query.count(),
        "total_jobs": JobPosition.query.count(),
        "total_applications": Application.query.count()
    }

    redis_client.setex(cache_key, 120, json.dumps(data))
    return jsonify(data)


@admin_bp.route("/company/<int:company_id>/approve", methods=["PUT"])
@jwt_required()
@admin_required
def approve_company(company_id):
    company = Company.query.get_or_404(company_id)
    if company.approval_status != "Pending":
        return jsonify({"message": "Only pending companies can be approved"}), 400
    company.approval_status = "Approved"
    redis_client.delete("admin_dashboard")
    for key in redis_client.scan_iter("companies_search:*"):
        redis_client.delete(key)    
    db.session.commit()
    return jsonify({"message": "Company approved"})

@admin_bp.route("/jobs", methods=["GET"])
@jwt_required()
@admin_required
def get_all_jobs():
    jobs = JobPosition.query.all()
    return jsonify([
        {
            "id": j.id,
            "title": j.title,
            "status": j.status,
            "company_id": j.company_id
        }
        for j in jobs
    ])


@admin_bp.route("/company/<int:company_id>/reject", methods=["PUT"])
@jwt_required()
@admin_required
def reject_company(company_id):
    company = Company.query.get_or_404(company_id)
    if company.approval_status != "Pending":
        return jsonify({"message": "Only pending companies can be rejected"}), 400
    company.approval_status = "Rejected"
    for job in company.jobs:
        job.status = "Closed"
        for app in job.applications:
            app.status = "Rejected"
    redis_client.delete("admin_dashboard")
    for key in redis_client.scan_iter("companies_search:*"):
        redis_client.delete(key)    
    db.session.commit()
    return jsonify({"message": "Company rejected"})


@admin_bp.route("/job/<int:job_id>/approve", methods=["PUT"])
@jwt_required()
@admin_required
def approve_job(job_id):
    job = JobPosition.query.get_or_404(job_id)
    job.status = "Approved"
    redis_client.delete("approved_jobs")
    redis_client.delete("admin_dashboard")
    db.session.commit()
    return jsonify({"message": "Job approved"})

@admin_bp.route("/job/<int:job_id>/reject", methods=["PUT"])
@jwt_required()
@admin_required
def reject_job(job_id):
    job = JobPosition.query.get_or_404(job_id)
    job.status = "Rejected"
    redis_client.delete("approved_jobs")
    redis_client.delete("admin_dashboard")
    db.session.commit()
    return jsonify({"message": "Job rejected"})

@admin_bp.route("/students", methods=["GET"])
@jwt_required()
@admin_required
def get_students():
    query = request.args.get("q", "").strip().lower()
    cache_key = f"students_search:{query}"

    cached = redis_client.get(cache_key)
    if cached:
        return jsonify(json.loads(cached))

    students = Student.query.join(User).filter(
        User.email.contains(query)
    ).all()

    data = [
        {
            "id": s.user.id,
            "email": s.user.email,
            "cgpa": s.cgpa,
            "skills": s.skills,
            "is_active": s.user.is_active
        }
        for s in students
    ]

    redis_client.setex(cache_key, 300, json.dumps(data))
    return jsonify(data)

@admin_bp.route("/companies", methods=["GET"])
@jwt_required()
@admin_required
def get_companies():
    query = request.args.get("q", "").strip().lower()
    cache_key = f"companies_search:{query}"

    cached = redis_client.get(cache_key)
    if cached:
        return jsonify(json.loads(cached))

    companies = Company.query.filter(
        db.or_(
            Company.name.contains(query),
            Company.industry.contains(query)
        )
    ).all()

    data = [
        {
            "id": c.id,
            "user_id": c.user.id,
            "name": c.name,
            "industry": c.industry,
            "status": c.approval_status,
            "is_active": c.user.is_active
        }
        for c in companies
    ]

    redis_client.setex(cache_key, 300, json.dumps(data))
    return jsonify(data)


@admin_bp.route("/company/<int:company_id>/deactivate", methods=["PUT"])
@jwt_required()
@admin_required
def deactivate_company(company_id):
    company = Company.query.get_or_404(company_id)

    if company.approval_status != "Approved":
        return jsonify({"message": "Only approved companies can be deactivated"}), 400

    company.user.is_active = False
    redis_client.delete("admin_dashboard")
    for key in redis_client.scan_iter("companies_search:*"):
        redis_client.delete(key)
    db.session.commit()

    return jsonify({"message": "Company deactivated"})

@admin_bp.route("/company/<int:company_id>/activate", methods=["PUT"])
@jwt_required()
@admin_required
def activate_company(company_id):
    company = Company.query.get_or_404(company_id)

    if company.approval_status != "Approved":
        return jsonify({"message": "Only approved companies can be activated"}), 400

    company.user.is_active = True
    redis_client.delete("admin_dashboard")
    for key in redis_client.scan_iter("companies_search:*"):
        redis_client.delete(key)
    db.session.commit()

    return jsonify({"message": "Company activated"})


@admin_bp.route("/user/<int:user_id>/deactivate", methods=["PUT"])
@jwt_required()
@admin_required
def deactivate_user(user_id):
    user = User.query.get_or_404(user_id)
    user.is_active = False
    redis_client.delete("admin_dashboard")
    for key in redis_client.scan_iter("students_search:*"):
        redis_client.delete(key)
    db.session.commit()
    return jsonify({"message": "User deactivated"})

@admin_bp.route("/user/<int:user_id>/activate", methods=["PUT"])
@jwt_required()
@admin_required
def activate_user(user_id):
    user = User.query.get_or_404(user_id)
    user.is_active = True
    redis_client.delete("admin_dashboard")
    for key in redis_client.scan_iter("students_search:*"):
        redis_client.delete(key)
    db.session.commit()
    return jsonify({"message": "User activated"})

@admin_bp.route("/applications", methods=["GET"])
@jwt_required()
@admin_required
def get_all_applications():
    cache_key = "admin_applications"

    cached = redis_client.get(cache_key)
    if cached:
        return jsonify(json.loads(cached))

    apps = Application.query.all()

    data = [
        {
            "application_id": a.id,
            "student_id": a.student_id,
            "job_id": a.job_id,
            "status": a.status
        }
        for a in apps
    ]

    redis_client.setex(cache_key, 180, json.dumps(data))
    return jsonify(data)

@admin_bp.route("/report", methods=["POST"])
@jwt_required()
@admin_required
def generate_report():
    generate_monthly_report.delay()
    return jsonify({"message": "Report generation started"})