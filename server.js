const express = require("express");
const app = express();
const cors = require("cors");
const axios = require("axios");

// Middlewares
app.use(cors());
app.use(express.json());

app.get("/api/blog-stats", async (req, res) => {
  try {
    // Define the curl request options
    const curlOptions = {
      method: "GET",
      url: "https://intent-kit-16.hasura.app/api/rest/blogs",
      headers: {
        "x-hasura-admin-secret":
          "32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6",
      },
    };

    // Make the curl request using axios
    const response = await axios(curlOptions);

    // Handle the response data
    const blogData = response.data;

    // Respond with the fetched blog data
    res.json(blogData);
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching blog data" });
  }
});

app.listen(5000, () => {
  console.log(`Server listening on port: 5000`);
});
