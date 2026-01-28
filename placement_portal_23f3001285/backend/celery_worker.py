from backend.celery_app import celery
from backend.app import create_app

def init_celery():
    app = create_app()

    celery.conf.update(app.config)

    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

    celery.Task = ContextTask

init_celery()
