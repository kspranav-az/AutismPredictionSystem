from fastapi import FastAPI, UploadFile, File, Form
import numpy as np
import cv2
import os
import shutil
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.optimizers import Adam
import joblib
import pandas as pd
from concurrent.futures import ThreadPoolExecutor
from mtcnn import MTCNN
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Models
vgg_model = load_model("../models/vgg_cnn_model.h5")# Deep Learning Model
vgg_model.compile(optimizer=Adam(learning_rate=0.001), loss='binary_crossentropy', metrics=['accuracy'])
asd_model = joblib.load("../models/asd_model_V2.pkl")  # ML Model
scaler = joblib.load("../models/scaler_V2.pkl")
label_encoders = joblib.load("../models/label_encoders_V2.pkl")
detector = MTCNN()
print("Models loaded successfully.")

# Define global size variable
photo_size = 224

# Function to preprocess a frame (face detection + resizing)
def preprocess_frame(frame, detect_face=True, target_size=(224, 224)):
    """
    Preprocesses an image by detecting and cropping the face,
    resizing while maintaining aspect ratio, and normalizing it.
    """
    if detect_face:
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        faces = detector.detect_faces(frame_rgb)

        if faces:
            x, y, w, h = faces[0]['box']
            x, y = max(x, 0), max(y, 0)  # Ensure valid coordinates
            frame = frame[y:y+h, x:x+w]  # Crop face

    # Convert to RGB (if not already)
    frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # # Resize while keeping aspect ratio
    # frame = resize_with_aspect_ratio(frame, target_size)
    frame = cv2.resize(frame, target_size)
    # Normalize pixel values
    frame = frame.astype("float32") / 255.0

    return frame

def resize_with_aspect_ratio(image, target_size):
    """ Resizes image while maintaining aspect ratio and padding if needed. """
    h, w = image.shape[:2]
    target_h, target_w = target_size

    scale = min(target_w / w, target_h / h)
    new_w, new_h = int(w * scale), int(h * scale)

    resized = cv2.resize(image, (new_w, new_h))

    pad_w = (target_w - new_w) // 2
    pad_h = (target_h - new_h) // 2

    padded = cv2.copyMakeBorder(resized, pad_h, target_h - new_h - pad_h, pad_w, target_w - new_w - pad_w,
                                cv2.BORDER_CONSTANT, value=(0, 0, 0))  # Black padding
    return padded

# Define preprocessing wrapper for ImageDataGenerator
def preprocessing_function(image):
    """ Wrapper function for ImageDataGenerator preprocessing. """
    return preprocess_frame(image, detect_face=True, target_size=(photo_size, photo_size))

def weighted_average(x, y, alpha=11, beta=4):
    """
    Compute weighted average with constraints:
    - x and y are in [0,1].
    - wx ∈ [0.1, 0.4], wy ∈ [0.6, 0.9].
    - Middle region (0.4 to 0.8) has near-constant weights.
    """
    # Sigmoidal weight control
    S_x = 1 / (1 + np.exp(-alpha * (x - 0.5)))
    S_y = 1 / (1 + np.exp(-beta * (y - 0.5)))

    # Clamping in middle region (0.4 to 0.8)
    if 0.4 <= x <= 0.8:
        S_x = 0.9
    if 0.4 <= y <= 0.8:
        S_y = 0.1

    # Weight functions
    w_x = 0.1 + 0.3 * S_x  # Ranges from 0.1 to 0.4
    w_y = 0.9 - 0.3 * S_y  # Ranges from 0.6 to 0.9

    # Normalize weights
    total = w_x + w_y
    w_x_final = w_x / total
    w_y_final = w_y / total

    # Compute weighted average
    return w_x_final * x + w_y_final * y

# # Function to preprocess a frame
# def preprocess_frame(frame):
#     frame = cv2.resize(frame, (224, 224))
#     frame = frame.astype("float32") / 255.0
#     frame = np.expand_dims(frame, axis=0)
#     return frame


# Function to check if a frame is blurry
def is_blurry(frame, threshold=1000):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    variance = cv2.Laplacian(gray, cv2.CV_64F).var()
    return variance < threshold


# Extract frames from video
def extract_frames(video_path, frame_rate=5):
    cap = cv2.VideoCapture(video_path)
    #print("Capturing video... : " , cap.get(cv2.CAP_PROP_FRAME_COUNT))
    frames = []
    frame_count = 0

    while cap.isOpened():
        success, frame = cap.read()

        if not success:
            break

        if frame_count % frame_rate == 0:
            # print(is_blurry(frame))
            # if not is_blurry(frame):
            frames.append(frame)

        frame_count += 1

    cap.release()
    return frames


# Parallel Prediction Function
def predict_frame(frame):
    #processed_frame = preprocess_frame(frame)
    processed_frame = np.expand_dims(preprocessing_function(frame) , axis=0)
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

    top_10 = sorted(predictions, reverse=True)[:8]
    weighted_avg_confidence = np.average(top_10)

    return 1 - np.float32(weighted_avg_confidence)


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
        final_confidence = weighted_average(video_confidence,asd_confidence)#(asd_confidence * 0.7) + (video_confidence * 0.3)
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