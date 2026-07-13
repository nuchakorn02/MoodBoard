# Mood of the Major

## AI Development Requirement & Software Design Document

## Project Information

**Project Name:** Mood of the Major

**Project Type**
Community Mood Sharing Platform

**Purpose**

Mood of the Major is a web application that allows university students to anonymously share their current emotional state with other students in the same faculty or major.

The objective is to create a safe environment where students can express how they feel and discover that they are not alone.

The application must focus on:

* Anonymous communication
* Clean and modern interface
* Secure authentication
* Responsive design
* Good software architecture
* High performance
* Scalability

---

# Technology Stack

## Frontend

* React
* Vite
* React Router
* Axios
* Tailwind CSS
* shadcn/ui
* Framer Motion
* React Hook Form
* Zod
* Zustand

## Backend

* Node.js
* Express.js
* JWT Authentication
* bcrypt
* express-validator
* CORS
* dotenv
* Morgan

## Database

MongoDB

ODM

Mongoose

Deployment

Frontend
Vercel

Backend
Render

Database
MongoDB Atlas

---

# User Roles

## Student

Can

* Register
* Login
* Create Mood
* Edit Own Mood
* Delete Own Mood
* View Feed
* Search Mood
* Filter Mood
* View Statistics
* Update Profile

Cannot

* Delete other users
* Access Admin Panel

---

## Admin

Can do everything

Additional Permissions

* Delete any Mood
* Moderate inappropriate posts
* View Dashboard
* View Reports
* Manage Users

---

# Authentication

Register using

* Student ID
* Faculty
* Major
* Year
* Password

Password

Must be hashed using bcrypt.

Login

Return

Access Token

Optional

Refresh Token

JWT middleware protects all private routes.

---

# Mood Model

Each Mood contains

* id
* moodType
* title
* description
* emoji
* backgroundColor
* faculty
* major
* createdBy
* anonymousName
* createdAt
* updatedAt

Mood Types

* Happy
* Sad
* Angry
* Excited
* Tired
* Stressed
* Lonely
* Confused
* Motivated
* Relaxed

---

# CRUD Features

Create Mood

User writes

* Mood Type
* Emoji
* Title
* Description

Read Mood

Display feed

Newest first

Update Mood

Only owner

Delete Mood

Only owner

Admin can delete every post.

---

# Anonymous System

Never display

* Student ID
* Username
* Email
* Password

Display only

Faculty

Major

Year

Anonymous Avatar

Example

Anonymous Tiger

Anonymous Owl

Anonymous Fox

Anonymous Whale

Randomly generated.

---

# Search

Search by

Keyword

Mood Type

Faculty

Major

Date

Year

Sorting

Newest

Oldest

Most Popular

---

# Pagination

Backend

?page=

?limit=

Frontend

Previous

Next

Page Number

---

# Statistics

Dashboard

Display

Total Posts

Happy %

Sad %

Stress %

Faculty Ranking

Most Active Faculty

Mood Trend

Charts

Bar Chart

Pie Chart

Line Chart

---

# Admin Dashboard

Features

Delete Post

Search Users

View Statistics

View Reports

Manage Mood Categories

---

# Validation

Frontend

React Hook Form

Zod

Backend

express-validator

Validate

Student ID

Password

Mood

No Empty Data

No Invalid Input

---

# Security

bcrypt

JWT

Helmet

Rate Limit

CORS

Environment Variables

Input Sanitization

Mongo Injection Protection

XSS Protection

---

# API Structure

Auth

POST /api/auth/register

POST /api/auth/login

POST /api/auth/logout

GET /api/auth/me

Mood

GET /api/moods

GET /api/moods/:id

POST /api/moods

PUT /api/moods/:id

DELETE /api/moods/:id

Admin

GET /api/admin/users

DELETE /api/admin/moods/:id

Statistics

GET /api/statistics

---

# Folder Structure

Frontend

src/

components/

pages/

layouts/

hooks/

services/

store/

context/

utils/

types/

assets/

Backend

src/

controllers/

routes/

middleware/

models/

services/

config/

utils/

validators/

database/

---

# UI Design

Theme

Minimal

Calm

Modern

Rounded Components

Soft Shadows

Smooth Animation

Dark Mode

Light Mode

Responsive

Desktop

Tablet

Mobile

---

# Bonus Features

Daily Mood Calendar

Faculty Heat Map

Animated Background

Live Mood Counter

Dark Mode

Profile Page

Notification Toast

Infinite Scroll

Bookmark Mood

Reaction System

Comment System

Trending Mood

Mood Timeline

---

# Performance

Lazy Loading

Code Splitting

Memoization

Pagination

Optimized Images

Reusable Components

Clean Architecture

DRY Principle

---

# Documentation

Provide

README.md

API Documentation

Postman Collection

Environment Variables Guide

Installation Guide

Deployment Guide

---

# Success Criteria

The application should

* Follow clean architecture.
* Be fully responsive.
* Use React + Express + MongoDB.
* Implement secure JWT authentication.
* Support CRUD operations.
* Implement Role-Based Access Control.
* Provide search and filtering.
* Deliver a modern and polished user experience.
* Be production-ready and suitable as a software engineering portfolio project.
