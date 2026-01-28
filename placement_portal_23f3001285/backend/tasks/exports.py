from backend.celery_app import celery
from backend.models import Application
import csv

@celery.task
def export_applications_csv(student_id):
    apps = Application.query.filter_by(student_id=student_id).all()

    filename = f"applications_{student_id}.csv"

    with open(filename, "w", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(["Application ID", "Job ID", "Status", "Applied On"])

        for a in apps:
            writer.writerow([a.id, a.job_id, a.status, a.applied_on])

    print(f"CSV export completed for student {student_id}")
