const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
var randomstring = require("randomstring");
const bodyParser = require('body-parser');

const app = express();
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'views')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

let USERS = [];
let URLS = [];

// Read data from file, or initialize to empty array if file does not exist
try {
    USERS = JSON.parse(fs.readFileSync('users.json', 'utf8'));
    URLS = JSON.parse(fs.readFileSync('urls.json', 'utf8'));
} catch {
    USERS = [];
    URLS = [];
}

const SECRET = 'urlurl';

const authenticateJwt = (req, res, next) => {
    const authToken = req.cookies.token;
    //console.log("token"+req.cookies.token)
    if (authToken) {
        jwt.verify(authToken, SECRET, (err, user) => {
            if (err) {
                //console.log('err jwt'+user)
                return res.sendStatus(403);
            }
            //console.log("jwt"+user)
            req.user = user;
            next();
        });
    } else {
        res.redirect('/login');
    }
};

// User routes
// all set
app.post('/signup', (req, res) => {
    const { username, password, password2 } = req.body;
    if (password != password2) res.status(403).json({ message: 'Write same password' });
    const user = USERS.find(u => u.username === username);
    if (user) {
        res.status(403).json({ message: 'User already exists' });
    } else {
        const newUser = { username, password };
        USERS.push(newUser);
        fs.writeFileSync('users.json', JSON.stringify(USERS));
        const token = jwt.sign({ username, role: 'user' }, SECRET, { expiresIn: '1h' });
        //res.json({ message: 'User created successfully', token });
        res.redirect('/')
    }
});

// all set
app.get('/login', (req, res) => {
    res.render('login');
})

// all set
app.get('/signup', (req, res) => {
    res.render('signup');
})

// all set
app.get('/', authenticateJwt, (req, res) => {
    const user = USERS.find(u => u.username === req.user.username);
    res.render('home', { urls: user.shortUrls });
})

// all set
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = USERS.find(u => u.username === username && u.password === password);
    if (user) {
        const token = jwt.sign({ username, role: 'user' }, SECRET, { expiresIn: '24h' });
        res.cookie('token', token, {
            maxAge: 86400000,
            httpOnly: true,
        });
        //res.json({ message: 'Logged in successfully', token });
        res.redirect('/')
    } else {
        res.status(403).json({ message: 'Invalid username or password' });
    }
});

// all set
app.post('/make', authenticateJwt, (req, res) => {

    const user = USERS.find(u => u.username === req.user.username);

    if (!user.shortUrls) {
        user.shortUrls = [];
    }
    // req.url passed
    let hash = randomstring.generate(7);
    user.shortUrls.push({ url: req.body.urll, hash: hash });
    URLS.push({ url: req.body.urll, hash: hash })
    fs.writeFileSync('users.json', JSON.stringify(USERS));
    fs.writeFileSync('urls.json', JSON.stringify(URLS));
    //res.json({ message: 'Url created successfully', hash });
    res.redirect('/')
});

// all set
app.get('/:hash', (req, res) => {
    const url = URLS.find(u => u.hash === req.params.hash);
    if (url) {
        res.render('redirect', { url: url.url });
    } else {
        res.status(403).json({ message: 'Url not found' });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));
