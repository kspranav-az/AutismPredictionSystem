"use client";
import { useState, useRef, useEffect } from "react";
import { saveAs } from "file-saver";
import CommonHeaderPage from "./CommonHeaderPage";
import { useRouter } from "next/navigation";
const QuestionPage = () => {
  const [recording, setRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [showQuestions, setShowQuestions] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [answers, setAnswers] = useState({});
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const sampleVideoUrl = "/sample-video.mp4";
  const router = useRouter();
  const questions = [
    "I often notice small sounds when others do not",
    "I usually concentrate more on the whole picture, rather than the small details",
    "I find it easy to do more than one thing at once",
    "If there is an interruption, I can switch back to what I was doing very quickly",
    "I find it easy to ‘read between the lines’ when someone is talking to me",
    "I know how to tell if someone listening to me is getting bored",
    "When I’m reading a story I find it difficult to work out the characters’ intentions",
    "I like to collect information about categories of things (e.g., types of car, types of bird, types of train, types of plant, etc.)",
    "I find it easy to work out what someone is thinking or feeling just by looking at their face",
    "I find it difficult to work out people’s intentions",
  ];

  const startRecording = async () => {
    setRecordedChunks([]);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (error) {
      console.error("Error accessing the camera:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      streamRef.current.getTracks().forEach((track) => track.stop());
      setRecording(false);
    }
  };

  const handleNextStep = () => {
    setShowQuestions(true);
  };

  const handleAnswerChange = (e) => {
    setAnswers((prev) => ({ ...prev, [selectedQuestion]: e.target.value }));
  };

  const handleSubmit1 = async () => {
    const formData = new FormData();
    recordedChunks.forEach((chunk, index) => {
      formData.append(`file_${index}`, chunk, `video_${index}.webm`);
    });
    formData.append("answers", JSON.stringify(answers));

    const userData = {
      age: sessionStorage.getItem("age"),
      gender: sessionStorage.getItem("gender"),
      jaundice: sessionStorage.getItem("jaundice"),
    };
    Object.entries(userData).forEach(([key, value]) =>
      formData.append(key, value)
    );

    try {
      const response = await fetch("YOUR_API_URL_HERE", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        console.log("Data uploaded successfully");
      } else {
        console.error("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading data:", error);
    }
  };
  const calculateScore = () => {
    const scoringIndexes = [1, 7, 8, 10];
    let scoreObject = {};

    Object.entries(answers).forEach(([key, value]) => {
      const questionIndex = parseInt(key);
      const scoreKey = `A${questionIndex}_Score`;
      let score = 0;

      if (scoringIndexes.includes(questionIndex) && value.includes("Agree")) {
        score = 1;
      } else if (
        !scoringIndexes.includes(questionIndex) &&
        value.includes("Disagree")
      ) {
        score = 1;
      }

      scoreObject[scoreKey] = score;
    });

    return scoreObject;
  };
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmissionStatus("processing");
    const scores = calculateScore();
    console.log("Scores:", scores);

    const userData = {
      age: sessionStorage.getItem("age"),
      gender: sessionStorage.getItem("gender"),
      jaundice: sessionStorage.getItem("jaundice"),
    };

    if (recordedChunks.length === 0) {
      console.error("No video file found.");
      return;
    }
    const videoBlob = new Blob(recordedChunks, { type: "video/webm" });
    const videoFile = new File([videoBlob], "recorded_video.webm", {
      type: "video/webm",
    });

    const formData = new FormData();

    Object.entries(scores).forEach(([key, value]) => {
      formData.append(key, value);
    });

    Object.entries(userData).forEach(([key, value]) => {
      if (value !== null) {
        formData.append(key, parseInt(value, 10));
      }
    });

    formData.append("file", videoFile);

    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      const response = await fetch("http://127.0.0.2:8000/predict/", {
        method: "POST",
        body: formData,
      });

      const textResponse = await response.text();

      if (!response.ok) {
        console.error("Server Error:", response.status, textResponse);
        setSubmissionStatus(null);
        return;
      }

      try {
        const jsonResponse = JSON.parse(textResponse);
        const std_info = JSON.parse(sessionStorage.getItem("studentInfo"));

        console.log("Prediction Result:", jsonResponse.prediction);

        let asd_confidence = (jsonResponse.asd_confidence * 100).toFixed(2);
        let video_confidence = (jsonResponse.video_confidence * 100).toFixed(2);
        let final_confidence = (jsonResponse.final_confidence * 100).toFixed(2);

        try {
          const response = await fetch("http://127.0.0.1:9999/setReport", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: String(std_info.name),
              age: String(std_info.age),
              gender: String(std_info.gender),
              grade: String(std_info.grade),
              jaundice: String(std_info.jaundice),
              prediction: String(jsonResponse.prediction),
              asd_confidence,
              video_confidence,
              final_confidence,
            }),
          });

          if (!response.ok) {
            console.error("Server Error:", response.status, response);
            setSubmissionStatus(null);
            return;
          }

          console.log("Data submitted successfully!");
        } catch (error) {
          console.error("Fetch Error:", error);
        }

        setSubmissionStatus("done");
      } catch (error) {
        console.error("Invalid JSON Response. Raw response:", textResponse);
        setSubmissionStatus(null);
      }
    } catch (error) {
      console.error("Error sending data:", error);
      setSubmissionStatus(null);
    } finally {
      router.push("/home");
    }
  };

  return (
    <div className="h-screen bg-black text-white">
      <CommonHeaderPage />
      {!showQuestions ? (
        <div className="flex flex-col items-center justify-center h-full">
          <video
            ref={videoRef}
            autoPlay
            muted
            className="w-full  max-w-lg border-2 border-white"
          />
          <video
            autoPlay
            muted
            loop
            className=" w-full max-w-lg  border-whiteobject-cover border-2 border-white"
          >
            <source src="./video/videoplayback1.mp4" type="video/mp4" />
          </video>
          <div className="mt-4">
            {!recording ? (
              <button
                onClick={startRecording}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Start Recording
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Stop Recording
              </button>
            )}
          </div>
          {!recording && recordedChunks.length > 0 && (
            <button
              onClick={handleNextStep}
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
            >
              Next Step
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-xl mb-4">{questions[selectedQuestion - 1]}</div>
          <div className="p-2 border border-white bg-gray-800 text-white w-2/3">
            {[
              "Definitely Agree",
              "Slightly Agree",
              "Slightly Disagree",
              "Definitely Disagree",
            ].map((option) => (
              <div key={option} className="flex items-center">
                <input
                  type="radio"
                  id={option}
                  name="answer"
                  value={option}
                  checked={answers[selectedQuestion] === option}
                  onChange={handleAnswerChange}
                  className="mr-2"
                />
                <label htmlFor={option}>{option}</label>
              </div>
            ))}
          </div>
          <div className="mt-4 flex space-x-4">
            <button
              onClick={() =>
                setSelectedQuestion(Math.max(1, selectedQuestion - 1))
              }
              className="px-4 py-2 bg-gray-500 text-white rounded"
              disabled={selectedQuestion === 1}
            >
              Previous
            </button>
            <button
              onClick={() =>
                setSelectedQuestion(
                  Math.min(questions.length, selectedQuestion + 1)
                )
              }
              className="px-4 py-2 bg-gray-500 text-white rounded"
              disabled={selectedQuestion === questions.length}
            >
              Next
            </button>
          </div>
          {selectedQuestion === questions.length && (
            <div>
              {isSubmitting ? (
                <div className="mt-4 text-lg">Processing... ⏳</div>
              ) : submissionStatus === "done" ? (
                <button
                  onClick={handleSubmit}
                  className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
                >
                  Submit
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
                >
                  Submit
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionPage;
