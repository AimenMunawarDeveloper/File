# MERN Stack Internship Training Project

This project aims to provide hands-on training in developing a web application using the MERN stack (MongoDB, Express.js, React, Node.js). It covers various aspects of web development including backend, frontend, database management, user authentication, and deployment.

## Table of Contents

1. Creating a MongoDB Atlas Account
2. Initializing a Node.js Project
3. Initializing a React Project with Vite or Create-React-App
4. Creating a Tenants Table in MongoDB and Adding an Initial Tenant
5. Implementing a User Registration Page
6. Implementing a User Login Page
7. Developing a File Management System like Google Drive
8. Personal Storage Page
9. Dashboard Page
10. Edit Profile Popup
11. Deployment Steps
12. Postman Documentation

## 1. Creating a MongoDB Atlas Account

- Option 1: Creating a MongoDB Atlas Account
- Option 2: Installing MongoDB Compass Locally and Using It

## 2. Initializing a Node.js Project

Create a Node.js project with the following components:
- Express for routing
- Mongoose (ORM)
- Joi for validations

## 3. Initializing a React Project with Vite or Create-React-App

Start a simple React project with the following:
- Tailwind CSS
- Redux Thunk

## 4. Creating a Tenants Table in MongoDB and Adding an Initial Tenant

Develop a Multi-Tenant Structure:
- Create a table named tenants.
- Add a tenant to the tenants table.
- Use this tenant as a foreign key in all other tables.
- Create schema for users and files table as well.

## 5. Implementing a User Registration Page

Implementing a User Registration Page:
- Users should be able to register with their name, email, and password.
- Passwords should be stored in an encrypted form (use Bcrypt or another library).
- Use the first tenantId in this table.

## 6. Implementing a User Login Page

Implementing a User Login Page:
- Users should be able to login with their email and password.
- Make sure to include tenantId in the WHERE clause of all queries.
- Upon successful login, generate a token containing userId and tenantId.

## 7. Developing a File Management System like Google Drive

The system will comprise two pages accessible after logging in:
- Personal Storage
- Dashboard

Note: AWS S3 will be utilized for storage.

## 8. Personal Storage Page

- Include an "Add File" button that opens a pop-up.
- In the pop-up, allow users to specify the file name and attach the file.
- Uploaded files should be listed similarly to Google Drive (without considering folder structure).
- Allow users to edit or delete files directly from the listing.

## 9. Dashboard Page

- Display a graph showing the number of files uploaded by the user each month.
- Below the graph, show a list of the user's recent files (latest 10).

## 10. Edit Profile Popup

- Allow users to update their profile details such as name, contact information, and bio within the popup.

## 11. Deployment Steps

- Deploy the backend on an EC2 instance.
- Deploy the frontend on an EC2 instance.
- Configure NGINX to handle both backend and frontend.
- Set up a domain name for the application.

## 12. Postman Documentation

- Each API Endpoint must be documented on Postman.
