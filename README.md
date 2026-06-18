# 🏥 Schedula

A healthcare appointment scheduling backend built with **NestJS**, **PostgreSQL**, and **TypeORM**.

## Features

### Authentication & Authorization

* JWT Authentication
* Role-Based Access Control
* Doctor & Patient Roles

### Doctor Management

* Doctor Onboarding
* Doctor Profile Management
* Doctor Discovery APIs
* Search & Filter Doctors

### Patient Management

* Patient Onboarding

### Availability Management

* Recurring Availability
* Custom Availability
* Stream Scheduling
* Wave Scheduling

### Slot Generation

* Dynamic Slot Generation

### Appointment Management

* Book Appointment
* View Appointments
* Cancel Appointment
* Reschedule Appointment

### Advanced Scheduling

* Stream Scheduling Support
* Wave Scheduling Support
* Capacity Validation
* Token Assignment
* Slot Suggestions
* 30-Minute Cancel/Reschedule Cutoff

---

## Tech Stack

* NestJS
* TypeScript
* PostgreSQL
* TypeORM
* JWT
* Passport.js

---

## Installation

```bash
git clone https://github.com/shivapal13/schedula-shiva.git

cd schedula-shiva

npm install

npm run start:dev
```

---

## Environment Variables

```env
DATABASE_URL=
JWT_SECRET=
PORT=3000
```


## Live Server

https://schedula-shiva.onrender.com

---

## API Modules

### Auth

* Signup
* Login

### Doctor

* Create Profile
* Get Profile
* Update Profile
* Doctor Discovery

### Patient

* Create Profile

### Availability

* Create Availability
* Get Availability
* Update Availability
* Delete Availability
* Custom Availability

### Slots

* Generate Slots

### Appointment

* Book Appointment
* Get My Appointments
* View Doctor Appointments
* Cancel Appointment
* Reschedule Appointment

---

## Repository

GitHub Repository:

https://github.com/shivapal13/schedula-shiva

---

## Author

**Shiva Pal**
