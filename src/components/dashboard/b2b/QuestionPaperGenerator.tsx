// src/components/dashboard/b2b/QuestionPaperGenerator.tsx

'use client';


import { useState } from "react";
import { FileText, Plus, Trash2 } from "lucide-react";

export default function QuestionPaperGenerator() {
  const [questions, setQuestions] = useState([
    { id: 1, topic: "Algebra", difficulty: "Easy", marks: 5, blooms: "Remember" },
    { id: 2, topic: "Geometry", difficulty: "Medium", marks: 10, blooms: "Understand" },
  ]);

  const [newQuestion, setNewQuestion] = useState({
    topic: "",
    difficulty: "Easy",
    marks: 5,
    blooms: "Remember",
  });

  const addQuestion = () => {
    if (newQuestion.topic) {
      setQuestions([
        ...questions,
        {
          id: questions.length + 1,
          ...newQuestion,
        },
      ]);
      setNewQuestion({
        topic: "",
        difficulty: "Easy",
        marks: 5,
        blooms: "Remember",
      });
    }
  };

  const removeQuestion = (id: number) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="mb-6 flex items-center gap-3">
        <FileText className="text-[#41D786]" size={24} />
        <h2 className="text-2xl font-bold text-gray-800">Question Paper Generator</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <h3 className="mb-4 text-lg font-semibold">Add New Question</h3>
          
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Topic</label>
              <input
                type="text"
                value={newQuestion.topic}
                onChange={(e) => setNewQuestion({...newQuestion, topic: e.target.value})}
                className="w-full rounded border p-2"
                placeholder="Enter topic"
              />
            </div>
            
            <div>
              <label className="mb-1 block text-sm font-medium">Difficulty</label>
              <select
                value={newQuestion.difficulty}
                onChange={(e) => setNewQuestion({...newQuestion, difficulty: e.target.value})}
                className="w-full rounded border p-2"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            
            <div>
              <label className="mb-1 block text-sm font-medium">Marks</label>
              <select
                value={newQuestion.marks}
                onChange={(e) => setNewQuestion({...newQuestion, marks: parseInt(e.target.value)})}
                className="w-full rounded border p-2"
              >
                <option value={1}>1 Mark</option>
                <option value={2}>2 Marks</option>
                <option value={5}>5 Marks</option>
                <option value={10}>10 Marks</option>
              </select>
            </div>
            
            <div>
              <label className="mb-1 block text-sm font-medium">Blooms Taxonomy</label>
              <select
                value={newQuestion.blooms}
                onChange={(e) => setNewQuestion({...newQuestion, blooms: e.target.value})}
                className="w-full rounded border p-2"
              >
                <option value="Remember">Remember</option>
                <option value="Understand">Understand</option>
                <option value="Apply">Apply</option>
                <option value="Analyze">Analyze</option>
                <option value="Evaluate">Evaluate</option>
                <option value="Create">Create</option>
              </select>
            </div>
            
            <button
              onClick={addQuestion}
              className="flex items-center gap-2 rounded bg-[#41D786] px-4 py-2 text-white hover:bg-[#3ac574]"
            >
              <Plus size={16} />
              Add Question
            </button>
          </div>
        </div>
        
        <div className="rounded-lg border p-4">
          <h3 className="mb-4 text-lg font-semibold">Generated Paper</h3>
          
          <div className="space-y-3">
            {questions.map((question) => (
              <div key={question.id} className="flex items-center justify-between rounded border p-3">
                <div>
                  <p className="font-medium">{question.topic}</p>
                  <div className="mt-1 flex gap-2 text-sm text-gray-600">
                    <span className="rounded bg-blue-100 px-2 py-1">{question.difficulty}</span>
                    <span className="rounded bg-green-100 px-2 py-1">{question.marks} Marks</span>
                    <span className="rounded bg-purple-100 px-2 py-1">{question.blooms}</span>
                  </div>
                </div>
                <button 
                  onClick={() => removeQuestion(question.id)}
                  className="rounded p-1 text-red-500 hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <div className="mb-2 flex justify-between">
              <span>Total Questions:</span>
              <span className="font-medium">{questions.length}</span>
            </div>
            <div className="mb-4 flex justify-between">
              <span>Total Marks:</span>
              <span className="font-medium">
                {questions.reduce((sum, q) => sum + q.marks, 0)}
              </span>
            </div>
            <button className="w-full rounded bg-[#41D786] py-2 text-white hover:bg-[#3ac574]">
              Generate PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}