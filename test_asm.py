import requests

url = "http://127.0.0.1:8000/predict/"
video_path = "../autistic girl.mp4"

form_data = {
    "A1_Score": 1, "A2_Score": 1, "A3_Score": 0, "A4_Score": 1,
    "A5_Score": 1, "A6_Score": 1, "A7_Score": 0, "A8_Score": 0,
    "A9_Score": 1, "A10_Score": 0, "age": 25, "gender": 1, "jaundice": 0
}

with open(video_path, "rb") as video_file:
    files = {"file": video_file}
    response = requests.post(url, data=form_data, files=files)

# Print raw response before parsing JSON
print("Response Status Code:", response.status_code)
print("Response Text:", response.text)

try:
    json_response = response.json()
    print(json_response)
except requests.exceptions.JSONDecodeError:
    print("Invalid JSON response. Check FastAPI logs for errors.")
