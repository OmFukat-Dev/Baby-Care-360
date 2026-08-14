from app import create_app
from models import db, User


def test_register_and_login_success():
    app = create_app()
    with app.app_context():
        db.session.remove()
        db.drop_all()
        db.create_all()

    with app.test_client() as client:
        register_response = client.post(
            '/api/v1/auth/register',
            json={
                'email': 'testuser@example.com',
                'first_name': 'Test',
                'last_name': 'User',
                'password': 'Password123',
            },
        )

        assert register_response.status_code == 201, register_response.get_data(as_text=True)
        assert register_response.get_json()['success'] is True

        login_response = client.post(
            '/api/v1/auth/login',
            json={'email': 'testuser@example.com', 'password': 'Password123'},
        )

        assert login_response.status_code == 200, login_response.get_data(as_text=True)
        assert login_response.get_json()['success'] is True
