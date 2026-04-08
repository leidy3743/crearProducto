import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { supabase } from "../supabase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");

  const handleAuth = async () => {
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error) alert("Sesión iniciada");
      else alert(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (!error) alert("Cuenta creada, revisa tu correo para confirmar.");
      else alert(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Ideas</Text>
      <Text style={styles.subtitle}>{mode === "login" ? "Inicia sesión" : "Crear cuenta"}</Text>

      <TextInput
        style={styles.input}
        placeholder="Correo"
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleAuth}>
        <Text style={styles.buttonText}>{mode === "login" ? "Ingresar" : "Registrarme"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setMode(mode === "login" ? "signup" : "login")}>
        <Text style={styles.link}>{mode === "login" ? "Crear cuenta nueva" : "Ya tengo cuenta"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF", justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 30, fontWeight: "600", marginBottom: 20, color: "#3B3B3B" },
  subtitle: { fontSize: 18, color: "#7A7A7A", marginBottom: 20 },
  input: { width: '80%', borderWidth: 1, borderColor: "#EDEDED", borderRadius: 10, padding: 14, marginVertical: 8, backgroundColor: "#FFF" },
  button: { backgroundColor: "#F7C9D4", padding: 14, borderRadius: 14, width: '80%', alignItems: "center", marginTop: 10 },
  buttonText: { fontSize: 16, fontWeight: "600", color: "#3B3B3B" },
  link: { color: "#D8C8FF", marginTop: 16, fontSize: 16 }
});
