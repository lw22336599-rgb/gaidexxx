import { createSSRApp } from "vue";
import App from "./App.vue";
import { onSessionInvalid } from "./auth/session";
import { useUserStore } from "./stores/user";

export function createApp() {
  const app = createSSRApp(App);
  onSessionInvalid(() => {
    useUserStore().resetLocal();
  });
  return {
    app,
  };
}
