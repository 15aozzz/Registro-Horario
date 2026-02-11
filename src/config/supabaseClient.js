import { createClient } from "@supabase/supabase-js";

// Obtener las credenciales desde las variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificar que las credenciales estén configuradas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "⚠️ ERROR: Faltan las credenciales de Supabase en el archivo .env",
  );
  console.error(
    "Por favor, configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY",
  );
}

// Crear y exportar el cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Función de prueba de conexión
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from("_test_").select("*").limit(1);

    // Si hay un error relacionado con que la tabla no existe, la conexión es exitosa
    if (error && (error.code === "PGRST204" || error.message.includes("Could not find the table"))) {
      // Este error es esperado si la tabla no existe, pero significa que la conexión funciona
      console.log("✅ Conexión a Supabase exitosa! (tabla de prueba no existe, lo cual es normal)");
      return true;
    } else if (error) {
      // Otro tipo de error (credenciales inválidas, red, etc.)
      console.error("❌ Error de conexión a Supabase:", error.message);
      console.error("Verifica tus credenciales en el archivo .env");
      return false;
    } else {
      console.log("✅ Conexión a Supabase exitosa!");
      return true;
    }
  } catch (err) {
    console.error("❌ Error al conectar con Supabase:", err);
    return false;
  }
};
