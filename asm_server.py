from fastapi import FastAPI, UploadFile, File, Form
import numpy as np
import cv2
import os
import shutil
import tensorflow as tf
from tensorflow.keras.models import load_model
import joblib
import pandas as pd
from concurrent.futures import ThreadPoolExecutor

app = FastAPI()

# Load Models
vgg_model = load_model("../models/vgg_cnn_model.h5")  # Deep Learning Model
asd_model = joblib.load("../models/asd_model.pkl")  # ML Model
scaler = joblib.load("../models/scaler.pkl")
label_encoders = joblib.load("../models/label_encoders.pkl")
print("Models loaded successfully.")


# Function to preprocess a frame
def preprocess_frame(frame):
    frame = cv2.resize(frame, (224, 224))
    frame = frame.astype("float32") / 255.0
    frame = np.expand_dims(frame, axis=0)
    return frame


# Function to check if a frame is blurry
def is_blurry(frame, threshold=100):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    variance = cv2.Laplacian(gray, cv2.CV_64F).var()
    return variance < threshold


# Extract frames from video
def extract_frames(video_path, frame_rate=5):
    cap = cv2.VideoCapture(video_path)
    frames = []
    frame_count = 0

    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            break

        if frame_count % frame_rate == 0:
            if not is_blurry(frame):
                frames.append(frame)

        frame_count += 1

    cap.release()
    return frames


# Parallel Prediction Function
def predict_frame(frame):
    processed_frame = preprocess_frame(frame)
    prediction_prob = vgg_model.predict(processed_frame)[0][0]
    return prediction_prob


# Function to predict using the ASD model
def predict_asd(test_df):
    categorical_columns = ['gender', 'jaundice']
    numerical_columns = ["age"]

    for col in categorical_columns:
        pass
        #test_df[col] = label_encoders[col].transform(test_df[col])

    test_df[numerical_columns] = scaler.transform(test_df[numerical_columns])

    return np.float32(asd_model.predict_proba(test_df)[:, 1])  # Get probability of class 1


# Process video & make predictions
def predict_on_video(video_path):
    frames = extract_frames(video_path)
    if not frames:
        return 0.0

    with ThreadPoolExecutor() as executor:
        predictions = list(executor.map(predict_frame, frames))

    top_10 = sorted(predictions, reverse=True)[:10]
    weighted_avg_confidence = np.average(top_10)

    return np.float32(weighted_avg_confidence)


@app.post("/predict/")
async def predict_video(
        file: UploadFile = File(...),
        A1_Score: int = Form(...),
        A2_Score: int = Form(...),
        A3_Score: int = Form(...),
        A4_Score: int = Form(...),
        A5_Score: int = Form(...),
        A6_Score: int = Form(...),
        A7_Score: int = Form(...),
        A8_Score: int = Form(...),
        A9_Score: int = Form(...),
        A10_Score: int = Form(...),
        age: float = Form(...),
        gender: int = Form(...),  # 0 = Female, 1 = Male
        jaundice: int = Form(...)  # 0 = No, 1 = Yes
):
    temp_video_path = f"temp_{file.filename}"

    try:
        with open(temp_video_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # ASD Model Prediction
        test_data = pd.DataFrame([{
            "A1_Score": A1_Score, "A2_Score": A2_Score, "A3_Score": A3_Score, "A4_Score": A4_Score,
            "A5_Score": A5_Score, "A6_Score": A6_Score, "A7_Score": A7_Score, "A8_Score": A8_Score,
            "A9_Score": A9_Score, "A10_Score": A10_Score, "age": age, "gender": gender, "jaundice": jaundice
        }])

        asd_confidence = float(predict_asd(test_data)[0])  # Ensure Python float
        video_confidence = float(predict_on_video(temp_video_path))  # Ensure Python float

        # Final Weighted Average
        final_confidence = (asd_confidence * 0.7) + (video_confidence * 0.3)
        prediction = "Autistic" if final_confidence > 0.5 else "Non-Autistic"

        return {
            "prediction": prediction,
            "final_confidence": round(final_confidence, 4),
            "asd_confidence": round(asd_confidence, 4),
            "video_confidence": round(video_confidence, 4)
        }

    finally:
        if os.path.exists(temp_video_path):
            os.remove(temp_video_path)