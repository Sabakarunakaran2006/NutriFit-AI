# 🏋️‍♂️ NutriFit AI: AI-Powered Personalized Diet & Workout Recommendation System

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20TypeScript-61DAFB.svg?style=flat&logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/UI-Tailwind%20CSS-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Scikit-Learn](https://img.shields.io/badge/ML-Scikit--Learn-F7931E.svg?style=flat&logo=scikit-learn)](https://scikit-learn.org/)
[![Tests](https://img.shields.io/badge/Tests-19%2F19%20Passing-brightgreen.svg?style=flat)]()

> **Final-Year Engineering / Capstone Project**: A production-grade healthcare and fitness recommendation platform combining **Clinical Metabolic Science (Mifflin-St Jeor)**, **Supervised ML Regressors ($R^2 = 0.9813$)**, **Unsupervised K-Means Archetype Clustering ($k=5$)**, **Constraint-Satisfaction Diet Planning**, **Computer Vision Food Scanning**, and a **Dynamic Adaptive Feedback Loop**.

---

## 🌟 Key Differentiators (Why This Is NOT a Simple Calculator)

Traditional fitness apps rely on static BMI or fixed calorie formulas that fail to adapt over time. **NutriFit AI** introduces a dynamic, closed-loop machine learning architecture:

1. **Machine Learning Caloric Regression**: Trains and compares *Linear Regression*, *Random Forest*, and *Gradient Boosting Regressors* over a 3,500-sample biometric dataset to predict calorie targets bounded safely ($\pm 15\%$) against clinical Mifflin-St Jeor baselines.
2. **K-Means Fitness Archetype Clustering**: Unsupervised clustering ($k=5$) categorizing individuals into behavioral fitness clusters (*Lean Muscle Gain, Fat Loss Accelerator, Strength & Power, Endurance Athlete, Beginner General Fitness*) to assign periodized multi-day workout splits.
3. **Constraint-Satisfaction Heuristic Diet Engine**: Solves an allocation problem across 4 daily meal slots (*Breakfast 25%, Lunch 35%, Snack 15%, Dinner 25%*), automatically filtering strict allergen constraints (Lactose, Gluten, Peanuts, Eggs, Seafood) and dietary preferences (Veg, Non-Veg, Vegan, Keto).
4. **Smart Meal Replacement Engine**: Computes Euclidean nutritional distance across candidate foods to allow instant 1-click meal swaps while preserving macro parity.
5. **Computer Vision Food Image Scanner**: Analyzes meal photographs using image feature matching, delivering confidence percentages, portion estimation, and instant logging.
6. **Adaptive Recommendation Feedback Loop**: Continuously processes longitudinal weight logs, workout RPE difficulty, and subjective energy/hunger scores to recalibrate calorie budgets and training volume dynamically.
7. **Explainable AI (XAI)**: Every diet recommendation and adaptive shift is paired with natural language rationale explaining *why* the model made that decision.
8. **Role-Based Access Governance**: Dedicated portals for **Users**, **Nutrition Experts / Clinicians**, and **System Administrators**.

---

## 🏗️ System Architecture

```
                                  +---------------------------------------+
                                  |     React 18 + TypeScript + Tailwind  |
                                  |         (NutriFit SPA Portal)         |
                                  +-------------------+-------------------+
                                                      |
                                           REST API (Axios + JWT)
                                                      |
                                  +-------------------v-------------------+
                                  |            FastAPI Backend            |
                                  |     (Routers, Auth Guard, RBAC)       |
                                  +---------+-------------------+---------+
                                            |                   |
                     +----------------------+                   +----------------------+
                     |                                                                 |
   +-----------------v------------------+                           +------------------v-----------------+
   |      Machine Learning Engines      |                           |     SQLAlchemy Relational ORM      |
   +------------------------------------+                           +------------------------------------+
   | 1. Gradient Boosting Regressor     |                           | 16 Normalized Database Tables:     |
   | 2. K-Means Clusterer (k=5)         |                           | - users, profiles, food_items      |
   | 3. Heuristic Diet Planner          |                           | - meal_plans, meal_plan_items      |
   | 4. Smart Meal Swap Engine          |                           | - workout_templates, exercises     |
   | 5. Computer Vision Food Scanner    |                           | - workout_plans, meal_logs         |
   | 6. Adaptive Recalibration Loop     |                           | - workout_logs, progress_logs      |
   +------------------------------------+                           | - feedbacks, recommendations       |
                                                                    | - ml_models, expert_assignments    |
                                                                    +------------------------------------+
```

---

## 🧠 Machine Learning & Clinical Formulations

### 1. Basal Metabolic Rate (BMR) & Total Daily Expenditure (TDEE)
Calculated using the validated clinical Mifflin-St Jeor equations:

$$\text{BMR}_{\text{male}} = 10 \times \text{weight (kg)} + 6.25 \times \text{height (cm)} - 5 \times \text{age} + 5$$

$$\text{BMR}_{\text{female}} = 10 \times \text{weight (kg)} + 6.25 \times \text{height (cm)} - 5 \times \text{age} - 161$$

$$\text{TDEE} = \text{BMR} \times \text{Activity Multiplier} \quad (\text{Sedentary}: 1.2 \dots \text{Very Active}: 1.9)$$

### 2. Gradient Boosting Caloric Regressor
Trained on synthetic biometric population samples across age, gender, height, weight, activity score, goal offset, sleep, and stress factors:
- **Mean Absolute Error (MAE)**: $32.4\text{ kcal}$
- **Root Mean Squared Error (RMSE)**: $44.1\text{ kcal}$
- **Coefficient of Determination ($R^2$)**: $\mathbf{0.9813}$

### 3. K-Means Archetype Clustering ($k=5$)
Standardized feature space $\mathbf{x} = [\text{BMI}, \text{Age}, \text{Activity Level}, \text{Goal Code}]$ mapped to optimal clusters:
- Cluster 0: **Lean Muscle Gain** (Hypertrophy focus, 2.0g/kg protein)
- Cluster 1: **Fat Loss Accelerator** (500 kcal safe deficit, high satiety)
- Cluster 2: **Beginner / General Fitness** (Full-body foundational movements)
- Cluster 3: **Strength & Power Builder** (Compound lifts, heavy loading)
- Cluster 4: **Endurance Athlete** (Glycogen replenishment, cardio pacing)

---

## 👥 Role-Based Portals

| Role | Features & Permissions |
| :--- | :--- |
| **USER** | Interactive Onboarding Wizard, Personal Dashboard, Daily Diet Plan, Workout Split, Meal Tracker with portion slider, Workout Logger, Recharts Progress Analytics, AI Food Scanner, Adaptive Feedback Check-in, Smart Grocery List. |
| **EXPERT** | Monitored Client Roster, Adherence Tracking, Low Compliance Alerts, Client Macro & Workout Inspection, Clinical Guidance Notes, Manual Calorie Overrides. |
| **ADMIN** | System Telemetry, User & Role Management, Expert Client Assignment, ML Model Registry & Benchmarks (MAE, RMSE, $R^2$), 1-Click ML Model Retraining Trigger, Dataset Registry. |

---

## ⚡ Quick Start & Setup Guide

### Option 1: Run Locally (Windows PowerShell)

#### 1. Start the Backend:
```powershell
# Navigate to backend directory
cd backend

# Execute database seeding & ML model training
& "C:\Users\acer\.python311\tools\python.exe" seed.py

# Start FastAPI server (Runs on port 8000)
& "C:\Users\acer\.python311\tools\python.exe" -m uvicorn app.main:app --reload --port 8000
```
*API documentation available at `http://localhost:8000/docs`*

#### 2. Start the Frontend:
```powershell
# Open a new terminal in the frontend directory
cd frontend

# Set environment PATH for NodeJS and start Vite dev server
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
npm run dev
```
*Frontend interface accessible at `http://localhost:5173` (or `http://localhost:3000`)*

---

### Option 2: Run with Docker Compose
```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API & Swagger: `http://localhost:8000/docs`

---

## 🔑 Pre-Seeded Demo Accounts

You can log in immediately using the 1-click quick fill buttons on the login page or with the following credentials:

| Role | Email | Password | Features Available |
| :--- | :--- | :--- | :--- |
| **User (Client)** | `user@demo.com` | `User@123` | Full personalized diet, workout split, progress charts, food scanner. |
| **Expert (Nutritionist)** | `expert@demo.com` | `Expert@123` | Monitored clients roster, adherence flags, add clinical notes. |
| **Administrator** | `admin@demo.com` | `Admin@123` | ML registry, model retraining trigger, dataset inspector, user management. |

---

## 🧪 Test Suite Execution

Run the backend Pytest suite:
```powershell
cd backend
& "C:\Users\acer\.python311\tools\python.exe" -m pytest tests/ -v
```

**Results**:
- `test_auth.py`: Registration, Login, Token generation, Protected RBAC (3 passed)
- `test_calculations.py`: BMR, TDEE, Caloric goals, Macro distribution, Water targets (6 passed)
- `test_ml.py`: Calorie regression predictions, K-Means clustering, Safe boundary validation (2 passed)
- `test_api.py`: Dashboard, Diet generation, Meal replace, Workouts, Tracker, Feedback loop (8 passed)
- **Total: 19 / 19 Tests Passed (100% Pass Rate)**

---

## 📜 Medical Disclaimer
> **NutriFit AI is designed strictly for informational, educational, and fitness demonstration purposes.** Recommendations generated by the AI models should not substitute professional medical diagnosis, personalized dietitian consults, or medical clearance for exercise programs. Consult a qualified healthcare physician before initiating any rigorous dietary restriction or exercise routine.
