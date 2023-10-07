const express = require("express");
const lodash = require("lodash");
const cors = require("cors");
const app = express();
const memoize = require("memoizee");
const port = 5000;

app.use(cors());
app.use(express.json());

// Define a function to fetch and return blog data
const fetchBlogData = async () => {
  try {
    // Make the curl request to fetch blog data
    const response = await fetch(
      "https://intent-kit-16.hasura.app/api/rest/blogs",
      {
        method: "GET",
        headers: {
          "x-hasura-admin-secret":
            "32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6",
        },
      }
    );

    // Check for a successful response
    if (!response.ok) {
      throw new Error("Failed to fetch blog data");
    }

    // Parse the response as JSON
    const blogData = await response.json();
    return blogData;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

// Create a memoized version of the fetchBlogData function with a cache expiration of 10 minutes (600000 milliseconds)
const memoizedFetchBlogs = memoize(fetchBlogData, {
  promise: true,
  maxAge: 600000,
});

app.get("/api/blog-stats", async (req, res) => {
  try {
    // Make the curl request to fetch blog data
    const blogData = await memoizedFetchBlogs();

    // Perform analytics using Lodash
    const totalBlogs = blogData.blogs.length;
    const blogWithLongestTitle = lodash.maxBy(blogData.blogs, "title.length");
    const blogsWithPrivacy = lodash.filter(blogData.blogs, (blog) =>
      blog.title.toLowerCase().includes("privacy")
    );
    const uniqueBlogTitles = lodash.uniqBy(blogData.blogs, "title");

    // Prepare the response object
    const analyticsData = {
      totalBlogs,
      blogWithLongestTitle,
      numberOfBlogsWithPrivacy: blogsWithPrivacy.length,
      uniqueBlogTitles: uniqueBlogTitles.map((blog) => blog.title),
    };

    // Respond with the analytics data
    res.json(analyticsData);
  } catch (error) {
    console.error("Error:", error);
    res
      .status(400)
      .json({ error: "An error occurred while processing blog data" });
  }
});

app.get("/api/blog-search", async (req, res) => {
  try {
    const query = req.query.query;

    // Ensure the query parameter is provided
    if (!query || query.trim() === "") {
      return res
        .status(400)
        .json({ error: "Query parameter is missing or empty" });
    }

    // Get all the blogs
    const blogData = await memoizedFetchBlogs();

    // Perform the search based on the query (case-insensitive)
    const searchResults = blogData.blogs.filter((blog) => {
      const title = blog.title.toLowerCase();
      return title.includes(query.toLowerCase());
    });

    // Respond with the search results
    res.json(searchResults);
  } catch (error) {
    console.error("Error:", error);
    res
      .status(400)
      .json({ error: "An error occurred while searching for blogs" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
