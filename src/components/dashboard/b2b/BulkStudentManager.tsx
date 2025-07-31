// src/components/dashboard/b2b/BulkStudentManager.tsx

'use client';

import { useState } from "react";
import { UserPlus, Upload, Download, Users } from "lucide-react";

export default function BulkStudentManager() {
  const [students, setStudents] = useState([
    { id: 1, name: "John Doe", email: "john@example.com", class: "10A", roll: "001" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", class: "10B", roll: "002" },
    { id: 3, name: "Robert Johnson", email: "robert@example.com", class: "11A", roll: "003" },
  ]);

  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    class: "",
    roll: "",
  });

  const addStudent = () => {
    if (newStudent.name && newStudent.email) {
      setStudents([
        ...students,
        {
          id: students.length + 1,
          ...newStudent,
        },
      ]);
      setNewStudent({ name: "", email: "", class: "", roll: "" });
    }
  };

  const removeStudent = (id: number) => {
    setStudents(students.filter((student) => student.id !== id));
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="mb-6 flex items-center gap-3">
        <Users className="text-[#41D786]" size={24} />
        <h2 className="text-2xl font-bold text-gray-800">Bulk Student Manager</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border p-6">
          <h3 className="mb-4 text-lg font-semibold">Add New Students</h3>
          
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Name</label>
              <input
                type="text"
                value={newStudent.name}
                onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                className="w-full rounded border p-2"
                placeholder="Enter student name"
              />
            </div>
            
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input
                type="email"
                value={newStudent.email}
                onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                className="w-full rounded border p-2"
                placeholder="Enter student email"
              />
            </div>
            
            <div>
              <label className="mb-1 block text-sm font-medium">Class</label>
              <input
                type="text"
                value={newStudent.class}
                onChange={(e) => setNewStudent({...newStudent, class: e.target.value})}
                className="w-full rounded border p-2"
                placeholder="Enter class"
              />
            </div>
            
            <div>
              <label className="mb-1 block text-sm font-medium">Roll Number</label>
              <input
                type="text"
                value={newStudent.roll}
                onChange={(e) => setNewStudent({...newStudent, roll: e.target.value})}
                className="w-full rounded border p-2"
                placeholder="Enter roll number"
              />
            </div>
            
            <button
              onClick={addStudent}
              className="flex items-center gap-2 rounded bg-[#41D786] px-4 py-2 text-white hover:bg-[#3ac574]"
            >
              <UserPlus size={16} />
              Add Student
            </button>
          </div>
          
          <div className="mt-6">
            <h4 className="mb-3 text-sm font-medium">Bulk Actions</h4>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 rounded border px-4 py-2 hover:bg-gray-50">
                <Upload size={16} />
                Import CSV
              </button>
              <button className="flex items-center gap-2 rounded border px-4 py-2 hover:bg-gray-50">
                <Download size={16} />
                Export CSV
              </button>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border p-6">
          <h3 className="mb-4 text-lg font-semibold">Student List</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left">Name</th>
                  <th className="py-2 text-left">Email</th>
                  <th className="py-2 text-left">Class</th>
                  <th className="py-2 text-left">Roll</th>
                  <th className="py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b">
                    <td className="py-2">{student.name}</td>
                    <td className="py-2">{student.email}</td>
                    <td className="py-2">{student.class}</td>
                    <td className="py-2">{student.roll}</td>
                    <td className="py-2">
                      <button 
                        onClick={() => removeStudent(student.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {students.length} students
            </p>
            <div className="flex gap-2">
              <button className="rounded border px-3 py-1 text-sm hover:bg-gray-50">
                Previous
              </button>
              <button className="rounded border px-3 py-1 text-sm hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}