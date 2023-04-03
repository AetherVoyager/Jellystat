import React, { useState, useEffect } from "react";
import axios from "axios";
import Config from "../lib/config";
import CryptoJS from 'crypto-js';
import "./css/setup.css";
// import LibrarySync from "./components/settings/librarySync";

// import Loading from './components/loading';

function Login() {
  const [config, setConfig] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [processing, setProcessing] = useState(false);
  const [submitButtonText, setsubmitButtonText] = useState("Login");

  function handleFormChange(event) {
    setFormValues({ ...formValues, [event.target.name]: event.target.value });
  }


  async function handleFormSubmit(event) {
    setProcessing(true);
    event.preventDefault();


    let hashedPassword= CryptoJS.SHA3(formValues.password).toString();

    console.log(hashedPassword);

    axios
      .post("/auth/login", {
        username:formValues.username,
        password: hashedPassword

      }, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then(async (response) => {

        localStorage.setItem('token',response.data.token);
        setsubmitButtonText("Success");
        setProcessing(false);
        window.location.reload();
        return;
      })
      .catch((error) => {
        let errorMessage= `Error : ${error.response.status}`;
        if (error.code === "ERR_NETWORK") {
          errorMessage = `Unable to connect to Jellyfin Server`;
        } else if (error.response.status === 401) {
          errorMessage = `Invalid Username or Password`;
        } else if (error.response.status === 404) {
          errorMessage = `Error ${error.response.status}: The requested URL was not found.`;
        }
        setsubmitButtonText(errorMessage);
        setProcessing(false);
      });
  }

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const newConfig = await Config();
        setConfig(newConfig);
      } catch (error) {
        if (error.code === "ERR_NETWORK") {
          console.log(error);
        }
      }
    };

    if (!config) {
      fetchConfig();
    }
  }, [config]);

  return (
    <section>
      <div className="form-box">
        <form onSubmit={handleFormSubmit}>
          <h2>Login</h2>
          <div className="inputbox">
            <input
              type="text"
              id="username"
              name="username"
              value={formValues.username || ""}
              onChange={handleFormChange}
              required
            />
            <label htmlFor="username">Username</label>
          </div>
          <div className="inputbox">
            <input
              type="text"
              id="password"
              name="password"
              value={formValues.password || ""}
              onChange={handleFormChange}
              required
            />
            <label htmlFor="password">Password</label>
          </div>

          <button type="submit" className="setup-button">
            {processing ? "Validating..." : submitButtonText}
          </button>
        </form>
      </div>
    </section>
  );
}

export default Login;