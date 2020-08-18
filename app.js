const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate')
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
var findOrCreate = require('mongoose-findorcreate')


const app = express();

app.set('view engine','ejs')
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + '/public'));
app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: true,
}))

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/ProjectDB", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useCreateIndex', true)


const vendorRegisterSchema = new mongoose.Schema({
  username : Number,
  email:String,
  password : String,
  description: String

})


const userRegisterSchema = new mongoose.Schema({
  username: String,
  email:String,
  password : String
})


const itemsSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number
})

userRegisterSchema.plugin(passportLocalMongoose);
userRegisterSchema.plugin(findOrCreate);

vendorRegisterSchema.plugin(passportLocalMongoose);
vendorRegisterSchema.plugin(findOrCreate);

const User = mongoose.model('User', userRegisterSchema);
const Vendor = mongoose.model('Vendor', vendorRegisterSchema);
const List = mongoose.model('List', itemsSchema);

const itemOne = new List({
  title: "pen",
  description:"my pen is good",
  price:25
})

const itemTwo = new List({
  title: "pencil",
  description:"pencil is ok",
  price:30
})

let itemsArray = [itemOne, itemTwo]

passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});




app.get("/", function(req, res)
{
  res.render("home",{});
});

app.get("/vendor/login", function(req, res)
{
  res.render("vendorLogin",{})
})

app.get("/user/login", function(req, res)
{
  res.render("UserLogin",{})
})

app.get("/user/Register", function(req, res)
{
  res.render("userRegister",{})
})

app.get("/vendor/Register", function(req, res)
{
  res.render("vendorRegister",{})
})

app.get("/vendor/list", function(req, res){
  List.find({}, function(err, docs){
  if(docs.length === 0)
  {
    List.insertMany(itemsArray, function(err)
    {
      if(err)
      {
        console.log(err);
      }
      else
      {
        console.log("successfuly inserted the items in the database");
      }
    })
    res.redirect("/vendor/list");
  }
  else
  {
    res.render("list", { newListItems: docs}) ;
  }
});
});


app.post("/user/Register", function(req, res)
{
 User.register({username:req.body.username, active: false}, req.body.password, function(err, user) {
  if(err){
    console.log(err);
    res.redirect("/user/Register");
  }
  else{


    res.redirect("/vendor/list");

  }

})
});

app.post("/vendor/Register", function(req, res)
{
 Vendor.register({username:req.body.username, active: false}, req.body.password, function(err, user) {
  if(err){
    res.send(err);
  }
  else{


    res.redirect("/vendor/list");

  }

})
});

app.post("/user/login", function(req, res)
{
 const user = new User({
   username: req.body.username,
   password: req.body.password
 })

 req.login(user, function(err)
{
  if(err)
  {
    console.log(err);
  }
  else
  {
    res.redirect("/vendor/list");
  
  }
})
});

app.post("/vendor/login", function(req, res)
{
 const vendor = new Vendor({
   username: req.body.username,
   password: req.body.password
 })

 req.login(vendor, function(err)
{
  if(err)
  {
    console.log(err);
  }
  else
  {


    res.redirect("/vendor/list");

  }
})
});

app.post("/vendor/list",function(req, res)
{
  const newItem = new List({
    title: req.body.title
  })
  newItem.save();
  res.redirect("/vendor/list")
})



app.listen(3000, function()
{
  console.log("server started on port 3000");
});
