
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "./firebaseConfig";

type Props = {
  onLoginSuccess: () => void;
};

export default function AuthScreen({ onLoginSuccess }: Props) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      Alert.alert("Missing details", "Email aur password enter karo.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Invalid password", "Password kam se kam 6 characters ka hona chahiye.");
      return;
    }

    setLoading(true);

    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, cleanEmail, password);
        Alert.alert("Success", "Account create ho gaya!");
      } else {
        await signInWithEmailAndPassword(auth, cleanEmail, password);
        Alert.alert("Success", "Login successful!");
      }

      onLoginSuccess();
    } catch (error: any) {
      const message =
        error.code === "auth/email-already-in-use"
          ? "Is email se account pehle se bana hua hai. Login karo."
          : error.code === "auth/invalid-credential"
          ? "Email ya password galat hai."
          : error.code === "auth/weak-password"
          ? "Thoda strong password rakho."
          : error.code === "auth/network-request-failed"
          ? "Internet connection check karo."
          : error.message || "Kuch galat ho gaya.";

      Alert.alert("Authentication error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>CALIFNCO</Text>
      <Text style={styles.heading}>
        {isSignup ? "Create Your Account" : "Welcome Back"}
      </Text>
      <Text style={styles.subtitle}>
        {isSignup ? "Sign up to get started" : "Login to continue"}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TextInput
        style={styles.input}
        placeholder="Password (minimum 6 characters)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleAuth}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {isSignup ? "Create Account" : "Login"}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setIsSignup(!isSignup)}
        style={styles.switchButton}
      >
        <Text style={styles.switchText}>
          {isSignup
            ? "Already have an account? Login"
            : "New user? Create an account"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F8FC",
    justifyContent: "center",
    padding: 24,
  },
  brand: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#087F8C",
    textAlign: "center",
    marginBottom: 24,
    letterSpacing: 2,
  },
  heading: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#172B4D",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#667085",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 28,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 10,
    padding: 15,
    marginBottom: 14,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#087F8C",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  switchButton: {
    padding: 18,
    alignItems: "center",
  },
  switchText: {
    color: "#087F8C",
    fontSize: 14,
    fontWeight: "600",
  },
});