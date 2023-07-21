const axios = require("axios");
const querystring = require("querystring");

const usersDB = {
  users: require("../model/users.json"),
  setUsers: function (data) {
    this.users = data;
  },
};

const jwt = require("jsonwebtoken");
require("dotenv").config();
const fsPromises = require("fs").promises;
const path = require("path");

const handleLogin = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res
      .status(400)
      .json({ message: "Username and password are required." });

  // Constrcting the keycloak server url and login payload
  const url = `${process.env.KEYCLOAK_BASEURL.replace(
    "{realm}",
    process.env.KEYCLOAK_REALM
  )}/token`;

  const payload = {
    client_id: process.env.KEYCLOAK_CLIENT,
    client_secret: process.env.KEYCLOAK_CLIENT_SECRET,
    grant_type: "password",
    username,
    password,
  };

  try {
    // Calling the keycloak server login
    const response = await axios.post(url, querystring.stringify(payload));
    const { data } = response;
    // TODO use the redis here instead of local file.
    // Constructing the user data to store the loggedin user Refresh Token
    const user = { username, password, refreshToken: data.refresh_token };
    const otherUsers = usersDB.users.filter(
      (person) => person.username !== user.username
    );
    usersDB.setUsers([user, ...otherUsers]);
    // Updating the local file
    await fsPromises.writeFile(
      path.join(__dirname, "..", "model", "users.json"),
      JSON.stringify(usersDB.users)
    );
    // Creating http only to add the Refresh Token
    res.cookie("__session", data.refresh_token, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: data.refresh_expires_in * 1000,
    });
    // Sending the Access Token the client
    res.json({ accessToken: data.access_token });
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(error.response.data);
      console.log(error.response.status);
      return res.status(error.response.status).json(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log(error.request);
      return res.sendStatus(400);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log("Error", error.message);
      return res.sendStatus(500);
    }
  }
};

module.exports = { handleLogin };
