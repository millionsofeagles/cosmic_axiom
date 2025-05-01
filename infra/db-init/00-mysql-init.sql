-- Ensure microservices_user uses mysql_native_password
ALTER USER 'microservice_user'@'%' IDENTIFIED WITH mysql_native_password BY 'microservice_pass';
FLUSH PRIVILEGES;

-- Create one database per microservice
CREATE DATABASE IF NOT EXISTS astral;
CREATE DATABASE IF NOT EXISTS library;

GRANT ALL PRIVILEGES ON *.* TO 'microservice_user'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
