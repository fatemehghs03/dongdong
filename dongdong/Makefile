run:
	python manage.py runserver 0.0.0.0:8000

migrate:
	python manage.py migrate

makemigrations:
	python manage.py makemigrations

createsuperuser:
	python manage.py createsuperuser
up:
	docker compose up --build -d

down:
	docker compose down

logs:
	docker compose logs -f

restart:
	docker compose down && docker compose up --build -d

check:
	black --check --line-length 120 --exclude '(migrations|static|build|dist|\.venv|manage\.py|asgi\.py|wsgi\.py|wsgi\.py)' .
