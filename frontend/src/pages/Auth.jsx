import { useState } from "react";
import axios from "axios";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

const API_URL = "http://localhost:5000/api";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "reseller",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";

      console.log(
        "Sending request to:",
        API_URL + endpoint,
        "with data:",
        formData
      );

      const { data } = await axios.post(API_URL + endpoint, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Response:", data);

      // Store token and user data in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setSuccess(isLogin ? "Login successful!" : "Registration successful!");

      // Clear form
      setFormData({ name: "", email: "", password: "" });

      // Show success message briefly before redirect
      setTimeout(() => {
        window.location.href = "/"; // Use full page refresh to ensure Navbar re-reads localStorage
      }, 1000);
    } catch (err) {
      console.error("Auth error:", err);
      if (err.response) {
        // Server responded with an error
        setError(err.response.data.message || "Server error occurred");
      } else if (err.request) {
        // Request was made but no response received
        setError("Cannot connect to server. Please try again later.");
      } else {
        // Error in request setup
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>
          {isLogin ? "Login" : "Register"}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {!isLogin && (
              <TextField
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
              />
            )}

            {!isLogin && (
              <FormControl fullWidth>
                <InputLabel id="role-label">Role</InputLabel>
                <Select
                  labelId="role-label"
                  label="Role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <MenuItem value="reseller">Reseller</MenuItem>
                  <MenuItem value="manufacturer">Manufacturer</MenuItem>
                </Select>
              </FormControl>
            )}

            <TextField
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
            />

            <TextField
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              fullWidth
              required
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              disabled={loading}
            >
              {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
            </Button>
          </Stack>
        </form>

        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Button onClick={() => setIsLogin(!isLogin)} color="primary">
            {isLogin
              ? "Don't have an account? Register"
              : "Already have an account? Login"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
