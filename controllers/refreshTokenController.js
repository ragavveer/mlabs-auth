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

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.__session) return res.sendStatus(401);
  const refresh_token = cookies.__session;

  const foundUser = usersDB.users.find(
    (person) => person.refreshToken === refresh_token
  );
  if (!foundUser) return res.sendStatus(403); //Forbidden

  // Constrcting the keycloak server url and login payload
  const url = `${process.env.KEYCLOAK_BASEURL.replace(
    "{realm}",
    process.env.KEYCLOAK_REALM
  )}/token`;

  const payload = {
    client_id: process.env.KEYCLOAK_CLIENT,
    client_secret: process.env.KEYCLOAK_CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token,
  };

  try {
    // Calling the keycloak server login
    const response = await axios.post(url, querystring.stringify(payload));
    const { data } = response;
    // Sending the Access Token the client
    res.json({
      access_token: data.access_token,
      emailId: "veeraragavan.v@hcl.com",
      username: "Veeraragavan Veeranan",
      userId: 100,
      roles: ["SUPER_ADMIN"],
    });
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

module.exports = { handleRefreshToken };
