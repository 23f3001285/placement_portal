from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.models import Placement, db, Company, JobPosition, Application, Student, User  
from backend.routes.utils import company_required
from backend.cache import redis_client
from datetime import date, datetime
from reportlab.pdfgen import canvas
from io import BytesIO
from flask import send_file

company_bp = Blueprint("company", __name__)

@company_bp.route("/dashboard", methods=["GET"])
@jwt_required()
@company_required
def company_dashboard():
    user_id = int(get_jwt_identity())

    company = Company.query.filter_by(user_id=user_id).first()

    if not company:
        return jsonify({"message": "Company not found"}), 404

    if not company.user.is_active:
        return jsonify({
            "message": "Company deactivated",
            "approval_status": "Deactivated"
        }), 403

    if company.approval_status != "Approved":
        return jsonify({
            "message": "Company not approved",
            "approval_status": company.approval_status
        }), 403

    jobs = JobPosition.query.filter_by(company_id=company.id).count()
    applications = Application.query.join(JobPosition).filter(
        JobPosition.company_id == company.id
    ).count()

    return jsonify({
        "company": company.name,
        "total_jobs": jobs,
        "total_applications": applications
    })


@company_bp.route("/jobs", methods=["POST"])
@jwt_required()
@company_required
def create_job():
    user_id = int(get_jwt_identity())
    company = Company.query.filter_by(user_id=user_id).first()

    if company.approval_status != "Approved":
        return jsonify({"message": "Company not approved"}), 403

    if not company.user.is_active:
        return jsonify({"message": "Company account deactivated"}), 403

    if company.approval_status != "Approved":
        return jsonify({"message": "Company not approved"}), 403

    data = request.json

    job = JobPosition(
        company_id=company.id,
        title=data["title"],
        description=data.get("description"),
        salary=data.get("salary"),
        skills_required=data.get("skills_required"),
        status="Pending"
    )

    db.session.add(job)
    db.session.commit()

    return jsonify({"message": "Job created and awaiting admin approval"}), 201


@company_bp.route("/jobs", methods=["GET"])
@jwt_required()
@company_required
def get_company_jobs():
    user_id = int(get_jwt_identity())
    company = Company.query.filter_by(user_id=user_id).first()

    if company.approval_status != "Approved":
        return jsonify({"message": "Company not approved"}), 403

    if not company.user.is_active:
        return jsonify({"message": "Company account deactivated"}), 403

    jobs = JobPosition.query.filter_by(company_id=company.id).all()

    return jsonify([
    {
        "id": j.id,
        "title": j.title,
        "description": j.description,
        "salary": j.salary,
        "skills_required": j.skills_required,
        "status": j.status
    }
    for j in jobs
])


@company_bp.route("/jobs/<int:job_id>/applications", methods=["GET"])
@jwt_required()
@company_required
def view_applications(job_id):
    user_id = int(get_jwt_identity())
    company = Company.query.filter_by(user_id=user_id).first()

    if company.approval_status != "Approved":
        return jsonify({"message": "Company not approved"}), 403

    if not company.user.is_active:
        return jsonify({"message": "Company account deactivated"}), 403

    job = JobPosition.query.get_or_404(job_id)
    if job.company_id != company.id:
        return jsonify({"message": "Unauthorized access"}), 403

    applications = Application.query.filter_by(job_id=job_id).all()

    return jsonify([
        {
            "application_id": a.id,
            "student_id": a.student_id,
            "status": a.status
        }
        for a in applications
    ])

@company_bp.route("/jobs/<int:job_id>/close", methods=["PUT"])
@jwt_required()
@company_required
def close_job(job_id):
    user_id = int(get_jwt_identity())
    company = Company.query.filter_by(user_id=user_id).first()

    if company.approval_status != "Approved":
        return jsonify({"message": "Company not approved"}), 403

    if not company.user.is_active:
        return jsonify({"message": "Company account deactivated"}), 403

    job = JobPosition.query.get_or_404(job_id)

    if job.company_id != company.id:
        return jsonify({"message": "Unauthorized"}), 403

    job.status = "Closed"
    db.session.commit()

    return jsonify({"message": "Job closed successfully"})


