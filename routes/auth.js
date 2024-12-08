const express = require('express')
const mysql = require('mysql2')
const cookieParser = require('cookie-parser')
const router = express.Router()

// middlewares

router.use(cookieParser())

// database connection

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'wyjec'
})

connection.connect((err) => {
    if (err) {
      console.error('connection error auth:', err)
      return;
    }
    console.log('database connected auth')
  })

//

router.get('/login', (req, res) => {
    if (req.cookies.email){
        res.redirect('/home/homepage') 
        return
    }
    res.render('login')
    console.log('login')
})

router.post('/login', (req,res) => {
    const {email, password} = req.body;
    if (req.cookies.email){
        res.redirect('/home/homepage') 
    }
    else {
        if (email != '' && password != ''){
            connection.query(`SELECT password, id FROM person WHERE email LIKE '${email}';`, (err, results) => {
                if (err) {
                    console.error('we have an problem with getting users password')
                    console.error(err)
                    return
                }
                if (results.length > 0){
                    if (results.at(0).password == password){
                        const id = results.at(0).id;
                        res.cookie('email', `${id}`, {
                             path: '/',
                             maxAge: 3600000
                            });
                        res.redirect('/home/homepage')
                    }
                    else {
                        console.log('wrong password')
                        res.redirect('login')
                    }
                }
                else if (results.length == 0) {
                    console.log('there are no users like this')
                    res.redirect('login')
                }
                else {
                    console.error('there is more than one user with this email')
                    res.redirect('login')
                }
            })
        }
    }
})

router.get('/register', (req, res) => {
    res.render('register')
    console.log('register')
})

router.post('/register', (req, res) => {
    const {email, password} = req.body;
    console.log(email,password)
    if (req.cookies.email){
        res.redirect('login')
    }
    else {
        if (email != '' && password != ''){
            connection.query(`SELECT * FROM person WHERE email LIKE '${email}';`, (err, results) => {
                // checking if email already exists in the database
                if (err){
                    console.error('we have a problem with checking if email exists')
                    return
                }
                console.log("ile rekordow: ", results.length)
                if (results.length == 0){
                    // creating user
                    connection.query(`INSERT INTO person (id, email, password) VALUES (null, '${email}', '${password}');`, (err, results) => {
                        if (err) {
                            console.log('we have an error')
                            console.error(err)
                            return
                        }
                        console.log(results)
                        console.log('user created')
                        res.redirect('login')
                    })
                
            }
            else{
                console.log('user already exists')
                res.redirect('register')
            }})
        }
        else {
            res.redirect('register', {info: 'Należy wypełnić wszystkie pola'})
        }
    }
})

module.exports = router

