<div align="center">

# Pashu Pehchan

[![Pashu Pehchan](https://img.shields.io/badge/Pashu%20Pehchan-Livestock%20Management-2ecc71?style=for-the-badge&logo=github&logoColor=white)](https://github.com/wrestle-R/MoneyCouncil)

</div>

---

## Team Members

- 10170 - Rohan Benegal
- 10176 - Harsh Dalvi
- 10175 - Aditya Dabreo
- 10174 - Swayam Choudhari

## Technology Stack

<div align="center">

![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5.x-646cff?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Arduino](https://img.shields.io/badge/Arduino-IoT-00979D?style=for-the-badge&logo=arduino&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-Mobile-000020?style=for-the-badge&logo=expo&logoColor=white)

</div>

## Overview

**Pashu Pehchan** is a comprehensive tech-driven platform designed to revolutionize livestock management for farmers. It bridges the gap between traditional farming and modern technology by providing tools for digital identity, health monitoring, and marketplace integration.

This solution empowers farmers with real-time insights into their cattle's health via IoT sensors, manages vaccination schedules to prevent disease outbreaks, and offers a transparent marketplace for buying and selling livestock.

**Links:**

- 🌐 [Website](#) (Link placeholder - Add deployed URL)
- 📱 [Mobile App](#) (Link placeholder - Add store/download URL)

Repository structure (high level):

```
tech-fiesta/
├── app/             # React Native (Expo) Mobile App
├── backend/         # Node.js + Express API & Database Logic
├── frontend/        # React + Vite Web Dashboard
├── rest_backend/    # Django REST Framework (IoT Data Handling)
├── arduino code/    # IoT Sensor Scripts (ESP32/Arduino)
└── README.md        # <-- you are here
```

### Key Features

- 🐄 **Digital Animal Identification**: Secure digital profiles for livestock using RFID and facial recognition data.
- 🏥 **Live Health Monitoring**: Real-time tracking of vital signs like Heart Rate and Temperature using IoT sensors (MAX30102, DHT11).
- 💉 **Vaccination Management**: Automated calendars and reminders for upcoming vaccinations to ensure herd immunity.
- 🛒 **Livestock Marketplace**: A dedicated platform for farmers to buy and sell cattle with verified health records.
- 👨‍⚕️ **Vet Consultation**: Quick access to veterinary services and emergency alerts.
- 📢 **Government Schemes**: Information repository for latest government subsidies and welfare schemes for farmers.
- 📊 **Farm Analytics**: Visual dashboards for monitoring milk production, sales, and expenses.

## Quick Start

Follow these instructions to set up the project locally.

### Prerequisites

- Node.js v18+ and npm
- Python 3.8+ (for Django)
- MongoDB (local or Atlas)
- Firebase Project (for Authentication)

### 1. Backend (Node.js API)

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` consistent with `server.js` requirements:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
# Add other keys as required by your config
```

Start the server:

```bash
npm run dev
```

### 2. Frontend (Web Dashboard)

```bash
cd frontend
npm install
npm run dev
```

The web dashboard will be available at `http://localhost:5173`.

### 4. Mobile App (React-Native)

```bash
cd app
npm install
npx expo start
```

Scan the QR code with the Expo Go app on your phone.

## Project Details

- **`backend/`**: Handles core business logic, user authentication, and database interactions for the web portal.
- **`frontend/`**: The main user interface for farmers to log in, view dashboards, manage animals, and access the marketplace.
- **`app/`**: A cross-platform mobile application providing on-the-go access to key features like alerts and profile viewing.
- **`arduino code/`**: Contains firmware (`iotcode.ino`) for the hardware modules, reading from sensors like RFID (MFRC522), Heart Rate (MAX30105), and Temp/Humidity (DHT11)

</div>