@company_bp.route("/applications/<int:application_id>/status", methods=["PUT"])
@jwt_required()
@company_required
def update_application_status(application_id):
    user_id = int(get_jwt_identity())
    company = Company.query.filter_by(user_id=user_id).first()

    if company.approval_status != "Approved":
        return jsonify({"message": "Company not approved"}), 403

    if not company.user.is_active:
        return jsonify({"message": "Company account deactivated"}), 403

    application = Application.query.get_or_404(application_id)
    job = JobPosition.query.get(application.job_id)

    if job.company_id != company.id:
        return jsonify({"message": "Unauthorized"}), 403

    data = request.json
    ALLOWED_TRANSITIONS = {
        "Applied": ["Shortlisted", "Rejected"],
        "Shortlisted": ["Interview", "Rejected"],
        "Interview": ["Selected", "Rejected"],
        "Selected": [],
        "Rejected": []
    }

    new_status = data.get("status")
    interview_date = data.get("interview_date")
    interview_location = data.get("interview_location")
    feedback = data.get("feedback")
    
    if application.status is None:
        application.status = "Applied"
 
    if new_status not in ALLOWED_TRANSITIONS.get(application.status, []):
        return jsonify({"message": "Invalid status transition"}), 400

    application.status = new_status

    # Interview scheduling
    if new_status == "Interview" and interview_date:
        application.interview_date = datetime.fromisoformat(interview_date)
        application.interview_location = interview_location

    # Feedback
    if feedback:
        application.feedback = feedback

    redis_client.delete("admin_applications")
    if new_status == "Selected":
        placement = Placement(
            application_id=application.id,
            company_id=job.company_id,
            student_id=application.student_id,
            position=job.title,
            salary=job.salary,
            joining_date=date.today()
        )
        db.session.add(placement)

    if new_status == "Interview":
        interview_date = data.get("interview_date")
        if interview_date:
            application.interview_date = datetime.fromisoformat(interview_date)    

    db.session.commit()
    return jsonify({"message": "Application status updated"})


@company_bp.route("/student/<int:student_id>", methods=["GET"])
@jwt_required()
@company_required
def view_student_profile(student_id):
    student = Student.query.get_or_404(student_id)

    return jsonify({
        "education": student.education,
        "skills": student.skills,
        "cgpa": student.cgpa,
        "resume": student.resume
    })

@company_bp.route("/offer/<int:placement_id>", methods=["GET"])
@jwt_required()
def generate_offer_letter(placement_id):

    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    placement = Placement.query.get_or_404(placement_id)

    # If student, ensure it's THEIR placement
    if user.role == "student":
        student = Student.query.filter_by(user_id=user_id).first()
        if placement.student_id != student.id:
            return jsonify({"message": "Unauthorized"}), 403

    # If company, ensure it belongs to them
    if user.role == "company":
        company = Company.query.filter_by(user_id=user_id).first()

        if company.approval_status != "Approved":
            return jsonify({"message": "Company not approved"}), 403

        if not company.user.is_active:
            return jsonify({"message": "Company account deactivated"}), 403
        if placement.company_id != company.id:
            return jsonify({"message": "Unauthorized"}), 403

    buffer = BytesIO()
    p = canvas.Canvas(buffer)

    p.drawString(100, 750, "Offer Letter")
    p.drawString(100, 770, "Congratulations!")
    p.drawString(100, 750, "We are pleased to offer you the following position:")
    p.drawString(100, 730, f"Position: {placement.position}")
    p.drawString(100, 710, f"Salary: {placement.salary}")
    p.drawString(100, 690, f"Joining Date: {placement.joining_date}")

    p.save()
    buffer.seek(0)

    return send_file(
        buffer,
        as_attachment=True,
        download_name="offer_letter.pdf",
        mimetype="application/pdf"
    )