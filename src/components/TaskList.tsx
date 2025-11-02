import { useEffect, useState } from "react";
// import "../App.css";
import supabase from "../supabase-client";

interface Task {
  id: number;
  title: string;
  description: string;
  created_at: string;
}

function TaskList() {
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newDescription, setNewDescription] = useState("");

  // ✅ Fetch tasks once on mount
  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error reading tasks:", error.message);
      return;
    }
    setTasks(data || []);
  };

  useEffect(() => {
    fetchTasks();
  }, []); // ✅ added dependency array

  //realtime
  useEffect(() => {
    const setupSubscription = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return;

      const channel = supabase
        .channel("tasks-channel")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "tasks",
          },
          (payload) => {
            const newTask = payload.new as Task;
            setTasks((prev) => [...prev, newTask]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupSubscription();
  }, []);

  // ✅ Add a new task
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("tasks").insert([newTask]);

    if (error) {
      console.error("Error adding task:", error.message);
      return;
    }

    setNewTask({ title: "", description: "" });
    fetchTasks(); // refresh after adding
  };

  // ✅ Delete a task
  const deleteTask = async (id: number) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) {
      console.error("Error deleting task:", error.message);
      return;
    }

    fetchTasks(); // refresh after deletion
  };

  // ✅ Update a task's description
  const updateTask = async (id: number) => {
    if (!newDescription.trim()) {
      alert("Please enter a description before updating.");
      return;
    }

    const { error } = await supabase
      .from("tasks")
      .update({ description: newDescription })
      .eq("id", id);

    if (error) {
      console.error("Error updating task:", error.message);
      return;
    }

    setNewDescription("");
    fetchTasks(); // refresh after update
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "1rem" }}>
      <h2>Task Manager</h2>

      {/* Form to add a new task */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Task Title"
          value={newTask.title}
          onChange={(e) =>
            setNewTask((prev) => ({ ...prev, title: e.target.value }))
          }
          style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
        />
        <textarea
          placeholder="Task Description"
          value={newTask.description}
          onChange={(e) =>
            setNewTask((prev) => ({ ...prev, description: e.target.value }))
          }
          style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
        />
        <button type="submit" style={{ padding: "0.5rem 1rem" }}>
          Add Task
        </button>
      </form>

      {/* List of Tasks */}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {tasks.map((task) => (
          <li
            key={task.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "4px",
              padding: "1rem",
              marginBottom: "0.5rem",
            }}
          >
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <textarea
              placeholder="Updated description..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              style={{ width: "100%", marginBottom: "0.5rem" }}
            />
            <div>
              <button
                style={{ padding: "0.5rem 1rem", marginRight: "0.5rem" }}
                onClick={() => updateTask(task.id)}
              >
                Edit
              </button>
              <button
                style={{ padding: "0.5rem 1rem" }}
                onClick={() => deleteTask(task.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TaskList;
