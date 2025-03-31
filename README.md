# Autism Prediction System

This repository contains an **Autism Prediction System** powered by **Machine Learning** and deployed using **Next.js, FastAPI, and Golang**. The project includes:
- A **frontend** built with Next.js
- A **backend** in Golang
- A **FastAPI server** for handling GPU-based ML computations
- A **MySQL database**

## Prerequisites
Ensure you have the following installed:
- Python **3.11**
- Virtual Environment (`venv`)
- MySQL Server
- Golang
- Node.js & npm
- Uvicorn (for FastAPI)

## Setup Guide

### 1. Clone the Repository
```sh
git clone https://github.com/kspranav-az/AutismPredictionSystem.git
cd AutismPredictionSystem
```

### 2. Set Up the Python Environment
```sh
python3.11 -m venv env
source env/bin/activate  # On Windows, use `env\\Scripts\\activate`
```

### 3. Install Dependencies
```sh
pip install -r requirements.txt
```

### 4. Place Model Files
Put all required model files inside the **`models/`** folder (located in the root directory).

### 5. Add Test Videos
Place test video files in the **root directory**.

### 6. Start the FastAPI Server
```sh
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 7. Set Up and Run the Frontend
```sh
cd frontend
npm install
npm run dev
```

### 8. Configure and Run the Backend (Golang)
Edit **`app.go`** and update the **MySQL DSN** connection string:
```go
dsn := "root:2004@tcp(127.0.0.1:3306)/aimed?parseTime=true"
```

Then, navigate to the backend directory and build/run the Go server:
```sh
cd backend
go build
./main
```

### 9. Access the Application
Once all servers are running, open your browser and visit:
```
http://localhost:3000
```

## Notes
- Ensure MySQL is running with the correct credentials before starting the backend.
- Adjust firewall settings if necessary to allow API communication.
- If running on a remote machine, update `localhost` with the respective IP.

---
