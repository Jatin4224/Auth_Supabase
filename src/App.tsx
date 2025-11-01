import "./App.css";

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-semibold mb-8">Task Manager CRUD</h1>

      {/* Input Section */}
      <div className="w-full max-w-md bg-gray-800 rounded-2xl p-6 shadow-lg">
        <input
          type="text"
          placeholder="Task Title"
          className="w-full p-2 mb-3 rounded-md bg-gray-700 placeholder-gray-400 outline-none"
        />
        <textarea
          placeholder="Task Description"
          className="w-full p-2 mb-4 rounded-md bg-gray-700 placeholder-gray-400 outline-none h-24 resize-none"
        ></textarea>
        <button className="w-full bg-blue-500 hover:bg-blue-600 transition-all rounded-md py-2 font-medium">
          Add Task
        </button>
      </div>

      {/* Task List Section */}
      <div className="w-full max-w-md mt-8 space-y-4">
        {/* Example Task Card */}
        <div className="bg-gray-800 p-4 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-1">Title</h2>
          <p className="text-gray-400 mb-4">Description</p>
          <div className="flex gap-2">
            <button className="flex-1 bg-yellow-500 hover:bg-yellow-600 rounded-md py-1 transition">
              Edit
            </button>
            <button className="flex-1 bg-red-500 hover:bg-red-600 rounded-md py-1 transition">
              Delete
            </button>
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-1">Another Task</h2>
          <p className="text-gray-400 mb-4">Some description here...</p>
          <div className="flex gap-2">
            <button className="flex-1 bg-yellow-500 hover:bg-yellow-600 rounded-md py-1 transition">
              Edit
            </button>
            <button className="flex-1 bg-red-500 hover:bg-red-600 rounded-md py-1 transition">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
