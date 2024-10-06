# SoundScape Music Player

Đồ án ngành cho ngành công nghệ thông tin được viết bởi Nguyễn Hà Bảo Khang dưới sự hướng dẫn của giảng viên Phan Trần Minh Khuê. Website nghe nhạc trực tiếp mô phỏng website Soundcloud

* **Công cụ:**
    - Backend: Django, REST API
    - Frontend: React
    - Database: MySQL

* **Notes:**
    - Lệnh tạo scheme SQL: 
        ##
            CREATE SCHEMA musicdb DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    - Lệnh chạy ReactJS: 
        ##
            npm start
    - Lệnh chạy Django: 
        ##
            python manage.py runserver
    - Lệnh chạy Django với Daphne: 
        ##
            daphne -p 8000 musicplayerapi.asgi:application
    - Lệnh chạy Redis server (cmd): 
        ##
            redis-server

