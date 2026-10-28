const express = require("express");
const app = express();
app.use(express.json());
app.use(express.static("public"));

const API_URL = "https://jsonplaceholder.typicode.com";
// Calling api to get users and posts from the external API
async function getUsers() {
    const response = await fetch(`${API_URL}/users`);
    if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
    }
    const users = await response.json();
    return users;
}

async function createPost(postData) {
    const response = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(postData)
    });
    if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
    }
    const result = await response.json();
    return result;
}

// Fetch users from the external API
app.get("/api/users", async (req, res) => {
    try {
        const users = await getUsers();

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error("Error fetching users:", error.message);

        res.status(502).json({
            success: false,
            message: "Failed to fetch users from external API"
        });
    }
});

// Fetch a specific user
app.get("/api/users/:id", async (req, res) => {
    try {
        const response = await fetch(
            `${API_URL}/users/${encodeURIComponent(req.params.id)}`
        );

        if (!response.ok) {
            return res.status(
                response.status === 404 ? 404 : 502
            ).json({
                success: false,
                message: "Failed to fetch user"
            });
        }

        const user = await response.json();

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error("Error fetching user:", error.message);

        res.status(502).json({
            success: false,
            message: "External API request failed"
        });
    }
});

// Create a post through the external API
app.post("/api/posts", async (req, res) => {
    try {
        const { title, body, userId } = req.body;

        if (
            typeof title !== "string" || !title.trim() ||
            typeof body !== "string" || !body.trim() ||
            !Number.isInteger(userId) || userId < 1
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid title, body, and positive integer userId are required"
            });
        }

        const post = await createPost({
            title,
            body,
            userId
        });

        res.status(201).json({
            success: true,
            message: "Post created successfully",
            data: post
        });
    } catch (error) {
        console.error("Error creating post:", error.message);

        res.status(502).json({
            success: false,
            message: "Failed to create post through external API"
        });
    }
});

// Start the server
const PORT = 3000;


app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});