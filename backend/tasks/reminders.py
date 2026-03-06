import json
from backend.celery_app import celery
from backend.models import Application
from backend.cache import redis_client
from datetime import datetime, timedelta

@celery.task
def send_daily_reminders():

    now = datetime.utcnow()
    next_24_hours = now + timedelta(hours=24)

    upcoming = Application.query.filter(
        Application.status == "Interview",
        Application.interview_date != None,
        Application.interview_date >= now,
        Application.interview_date <= next_24_hours
    ).all()

    reminders = []

    for app in upcoming:
        reminders.append({
            "student_id": app.student_id,
            "interview_date": app.interview_date.isoformat(),
            "message": f"Interview scheduled at {app.interview_date} ({app.interview_location})"
        })

    redis_client.set("daily_reminders", json.dumps(reminders), ex=86400)

    print(f"{len(reminders)} reminders stored in cache")