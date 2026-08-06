const app = require('./api/index');
const PORT = process.env.PORT || 3000;

// Start Server for local development
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
