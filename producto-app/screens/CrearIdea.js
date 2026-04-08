import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { supabase } from "../supabase";

// Cambia este valor si tu bucket en Supabase tiene otro nombre
const BUCKET = "imagenes";

export default function CrearIdea({ navigation }) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagen, setImagen] = useState(null);
  const [ubicacion, setUbicacion] = useState(null);

  const tomarFoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Permiso de cámara denegado");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // 👈 CLAVE
      quality: 0.6,
      allowsEditing: false, // evita conflictos
      base64: false,        // evita error de tipos
      exif: false,         // evita error de tipos
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImagen(result.assets[0].uri);
    }
  };

  const obtenerUbicacion = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Permiso de ubicación denegado");
      return;
    }

    const loc = await Location.getCurrentPositionAsync({});
    setUbicacion({ lat: loc.coords.latitude, lng: loc.coords.longitude });
  };

  const guardarIdea = async () => {
    if (!titulo || !descripcion) {
      alert("Completa todos los campos");
      return;
    }
    // comprobar que hay un usuario autenticado antes de continuar
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      alert("Debes iniciar sesión para guardar una idea.");
      navigation.navigate("LoginScreen");
      return;
    }

    let imagenUrl = null;

    if (imagen) {
      try {
        const imgName = `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;

        // En React Native / Expo fetch(...).blob() puede no existir.
        // Leemos como blob y convertimos a Uint8Array para subir.
        const response = await fetch(imagen);
        const blob = await response.blob();

        const { error: imgError } = await supabase.storage
          .from(BUCKET)
          .upload(imgName, blob, { contentType: "image/jpeg" });

        if (imgError) {
          console.error("Error al subir imagen:", imgError);
          // Mensaje más útil si el bucket no existe
          if (imgError.message && imgError.message.toLowerCase().includes("bucket not found")) {
            alert(
              "El bucket de Supabase '" + BUCKET + "' no existe. Crea un bucket con ese nombre en la sección Storage del panel de Supabase (y márcalo público si quieres URLs públicas)."
            );
          } else {
            alert("Error al subir imagen: " + imgError.message);
          }
          return;
        }

        const { data } = supabase.storage.from(BUCKET).getPublicUrl(imgName);
        imagenUrl = data.publicUrl;
      } catch (err) {
        alert("Error al procesar la imagen: " + err.message);
        return;
      }
    }

    // obtener usuario actual (si existe)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Preparar el registro base
    const baseRecord = {
      titulo,
      descripcion,
      imagen_url: imagenUrl,
      // si el usuario está autenticado, guardamos su id para políticas RLS
      user_id: user?.id || null,
    };

    // Si hay ubicación, intentamos agregar lat/long en el intento inicial
    const locRecord = ubicacion
      ? { latitud: ubicacion.lat, longitud: ubicacion.lng }
      : {};

    // Intento 1: insertar con lat/long (si existen)
    try {
      const { error } = await supabase.from("ideas").insert([{ ...baseRecord, ...locRecord }]);
      if (error) throw error;
      alert("Idea guardada");
      navigation.goBack();
      return;
    } catch (err) {
      // Si el error indica que faltan columnas latitud/longitud, reintentar sin ellas
      const msg = (err && err.message) || String(err);
      const missingLat = /latitud/i.test(msg) || /column "latitud" does not exist/i.test(msg);
      const missingLng = /longitud/i.test(msg) || /column "longitud" does not exist/i.test(msg);

      if ((missingLat || missingLng) && (locRecord && Object.keys(locRecord).length > 0)) {
        // Reintentar sin lat/long
        const { error: err2 } = await supabase.from("ideas").insert([baseRecord]);
        if (err2) {
          alert("Error al guardar idea: " + err2.message);
          return;
        }

        alert(
          "Idea guardada sin coordenadas porque las columnas 'latitud'/'longitud' no existen en la tabla.\n" +
            "Si quieres almacenar coordenadas, añade estas columnas en Supabase (SQL):\n\n" +
            "alter table public.ideas add column latitud double precision;\n" +
            "alter table public.ideas add column longitud double precision;"
        );
        navigation.goBack();
        return;
      }

      // Caso general: mostrar error
      alert("Error al guardar idea: " + msg);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nueva Idea</Text>

      <TextInput
        placeholder="Título de la idea"
        style={styles.input}
        value={titulo}
        onChangeText={setTitulo}
      />

      <TextInput
        placeholder="Descripción"
        style={styles.textArea}
        multiline
        value={descripcion}
        onChangeText={setDescripcion}
      />

      <TouchableOpacity style={styles.button} onPress={tomarFoto}>
        <Text style={styles.buttonText}>Tomar Foto</Text>
      </TouchableOpacity>

      {imagen && <Image source={{ uri: imagen }} style={styles.preview} />}

      <TouchableOpacity style={styles.button} onPress={obtenerUbicacion}>
        <Text style={styles.buttonText}>Obtener Ubicación</Text>
      </TouchableOpacity>

      {ubicacion && (
        <Text style={styles.location}>Lat: {ubicacion.lat} | Lng: {ubicacion.lng}</Text>
      )}

      <TouchableOpacity style={styles.saveButton} onPress={guardarIdea}>
        <Text style={styles.saveText}>Guardar Idea</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF", padding: 20 },
  title: { fontSize: 26, textAlign: "center", fontWeight: "600", color: "#3B3B3B", marginBottom: 20 },
  input: { borderWidth: 1, borderColor: "#EDEDED", borderRadius: 12, padding: 14, marginBottom: 12, backgroundColor: "#FFF" },
  textArea: { borderWidth: 1, borderColor: "#EDEDED", borderRadius: 12, padding: 14, marginBottom: 12, backgroundColor: "#FFF", height: 100 },
  button: { backgroundColor: "#F7C9D4", padding: 14, borderRadius: 14, alignItems: "center", marginTop: 5 },
  buttonText: { fontWeight: "600", color: "#3B3B3B" },
  preview: { width: '100%', height: 200, borderRadius: 14, marginTop: 10 },
  location: { textAlign: "center", marginVertical: 10, color: "#666" },
  saveButton: { backgroundColor: "#D8C8FF", padding: 16, borderRadius: 18, alignItems: "center", marginTop: 20 },
  saveText: { color: "#3B3B3B", fontWeight: "700" },
});
