import axios from "axios";
export default {
  getUser: () => axios.get("/api/user").then(response => response.data),
  getProject: id =>
    new Promise((resolve, reject) => {
      if (id === "4") {
        resolve({ unauthorized: true });
      } else {
        resolve({ title: "Final Project", id });
      }
    })
};
