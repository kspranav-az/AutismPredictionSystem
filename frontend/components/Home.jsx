"use client";
import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { useRouter } from "next/navigation";
import CommonHeaderPage from "./CommonHeaderPage";
export default function Dashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  useEffect(() => {
    setIsMounted(true);
    fetch("http://localhost:9999/getAllReport")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch reports");
        }

        return res.json();
      })
      .then((data) => {
        setReports(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (!isMounted) return null;

  const processedReports = reports.map((r) => ({
    ...r,
    Gender: r.Gender === 1 ? "Female" : "Male",
    Jaundice: r.Jaundice === 1 ? "Yes" : "No",
  }));

  const filteredReports = processedReports.filter((report) =>
    report.Name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalStudents = reports.length;
  const maleStudents = reports.filter((r) => r.Gender === "Male").length;

  const studentData = {
    total: 100,
    male: 60,
    female: 40,
    maleWithAutism: 15,
    femaleWithAutism: 10,
  };

  const barChartData = [
    { name: "Total Students", value: studentData.total },
    { name: "Male", value: studentData.male },
    { name: "Female", value: studentData.female },
  ];

  const pieChartData = [
    { name: "Male with Autism", value: studentData.maleWithAutism },
    { name: "Female with Autism", value: studentData.femaleWithAutism },
  ];

  const COLORS = ["#4B79A1", "#F1C40F", "#16A085", "#E74C3C"];

  const studentsPerPage = 5;
  const totalPages = Math.ceil(studentData.length / studentsPerPage);

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedReport(null);
  };

  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  const HandleTest = () => {
    router.push("/qna");
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const studentInfo = {
      name: formData.get("name"),
      age: formData.get("age"),
      grade: formData.get("grade"),
      gender: formData.get("gender"),
      jaundice: formData.get("jaundice"),
    };

    if (typeof window !== "undefined") {
      sessionStorage.setItem("studentInfo", JSON.stringify(studentInfo));
      sessionStorage.setItem("age", studentInfo.age);
      sessionStorage.setItem("gender", studentInfo.gender);
      sessionStorage.setItem("jaundice", studentInfo.jaundice);
    }

    alert("Student info saved. Starting the test.");
    setIsFormOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black p-6">
      <CommonHeaderPage />
      <h1 className="text-3xl font-bold text-center text-[#4B79A1] mb-6">
        AIMED Dashboard
      </h1>
      <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">
        VIT VELLORE
      </h2>

      <section className="h-screen flex flex-col justify-start pt-10 items-center gap-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <h2 className="text-xl font-semibold mb-4 text-[#4B79A1]">
              Student Distribution
            </h2>
            <BarChart
              width={400}
              height={300}
              data={barChartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#4B79A1" />
            </BarChart>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <h2 className="text-xl font-semibold mb-4 text-[#4B79A1]">
              Autism Distribution
            </h2>
            <PieChart width={400} height={400}>
              <Pie
                data={pieChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                fill="#8884d8"
              >
                {pieChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>
        </div>

        <div className="my-8 text-center">
          <button
            onClick={handleOpenForm}
            className="bg-[#F1C40F] hover:bg-[#F39C12] text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-all duration-300"
          >
            Test a Student
          </button>
        </div>
        <h1 className="text-3xl translate-y-9 font-bold text-center text-[#4B79A1] mb-6">
          Check your report
        </h1>
        <h1 className="text-3xl translate-y-11 font-bold text-center text-[#4B79A1] mb-6">
          <br/><br/>
        </h1>

        {/*<a*/}
        {/*  href="#about"*/}
        {/*  className="absolute bottom-10 z-20 flex flex-col justify-center items-center w-8 h-13  rounded-full  text-black hover:shadow-xl hover:shadow-black transition-all "*/}
        {/*>*/}
        {/*  <span className=" animate-bounce-1">*/}
        {/*    <img src="./images/down-chevron.png" alt="" />*/}
        {/*  </span>*/}
        {/*  <span className=" animate-bounce-2 ">*/}
        {/*    <img src="./images/down-chevron.png" alt="" />*/}
        {/*  </span>*/}
        {/*</a>*/}
      </section>

      <section className="h-[75vh]">
        <h1 className="text-3xl translate-y-11 font-bold text-center text-[#4B79A1] mb-6">
          REPORTS
        </h1>
        <div className="mt-6 translate-y-13 bg-white rounded-xl border shadow-lg p-6">
          <input
            type="text"
            placeholder="Search students..."
            className="w-full p-2 border rounded-lg mb-4"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {loading ? (
            <p className="text-center text-gray-700">Loading reports...</p>
          ) : error ? (
            <p className="text-center text-red-600">Error: {error}</p>
          ) : (
            <div className="overflow-y-auto max-h-[400px]">
              {filteredReports.map((report, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-gray-100 p-4 rounded-lg shadow-md my-2"
                >
                  <span>
                    Name : {report.Name} <br/>
                    Age: {report.Age}
                  </span>
                  <button
                    className="bg-[#E74C3C] text-white px-4 py-2 rounded-lg font-semibold"
                    onClick={() => setSelectedReport(report)}
                  >
                    View Report
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white text-black p-6 rounded-lg max-w-lg w-full">
              <h2 className="text-xl font-semibold mb-4">Student Report</h2>
              <p>
                <strong>Name:</strong> {selectedReport.Name}
              </p>
              <p>
                <strong>Age:</strong> {selectedReport.Age}
              </p>
              <p>
                <strong>Grade:</strong> {selectedReport.Grade}
              </p>
              <p>
                <strong>Gender:</strong> {selectedReport.Gender}
              </p>
              <p>
                <strong>Jaundice:</strong> {selectedReport.Jaundice}
              </p>
              <p>
                <strong>Prediction:</strong> {selectedReport.Prediction}
              </p>
              <p>
                <strong>AsdConfidence:</strong> {selectedReport.AsdConfidence}%
              </p>
              <p>
                <strong>VideoConfidence:</strong>{" "}
                {selectedReport.VideoConfidence}%
              </p>
              <p>
                <strong>FinalConfidence:</strong>{" "}
                {selectedReport.FinalConfidence}%
              </p>
              <button
                onClick={() => setSelectedReport(null)}
                className="mt-4 bg-[#E74C3C] text-white px-4 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {isPopupOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white text-black p-6 rounded-lg max-w-lg w-full">
              <h2 className="text-xl font-semibold mb-4">Student Report</h2>
              <p>{selectedReport}</p>
              <button
                onClick={handleClosePopup}
                className="mt-4 bg-[#E74C3C] hover:bg-[#C0392B] text-white px-4 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <form
              onSubmit={handleSubmitForm}
              className="bg-white text-black p-6 rounded-lg max-w-md w-full"
            >
              <h2 className="text-xl font-semibold text-[#4B79A1] mb-4">
                Enter Student Info
              </h2>
              <div className="mb-4">
                <label className="block mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Age</label>
                <input
                  type="number"
                  name="age"
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Grade</label>
                <input
                  type="text"
                  name="grade"
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Gender</label>
                <select
                  name="gender"
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="1">Female</option>
                  <option value="0">Male</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block mb-2">Jaundice</label>
                <select
                  name="jaundice"
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </div>

              <button
                type="submit"
                className="bg-[#4B79A1] hover:bg-[#3A6E87] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
                onClick={HandleTest}
              >
                Submit and Start the Test
              </button>
            </form>
          </div>
        )}
      </section>
    </div>
  );
}
