const axios = require("axios");
const querystring = require("querystring");

const usersDB = {
  users: require("../model/users.json"),
  setUsers: function (data) {
    this.users = data;
  },
};
const fsPromises = require("fs").promises;
const path = require("path");

const handleLogout = async (req, res) => {
  // On client, also delete the accessToken

  const cookies = req.cookies;
  if (!cookies?.__session) return res.sendStatus(204); //No content
  const refresh_token = cookies.__session;

  // Is refreshToken in db?
  const foundUser = usersDB.users.find(
    (person) => person.refreshToken === refresh_token
  );
  if (!foundUser) {
    res.clearCookie("__session", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });
    return res.sendStatus(204);
  }

  // Constrcting the keycloak server url and login payload
  const url = `${process.env.KEYCLOAK_BASEURL.replace(
    "{realm}",
    process.env.KEYCLOAK_REALM
  )}/logout`;

  const payload = {
    client_id: process.env.KEYCLOAK_CLIENT,
    client_secret: process.env.KEYCLOAK_CLIENT_SECRET,
    refresh_token,
  };

  try {
    // Calling the keycloak server logout
    await axios.post(url, querystring.stringify(payload));

    // Delete refreshToken and its user details in local file
    const activeUsers = usersDB.users.filter(
      (person) => person.refreshToken !== foundUser.refreshToken
    );
    usersDB.setUsers([...activeUsers]);
    await fsPromises.writeFile(
      path.join(__dirname, "..", "model", "users.json"),
      JSON.stringify(usersDB.users)
    );

    res.clearCookie("__session", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });
    res.sendStatus(204);
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

module.exports = { handleLogout };
