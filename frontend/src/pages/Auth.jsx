import { useState } from "react";
import { supabase } from "@/lib/supabase";
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
      if (isLogin) {
        // Login with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        // Save session info
        localStorage.setItem("supabase_session", JSON.stringify(data.session));
        localStorage.setItem("access_token", data.session.access_token);
        
        // Get user profile from our users table
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('email', formData.email)
          .single();

        if (profileError) {
          console.warn('No user profile found, creating one...');
          // Create user profile if it doesn't exist
          const { data: newProfile, error: createError } = await supabase
            .from('users')
            .insert([{
              name: data.user.user_metadata?.name || data.user.email.split('@')[0],
              email: data.user.email,
              role: 'reseller',
              password_hash: 'supabase_managed',
            }])
            .select()
            .single();

          if (createError) throw createError;
          localStorage.setItem("user", JSON.stringify(newProfile));
          console.log('[Auth] User profile created and stored:', newProfile.email, 'Role:', newProfile.role);
          // Dispatch custom event to notify other components
          window.dispatchEvent(new CustomEvent('userLogin', { detail: newProfile }));
        } else {
          localStorage.setItem("user", JSON.stringify(userProfile));
          console.log('[Auth] User profile stored:', userProfile.email, 'Role:', userProfile.role);
          // Dispatch custom event to notify other components
          window.dispatchEvent(new CustomEvent('userLogin', { detail: userProfile }));
        }

        setSuccess("Login successful!");
      } else {
        // Register with Supabase
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name,
              role: formData.role,
            }
          }
        });

        if (error) throw error;

        // Save session info if user is confirmed
        if (data.session) {
          localStorage.setItem("supabase_session", JSON.stringify(data.session));
          localStorage.setItem("access_token", data.session.access_token);
        }
        
        // Create user profile in our users table
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .insert([{
            name: formData.name,
            email: formData.email,
            role: formData.role,
            password_hash: 'supabase_managed',
          }])
          .select()
          .single();

        if (profileError) throw profileError;

        localStorage.setItem("user", JSON.stringify(userProfile));
        console.log('[Auth] Registration complete:', userProfile.email, 'Role:', userProfile.role);
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('userLogin', { detail: userProfile }));
        setSuccess("Registration successful! Please check your email to verify your account.");
      }

      // Clear form
      setFormData({ name: "", email: "", password: "", role: "reseller" });

      // Show success message briefly before redirect
      setTimeout(() => {
        window.location.href = "/"; // Use full page refresh to ensure Navbar re-reads localStorage
      }, 1500);
    } catch (err) {
      console.error("Auth error:", err);
      if (err.message) {
        // Supabase error
        setError(err.message);
      } else {
        // Generic error
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
