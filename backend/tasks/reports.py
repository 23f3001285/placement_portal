from backend.celery_app import celery
from backend.models import JobPosition, Application, Placement
from datetime import datetime
import os

@celery.task
def generate_monthly_report():
    total_jobs = JobPosition.query.count()
    total_apps = Application.query.count()
    total_placements = Placement.query.count()

    report = f"""
    <h1>Monthly Placement Report</h1>
    <p>Total Jobs: {total_jobs}</p>
    <p>Total Applications: {total_apps}</p>
    <p>Total Placements: {total_placements}</p>
    <p>Generated on: {datetime.now()}</p>
    """

    BASE_DIR = os.getcwd()
    REPORT_PATH = os.path.join(BASE_DIR, "reports")

    os.makedirs(REPORT_PATH, exist_ok=True)

    file_path = os.path.join(REPORT_PATH, "monthly_report.html")

    with open(file_path, "w") as f:
        f.write(report)

    print("Report saved at:", file_path)
    print("Monthly report generated and sent to admin")
