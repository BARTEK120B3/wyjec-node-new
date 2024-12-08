const express = require('express')
const path = require('path');
const app = express()

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'songs')));

app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, 'views'));

//routing

const authRouter = require('./routes/auth')
const homeRouter = require('./routes/home')

//

app.use("/auth", authRouter)
app.use("/home", homeRouter)

app.get('/', (req, res) => {
    res.redirect('/auth/login')
})

app.listen(3000)