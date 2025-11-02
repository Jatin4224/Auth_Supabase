import { useEffect, useState, type ChangeEvent } from "react";
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
  const [taskImage, setTaskImage] = useState<File | null>(null);

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

  const uploadImage = async (file: File): Promise<string | null> => {
    //process of uploading image to supa
    //1) define unique file path for the image we want to store into public image bucket.
    const filePath = `${file.name}-${Date.now()}`;

    const { error } = await supabase.storage
      .from("tasks-images")
      .upload(filePath, file);

    if (error) {
      console.log("Error uplaoding images:", error.message);
    }

    const { data } = await supabase.storage
      .from("tasks-images")
      .getPublicUrl(filePath);

    return data.publicUrl; //this public url will be later inserted to the table as imageUrl
  };

  // ✅ Add a new task
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    //before we add new task to db we perform uploading image to supabase
    let imageUrl: string | null = null;
    if (taskImage) {
      //what we want in this functn to call supa to sent image to strge nd provide url
      imageUrl = await uploadImage(taskImage);
    }
    const { error } = await supabase.from("tasks").insert([
      {
        title: newTask.title,
        description: newTask.description,
        image_url: imageUrl, // ✅ include the image URL in the row
      },
    ]);

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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    //in this function when we called this function we want to store file inot state so we have to create state to show file
    if (e.target.files && e.target.files.length > 0) {
      setTaskImage(e.target.files[0]); //first image
    }
  };

  return (
    <div
      style={{
        maxWidth: "720px",
        margin: "2rem auto",
        padding: "2rem",
        backgroundColor: "#0d0d0d",
        color: "#f1f1f1",
        borderRadius: "16px",
        boxShadow: "0 8px 25px rgba(0,0,0,0.6)",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          marginBottom: "2rem",
          fontWeight: 600,
          letterSpacing: "0.5px",
          color: "#e4e4e7",
        }}
      >
        📝 Task
      </h2>

      {/* Form Section */}
      <form
        onSubmit={handleSubmit}
        style={{
          marginBottom: "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.9rem",
        }}
      >
        <input
          type="text"
          placeholder="Enter task title..."
          value={newTask.title}
          onChange={(e) =>
            setNewTask((prev) => ({ ...prev, title: e.target.value }))
          }
          style={{
            width: "100%",
            padding: "0.8rem",
            borderRadius: "10px",
            border: "1px solid #2a2a2a",
            backgroundColor: "#1a1a1a",
            color: "#fff",
            outline: "none",
            fontSize: "0.95rem",
            transition: "border 0.2s ease",
          }}
          onFocus={(e) => (e.target.style.border = "1px solid #3b82f6")}
          onBlur={(e) => (e.target.style.border = "1px solid #2a2a2a")}
        />

        <textarea
          placeholder="Write a short description..."
          value={newTask.description}
          onChange={(e) =>
            setNewTask((prev) => ({ ...prev, description: e.target.value }))
          }
          style={{
            width: "100%",
            padding: "0.8rem",
            borderRadius: "10px",
            border: "1px solid #2a2a2a",
            backgroundColor: "#1a1a1a",
            color: "#fff",
            outline: "none",
            minHeight: "90px",
            fontSize: "0.95rem",
            transition: "border 0.2s ease",
          }}
          onFocus={(e) => (e.target.style.border = "1px solid #3b82f6")}
          onBlur={(e) => (e.target.style.border = "1px solid #2a2a2a")}
        />

        {/* Upload Button */}
        <label
          htmlFor="file-upload"
          style={{
            display: "inline-block",
            padding: "10px 16px",
            backgroundColor: "#1e1e1e",
            border: "1px solid #333",
            color: "#ddd",
            borderRadius: "8px",
            cursor: "pointer",
            textAlign: "center",
            fontSize: "0.9rem",
            transition: "background 0.2s ease",
          }}
          onMouseEnter={(e) =>
            ((e.target as HTMLLabelElement).style.backgroundColor = "#272727")
          }
          onMouseLeave={(e) =>
            ((e.target as HTMLLabelElement).style.backgroundColor = "#1e1e1e")
          }
        >
          📸 Upload Image
        </label>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        {/* Add Task Button */}
        <button
          type="submit"
          style={{
            background: "linear-gradient(90deg, #3b82f6, #16a34a)",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "0.9rem",
            cursor: "pointer",
            fontWeight: 600,
            letterSpacing: "0.4px",
            transition: "transform 0.15s ease",
          }}
          onMouseEnter={(e) =>
            ((e.target as HTMLButtonElement).style.transform = "scale(1.03)")
          }
          onMouseLeave={(e) =>
            ((e.target as HTMLButtonElement).style.transform = "scale(1)")
          }
        >
          ➕ Add Task
        </button>
      </form>

      {/* Tasks List */}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {tasks.map((task) => (
          <li
            key={task.id}
            style={{
              backgroundColor: "#1a1a1a",
              border: "1px solid #2a2a2a",
              borderRadius: "12px",
              padding: "1rem",
              marginBottom: "1rem",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.01)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <h3 style={{ marginBottom: "0.4rem", color: "#e5e7eb" }}>
              {task.title}
            </h3>
            <p style={{ color: "#9ca3af", marginBottom: "0.8rem" }}>
              {task.description}
            </p>

            <textarea
              placeholder="Update description..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              style={{
                width: "100%",
                padding: "0.6rem",
                borderRadius: "8px",
                border: "1px solid #333",
                backgroundColor: "#111",
                color: "#fff",
                outline: "none",
                marginBottom: "0.8rem",
                fontSize: "0.9rem",
              }}
            />

            <div style={{ display: "flex", gap: "0.6rem" }}>
              <button
                style={{
                  flex: 1,
                  backgroundColor: "#16a34a",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "0.7rem",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
                onClick={() => updateTask(task.id)}
              >
                ✏️ Edit
              </button>
              <button
                style={{
                  flex: 1,
                  backgroundColor: "#dc2626",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "0.7rem",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
                onClick={() => deleteTask(task.id)}
              >
                🗑️ Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TaskList;
