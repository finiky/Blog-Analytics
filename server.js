const express = require("express");
const lodash = require("lodash");

const app = express();
const port = 5000;

app.get("/api/blog-stats", async (req, res) => {
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

    // Parse the response as JSON
    const blogData = await response.json();
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
      .status(500)
      .json({ error: "An error occurred while processing blog data" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
