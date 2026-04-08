import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from "react-native";
import { supabase } from "../supabase";

export default function ListaIdeas({ navigation }) {
  const [ideas, setIdeas] = useState([]);

  const cargarIdeas = async () => {
    const { data, error } = await supabase
      .from("ideas")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error cargando ideas:", error);
      // Mostrar alerta ligera al usuario
      alert("Error cargando ideas: " + error.message);
      setIdeas([]);
      return;
    }

    setIdeas(data || []);
  };

  useEffect(() => {
    cargarIdeas();

    // recargar cuando la pantalla recibe foco (después de crear una idea)
    const unsubscribe = navigation.addListener("focus", () => {
      cargarIdeas();
    });

    return unsubscribe;
  }, [navigation]);

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Ideas</Text>

      <FlatList
        data={ideas}
        keyExtractor={(item, index) => (item && item.id ? String(item.id) : String(index))}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.imagen_url && <Image source={{ uri: item.imagen_url }} style={styles.image} />}
            <Text style={styles.cardTitle}>{item.titulo}</Text>
            <Text style={styles.cardDesc}>{item.descripcion}</Text>
          </View>
        )}
      />

      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("CrearIdea")}>
        <Text style={styles.addButtonText}>+ Crear Idea</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={cerrarSesion}>
        <Text style={styles.logout}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF", padding: 20 },
  title: { fontSize: 26, fontWeight: "600", textAlign: "center", marginBottom: 20, color: "#3B3B3B" },
  card: { backgroundColor: "#F7C9D4", padding: 18, borderRadius: 14, marginBottom: 12 },
  cardTitle: { fontSize: 18, fontWeight: "600", color: "#3B3B3B" },
  cardDesc: { color: "#3B3B3B", marginTop: 4 },
  image: { width: '100%', height: 150, borderRadius: 12, marginBottom: 10 },
  addButton: { backgroundColor: "#D8C8FF", padding: 14, borderRadius: 14, alignItems: "center", marginTop: 10 },
  addButtonText: { fontWeight: "600", color: "#3B3B3B" },
  logout: { marginTop: 20, textAlign: "center", color: "#999" },
});
