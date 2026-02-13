import admin from "firebase-admin";
import serviceAccount from "../shuttlemate-9bedd-firebase-adminsdk-e9fzv-67556179a8.json" with { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
