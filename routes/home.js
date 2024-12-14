const express = require('express')
const mysql = require('mysql2')
const cookieParser = require('cookie-parser')
const path = require('path')
const fs = require('fs')
const multer = require('multer')

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
      console.error('connection error home:', err)
      return;
    }
    console.log('database connected home')
  })

//

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = './uploads';
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath);
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  
// Middleware Multer

const upload = multer({ storage });

//

router.get('/image/:id',(req,res) => {
    id = req.params.id
    connection.query(`SELECT image FROM song WHERE id = ${id};`, (err, results) => {
        if (err){
            console.error('we have an problem with reading img of a song')
            console.error(err)
            return
        }
        const img = results.at(0).image
        res.setHeader('Content-Type', 'image/jpeg')
        res.send(img)
    })
})

router.get('/files', (req, res) => {
    connection.query(`SELECT * FROM song WHERE personId = ${req.cookies.email};`, (err, results) => {
        if (err) {
            console.error('we have an error with loading songs')
            console.error(err)
            return
        }
        const data = {
            songs: results,
            personId: req.cookies.email
        }
        res.render('files', data)
        console.log('files')
    })
})

router.get('/find', (req, res) => {
    res.render('find')
    console.log('find')
})

router.get('/homepage', (req, res) => {
    res.render('homepage')
    console.log('homepage')
})

router.get('/settings', (req, res) => {
    res.render('settings')
    console.log('settings')
})

router.get('/add-song', (req, res) => {
    res.render('add-song')
    console.log('add-song')
})

router.post('/add-song', upload.fields([{ name: 'song' }, { name: 'image' }]), (req, res) => {
    const {title} = req.body;
    const song = req.files['song']?.[0]
    const image = req.files['image']?.[0]
    connection.query(`INSERT INTO song VALUES (null, '${title}', ${req.cookies.email});`, (err, results) => {
        if (!fs.existsSync('./songs')){
            fs.mkdirSync('./songs')
        }
        if (!fs.existsSync(`./songs/${req.cookies.email}`)){
            fs.mkdirSync(`./songs/${req.cookies.email}`)
        }
        connection.query('SELECT id FROM song order by id desc limit 1;', (err, results) => {
            if (err){
                console.error(err)
                return
            }
            const songId = results.at(0).id
            const songFolder = `./songs/${req.cookies.email}/${songId}`
            fs.mkdirSync(songFolder)

            const newSongName = 'song.mp3'
            const newImageName = 'cover.jpg'

            const songPath = path.join(songFolder, newSongName)
            const imagePath = path.join(songFolder, newImageName)

            fs.writeFileSync(path.join(songFolder, 'title.txt'), title)
            fs.renameSync(song.path, songPath)
            fs.renameSync(image.path, imagePath)
            
            console.log('files saved')
            res.redirect('files')
        })
    })
})

module.exports = router