from flask import Blueprint, request, jsonify, current_app, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.models import db, Student, JobPosition, Application, Placement
from backend.routes.utils import student_required
from backend.tasks.exports import export_applications_csv
from backend.cache import redis_client
from werkzeug.utils import secure_filename
import json
import os


student_bp = Blueprint("student", __name__)

@student_bp.route("/profile", methods=["GET"])
@jwt_required()
@student_required
def get_profile():
    user_id = int(get_jwt_identity())
    student = Student.query.filter_by(user_id=user_id).first()

    return jsonify({
        "education": student.education,
        "skills": student.skills,
        "cgpa": student.cgpa,
        "resume": student.resume
    })


@student_bp.route("/profile", methods=["PUT"])
@jwt_required()
@student_required
def update_profile():
    user_id = int(get_jwt_identity())
    student = Student.query.filter_by(user_id=user_id).first()

    # Get form fields (NOT request.json anymore)
    education = request.form.get("education")
    skills = request.form.get("skills")
    cgpa_value = request.form.get("cgpa")

    if education:
        student.education = education

    if skills:
        student.skills = skills

    if cgpa_value not in [None, ""]:
        student.cgpa = float(cgpa_value)

    # Handle Resume Upload
    if "resume" in request.files:
        file = request.files["resume"]

        if file.filename != "":
            filename = secure_filename(file.filename)

            upload_folder = os.path.join(os.getcwd(), "uploads")
            os.makedirs(upload_folder, exist_ok=True)

            file_path = os.path.join(upload_folder, filename)
            file.save(file_path)

            student.resume = filename

    db.session.commit()

    return jsonify({"message": "Profile updated successfully"})


@student_bp.route("/resume/<filename>", methods=["GET"])
def download_resume(filename):
    upload_folder = os.path.join(os.getcwd(), "uploads")
    return send_from_directory(upload_folder, filename)


@student_bp.route("/jobs", methods=["GET"])
@jwt_required()
@student_required
def view_jobs():
    cache_key = "approved_jobs"

    cached = redis_client.get(cache_key)
    if cached:
        return jsonify(json.loads(cached))

    jobs = JobPosition.query.filter_by(status="Approved").all()

    data = [
        {
            "job_id": j.id,
            "title": j.title,
            "company_id": j.company_id,
            "salary": j.salary,
            "skills_required": j.skills_required
        }
        for j in jobs
    ]

    redis_client.setex(cache_key, 300, json.dumps(data))  # 5 min TTL
    return jsonify(data)


@student_bp.route("/jobs/<int:job_id>/apply", methods=["POST"])
@jwt_required()
@student_required
def apply_job(job_id):
    user_id = int(get_jwt_identity())
    student = Student.query.filter_by(user_id=user_id).first()

    job = JobPosition.query.get_or_404(job_id)

    if job.status != "Approved":
        return jsonify({"message": "Job not open for applications"}), 403
    
    if job.min_cgpa and (student.cgpa is None or student.cgpa < job.min_cgpa):
        return jsonify({"message": "You are not eligible (CGPA too low)"}), 403

    existing = Application.query.filter_by(
        student_id=student.id,
        job_id=job.id
    ).first()

    if existing:
        return jsonify({"message": "Already applied to this job"}), 400

    application = Application(
        student_id=student.id,
        job_id=job.id,
        status="Applied"
    )

    db.session.add(application)
    db.session.commit()

    return jsonify({"message": "Application submitted successfully"}), 201


@student_bp.route("/applications", methods=["GET"])
@jwt_required()
@student_required
def view_applications():
    user_id = int(get_jwt_identity())
    student = Student.query.filter_by(user_id=user_id).first()

    applications = Application.query.filter_by(student_id=student.id).all()

    return jsonify([
        {
            "application_id": a.id,
            "job_id": a.job_id,
            "status": a.status,
            "applied_on": a.applied_on,
            "interview_date": a.interview_date,
            "interview_location": a.interview_location,
            "feedback": a.feedback,
            "placement_id": a.placement.id if a.placement else None
        }
        for a in applications
    ])


@student_bp.route("/placements", methods=["GET"])
@jwt_required()
@student_required
def placement_history():
    user_id = int(get_jwt_identity())
    student = Student.query.filter_by(user_id=user_id).first()

    placements = Placement.query.filter_by(student_id=student.id).all()

    return jsonify([
        {
            "placement_id": p.id,
            "company_id": p.company_id,
            "position": p.position,
            "salary": p.salary,
            "joining_date": p.joining_date
        }
        for p in placements
    ])



@student_bp.route("/export", methods=["POST"])
@jwt_required()
@student_required
def export_applications():
    user_id = int(get_jwt_identity())
    student = Student.query.filter_by(user_id=user_id).first()

    export_applications_csv.delay(student.id)

    return jsonify({"message": "Export started. You will be notified once done."})


