from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.models import db, Student, JobPosition, Application, Placement
from backend.routes.utils import student_required

student_bp = Blueprint("student", __name__)

@student_bp.route("/jobs", methods=["GET"])
@jwt_required()
@student_required
def view_jobs():
    jobs = JobPosition.query.filter_by(status="Approved").all()

    return jsonify([
        {
            "job_id": j.id,
            "title": j.title,
            "company_id": j.company_id,
            "salary": j.salary,
            "skills_required": j.skills_required
        }
        for j in jobs
    ])


@student_bp.route("/jobs/<int:job_id>/apply", methods=["POST"])
@jwt_required()
@student_required
def apply_job(job_id):
    user_id = int(get_jwt_identity())
    student = Student.query.filter_by(user_id=user_id).first()

    job = JobPosition.query.get_or_404(job_id)

    if job.status != "Approved":
        return jsonify({"message": "Job not open for applications"}), 403

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
            "applied_on": a.applied_on
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
            "company_id": p.company_id,
            "position": p.position,
            "salary": p.salary,
            "joining_date": p.joining_date
        }
        for p in placements
    ])


