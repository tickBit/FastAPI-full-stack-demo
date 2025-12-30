# React (+ TypeScript + Vite) + Python FastAPI full-stack demo

- only admins can upload pictures and give & edit picture's description
- admin users can only be created with backend's create_admin.py (`python create_admin.py`) script
- admins are logged in after création from the frontend like other users

- normal users can be registered and logged in from frontend
- normal users (and admins) can give a star review to a picture, the review is saved pressing the disk icon

- if no user is logged in, the user can view currently uploaded pictures and their descriptions and reviews

## How to run

1 Database

- you'll need a PostgreSQL database to run this called `show_db`
- create .env into backend folder and put there:
  - DATABASE_URL=`postgresql+psycopg2://POSTGRES_USER:PASSWORD@localhost:5432/show_db`
    - POSTGRES_USER is *your* postgres username, PASSWORD is *your* PostgreSQL password
  - SECRET_KEY=Super_secret_key_for_my_yours_and_everyone_elses_eyes_only
  
2 Backend

- `cd backend`
- create virtual environment and activate it, then
- install requirement from requirements.txt
- run `uvicorn main:app`

3 Frontend

- `cd frontend`
- `npm install`
- `npm run dev`

## Pictures

Admin user view:

![PicShow_Admin_user_view](https://github.com/user-attachments/assets/37d423c8-b823-40b2-9801-792daf86baed)


Logged in user's (normal) view:

![PicShow_Logged_in_users_view](https://github.com/user-attachments/assets/393cf61c-8140-4d98-a96f-29bf550780ce)


Main view, when logged out:

![PicShow_MainView_logged_out](https://github.com/user-attachments/assets/0debdad9-a874-4619-90fd-aac134a14795)
