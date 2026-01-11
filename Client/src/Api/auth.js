import axios from "axios";
import toast from "react-hot-toast";

// Login function
export async function login(data) {
  console.log("checking data", data)
  try {
    // Send login credentials to the API
    const loginResponse = await axios.post(
      `${import.meta.env.VITE_API_URL}/auth/login`,
      {
        email: data.email,
        password: data.password,
      }
    );
    console.log("checking response", loginResponse)

    const token = loginResponse.headers["x-auth-token"];
    console.log("checking token", token)
    if (!token) {
      toast.error("No token received from the server.");
      return;
    }

    // Store token in localStorage
    localStorage.setItem("token", token);

    try {
      // Fetch user data using the token
      const userResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/auth/protected`,
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );
      console.log("checking userResponse", userResponse)

      const userId = userResponse && userResponse.data && userResponse.data._id;
      console.log("checking userResponse.data", userResponse.data)
      if (userId) {
        // Store the user ID in localStorage
        localStorage.setItem("userId", userId);
        toast.success("Logged in successfully!");

        // Redirect to home after successful login
        window.location.href = "/";
      } else {
        toast.error("Failed to fetch user data.");
      }
    } catch (userError) {
      toast.error("Error retrieving user data.");
      console.error("User data fetch error:", userError);
    }
  } catch (loginError) {
    // Handle login failure (e.g., wrong credentials)
    const errorMessage =
      loginError.response?.data?.error || "Unable to connect to the server.";
    toast.error(errorMessage);
    console.error("Login error:", loginError);
  }
}

// Register function
export async function register(data) {
  try {
    const registerPromise = axios.post(
      `${import.meta.env.VITE_API_URL}/auth/register`,
      {
        name: data.name,
        email: data.email,
        password: data.password,
      }
    );

    // Show toast notifications based on the promise state
    toast.promise(registerPromise, {
      loading: "Registering...",
      success: "Account created successfully!",
      error: (error) => error?.response?.data?.error || "Failed to register.",
    });

    // Await completion to ensure proper flow
    await registerPromise;
  } catch (registerError) {
    console.error("Registration error:", registerError);
  }
}
