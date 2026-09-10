const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html', 'login.html'));
});

app.get('/rep', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'rep.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('*', (req, res) => {
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
