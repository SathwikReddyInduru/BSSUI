export async function loadConfig() {
  const response = await fetch('/config/config.json');
  // const response = await fetch('/props_folder/server-port-mapping.json');
  // G:\app2\bssui_files\User_project\userManagement _project\sim-upload-app-enhanced-(props-file)\src\components\props_folder\server-port-mapping.json
  if (!response.ok) {
    throw new Error("Failed to load config");
  }
  return response.json();
}