import TaskList from "./components/TaskList";
import "./App.css";
import { Auth } from "./components/auth";
import { useEffect, useState } from "react";
import supabase from "./supabase-client";

const App = () => {
  const [session, setSession] = useState<any>(null);

  const fetchSession = async () => {
    //first get the current session
    const currentSession = await supabase.auth.getSession();
    console.log(currentSession);
    //when we get the session i want to setSession eaul to current session
    setSession(currentSession.data.session);
  };
  useEffect(() => {
    fetchSession();

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Cleanup to avoid memory leaks
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <>
      {session ? (
        <>
          <button onClick={logout}>Log Out</button>
          <TaskList className="tasklist-container" />{" "}
        </>
      ) : (
        <Auth className="auth-container" />
      )}
    </>
  );
};

export default App;
