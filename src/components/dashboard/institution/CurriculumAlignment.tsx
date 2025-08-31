// src/components/dashboard/institution/CurriculumAlignment.tsx

'use client';


import { useState } from "react";
import { BookCheck, CheckCircle, AlertCircle, Clock } from "lucide-react";

const curriculumData = [
  { id: 1, subject: "Mathematics", syllabus: "CBSE", status: "Aligned", progress: 100 },
  { id: 2, subject: "Science", syllabus: "ICSE", status: "In Progress", progress: 75 },
  { id: 3, subject: "English", syllabus: "NEP 2020", status: "Pending", progress: 0 },
  { id: 4, subject: "History", syllabus: "State Board", status: "Aligned", progress: 100 },
  { id: 5, subject: "Geography", syllabus: "CBSE", status: "In Progress", progress: 50 },
];

export default function CurriculumAlignment() {
  const [selectedSyllabus, setSelectedSyllabus] = useState("All");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Aligned":
        return <CheckCircle className="text-green-500" size={16} />;
      case "In Progress":
        return <Clock className="text-yellow-500" size={16} />;
      case "Pending":
        return <AlertCircle className="text-red-500" size={16} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Aligned":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      case "Pending":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="mb-6 flex items-center gap-3">
        <BookCheck className="text-[#41D786]" size={24} />
        <h2 className="text-2xl font-bold text-gray-800">Curriculum Alignment</h2>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedSyllabus("All")}
          className={`rounded px-4 py-2 ${
            selectedSyllabus === "All"
              ? "bg-[#41D786] text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          All Syllabi
        </button>
        <button
          onClick={() => setSelectedSyllabus("CBSE")}
          className={`rounded px-4 py-2 ${
            selectedSyllabus === "CBSE"
              ? "bg-[#41D786] text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          CBSE
        </button>
        <button
          onClick={() => setSelectedSyllabus("ICSE")}
          className={`rounded px-4 py-2 ${
            selectedSyllabus === "ICSE"
              ? "bg-[#41D786] text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          ICSE
        </button>
        <button
          onClick={() => setSelectedSyllabus("NEP 2020")}
          className={`rounded px-4 py-2 ${
            selectedSyllabus === "NEP 2020"
              ? "bg-[#41D786] text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          NEP 2020
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="py-3 text-left">Subject</th>
              <th className="py-3 text-left">Syllabus</th>
              <th className="py-3 text-left">Status</th>
              <th className="py-3 text-left">Progress</th>
              <th className="py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {curriculumData
              .filter(item => selectedSyllabus === "All" || item.syllabus === selectedSyllabus)
              .map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 font-medium">{item.subject}</td>
                  <td className="py-3">{item.syllabus}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      <span className={`rounded-full px-3 py-1 text-xs ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-32 rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full bg-[#41D786]"
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{item.progress}%</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <button className="rounded border px-3 py-1 text-sm hover:bg-gray-100">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 rounded-lg border p-4">
        <h3 className="mb-3 text-lg font-semibold">Alignment Summary</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-green-50 p-4">
            <p className="text-2xl font-bold text-green-700">2</p>
            <p className="text-green-600">Fully Aligned</p>
          </div>
          <div className="rounded-lg bg-yellow-50 p-4">
            <p className="text-2xl font-bold text-yellow-700">2</p>
            <p className="text-yellow-600">In Progress</p>
          </div>
          <div className="rounded-lg bg-red-50 p-4">
            <p className="text-2xl font-bold text-red-700">1</p>
            <p className="text-red-600">Pending</p>
          </div>
        </div>
      </div>
    </div>
  );
}
