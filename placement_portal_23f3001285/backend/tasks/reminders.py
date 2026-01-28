from backend.celery_app import celery
from backend.models import Application
from datetime import datetime, timedelta

@celery.task
def send_daily_reminders():
    upcoming = Application.query.filter(
        Application.status == "Interview"
    ).all()

    for app in upcoming:
        print(f"Reminder sent to student {app.student_id} for interview")
