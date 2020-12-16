const express = require('express')
const app = express()
const port = 4000

const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');

const config = require('./config/key');

const { auth } = require('./middleware/auth');
const { User } = require("./models/User");

//application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));

//application/json
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err))

app.get('/', (req, res) => {
  res.send('Hello World! How are you doing?')
})

app.get('/api/hello', (req, res) => {
  res.send("hello react")
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

app.post('/api/users/register', (req, res) => {

  // get register data from client and
  // put them into the database
  const user = new User(req.body)

  user.save((err, userInfo) => {
    if(err) return res.json({success: false, err})
    return res.status(200).json({
      success: true
    })
  })
})

app.post('/api/users/login', (req, res) => {

  // check if the email is in db
  User.findOne({ email: req.body.email }, (err, user) => {
    if(!user) {
      return res.json({
        loginSuccess: false,
        message: "No user found"
      })
    }
    // check if the password is correct
    user.comparePassword(req.body.password, (err, isMatch) => {
      if(!isMatch)
        return res.json({ loginSuccess: false, message: "Password is not correct" })

      // generate token
      user.generateToken((err, user) => {
        if(err) return res.status(400).send(err);

        // save token in Cookies using cookie-parser (or Local Storage)
        res.cookie("x_auth", user.token)
        .status(200)
        .json({ loginSuccess: true, userId: user._id })
      })
    })
  })
})

app.get('/api/users/auth', auth , (req, res) => {

  // authentification successful
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image
  })
})

app.get('/api/users/logout', auth , (req, res) => {

  // find user from db and delete token
  User.findOneAndUpdate({ _id: req.user._id },
    { token: "" }, (err, user) => {
      if (err) return res.json({ success: false, err })
      return res.status(200).send({
        success: true
      })
    })
})
