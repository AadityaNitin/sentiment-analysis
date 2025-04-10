# Full-Stack AI-Powered Sentiment Analysis Dashboard

This project is a full-stack web application that allows users to input text, analyze its sentiment using an AI model, and view a dashboard with historical analyses. It includes bonus features such as user authentication via Google OAuth and dynamic charting for data visualization.

## Overview

- **Frontend:**  
  Built with Next.js (React) and Tailwind CSS. The UI provides:
  - A text input box for entering text.
  - A sentiment analysis result section showing the sentiment label (Positive, Negative, or Neutral) and the confidence score.
  - A dashboard that displays the history of past analyses as a detailed list and as a dynamic line chart (using Chart.js via react-chartjs‑2).

- **Backend:**  
  Implemented using Next.js API routes. It exposes:
  - **Login Flow:**  
    - `/SignIn`: Handles the OAuth callback, verifies the user, and creates a secure session using JWT stored as an HTTP‑only cookie.
  - **Analysis:**  
    - `/analyze`: Accepts text input, performs sentiment analysis using a Hugging Face model (`Xenova/distilbert-base-uncased-finetuned-sst-2-english`), stores the result in Firestore (via Firebase Admin), and returns the analysis.
  - **History:**  
    - `historyQuery`: Retrieves the authenticated user’s past sentiment analyses from Firestore.

- **AI Integration:**  
  Uses Hugging Face’s transformers pipeline for sentiment analysis.

- **Data Storage & Authentication:**  
  Uses Firebase Authentication (Google sign‑in) and Firebase Firestore to securely store user history. All sensitive Firebase operations are performed server‑side using the Firebase Admin SDK.

- **Data Visualization:**  
  Uses Chart.js (via react-chartjs‑2) to render a line chart that visualizes sentiment scores over time. The chart dynamically scales the y‑axis to highlight slight score variations (especially when most scores are around 99%).

---

## 🔧 Installation and Running the Application

### 📦 Install Dependencies
npm install

### ⚙️ Configure Environment Variables
Create a .env file in the root directory with the following variables:
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY_HERE

## 🧪 Running in Development Mode
To run the application with hot reloading:
npm run dev

## 🙏 Acknowledgements
- Hugging Face: For providing the sentiment analysis models.

- Firebase: For authentication and database services.

- Chart.js: For data visualization.

- react-chartjs-2: React wrapper for Chart.js.



