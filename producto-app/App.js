import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { supabase } from "./supabase";
import LoginScreen from "./screens/LoginScreen";
import ListaIdeas from "./screens/ListaIdeas";
import CrearIdea from "./screens/CrearIdea";

const Stack = createNativeStackNavigator();

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const authSubscription = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });

    return () => {
      if (authSubscription && authSubscription.data && authSubscription.data.subscription) {
        authSubscription.data.subscription.unsubscribe();
      }
    };
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session ? (
          <>
            <Stack.Screen name="ListaIdeas" component={ListaIdeas} />
            <Stack.Screen name="CrearIdea" component={CrearIdea} />
          </>
        ) : (
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
