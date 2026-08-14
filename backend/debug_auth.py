from app import create_app
from models import db, User

app = create_app()
with app.app_context():
    try:
        user = User.query.filter_by(email='abc@example.com').first()
        print('existing_user', user)
        if not user:
            user = User(email='abc@example.com', first_name='A', last_name='B')
            user.set_password('Password123')
            db.session.add(user)
            db.session.commit()
            print('created', user.to_dict())
        print('check_password', user.check_password('Password123'))
    except Exception as e:
        import traceback
        traceback.print_exc()
        db.session.rollback()
