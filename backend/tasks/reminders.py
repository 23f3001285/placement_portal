from backend.celery_app import celery
from backend.models import Application
from datetime import datetime, timedelta

@celery.task
def send_daily_reminders():

    now = datetime.utcnow()
    next_24_hours = now + timedelta(hours=24)

    upcoming_interviews = Application.query.filter(
        Application.status == "Interview",
        Application.interview_date is not None,
        Application.interview_date >= now,
        Application.interview_date <= next_24_hours
    ).all()

    for app in upcoming_interviews:
        print(
            f"Reminder: Student {app.student_id} has interview "
            f"at {app.interview_date} "
            f"Location: {app.interview_location}"
        )

    print(f"{len(upcoming_interviews)} interview reminders processed.")