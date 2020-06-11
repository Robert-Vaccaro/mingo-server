var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
const dotenv = require('dotenv');
var passwordHash = require('password-hash');


dotenv.config();

mongoose.connect(process.env.MONGO_DB, {useNewUrlParser: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("connected")
});
var playerSchema = new mongoose.Schema({
  email_address:String,
  name: String,
  password: String,
  rankEasy: Number,
  rankHard: Number

});
var players = mongoose.model("players", playerSchema)
/* GET home page. */



router.get('/', function(req, res, next) {
  players.find().then(function(doc){
    rankArray = []
    if (doc){
      for(let i =0;i<20;i++){
        rankArray.push({name:doc[i].name,rankEasy:doc[i].rankEasy,rankHard:doc[i].rankHard})
      }
    }

    res.send(rankArray)
  })
});
router.get('/easy-rank', function(req, res, next) {
  players.find().sort({rankEasy : -1}).then(function(doc){
    rankArray = []
    if (doc){
      for(let i =0;i<20;i++){
        rankArray.push({name:doc[i].name,rankEasy:doc[i].rankEasy,rankHard:doc[i].rankHard})
      }
    }

    res.send([rankArray])
  })
});
router.get('/hard-rank', function(req, res, next) {
  players.find().sort({rankHard : -1}).then(function(doc){
    rankArray = []
    if (doc){
      for(let i =0;i<20;i++){
        rankArray.push({name:doc[i].name,rankEasy:doc[i].rankEasy,rankHard:doc[i].rankHard})
      }
    }

    res.send([rankArray])
  })
});
router.post('/find-ranking', function(req, res, next) {
  players.findOne({name: req.body.login}).then(function(doc){
    if (doc){
      res.send([doc.name,doc.rankEasy, doc.rankHard])
    } else{
      res.send(["User Not Found"])
    }
  })
});


router.post('/sign-up', function(req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  console.log(req.body.login)
  players.findOne({name: req.body.login}).then(function(doc){
    if (doc){
      console.log("user found - cannot continue")
      res.send(["User Exists"])
    } else{
      console.log("No User Found- will continue with sign up")
      var hashedPassword = passwordHash.generate(req.body.pw);
      var newPlayer = new players({
        name: (req.body.login),
        password: hashedPassword
        })
      newPlayer.save()
      res.send(["User Created"])
    }
  })
});




router.post('/login', function(req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  console.log(req.body.login)
  players.findOne({name: req.body.login}).then(function(doc){
    if (doc){
      
      let check = passwordHash.verify(req.body.pw, doc.password);
      if (check === true){
        res.send(["Login Successful"])
      } else {
        res.send(["Login Failed"])
      }
    } else{
      res.send(["user not found"])
    }
  })
});

// router.post('/password-reset', function(req, res, next) {
//   res.setHeader('Content-Type', 'application/json');
//   console.log(req.body.login)
//   players.findOne({name: req.body.login}).then(function(doc){
//     if (doc){
      
//       let check = passwordHash.verify(req.body.pw, doc.password);
//       if (check === true){
//         res.send(["Login Successful"])
//       } else {
//         res.send(["Login Failed"])
//       }
//     } else{
//       res.send(["user not found"])
//     }
//   })
// });


router.post('/update-rankings', function(req, res, next) {
  if (req.body.rankEasyScore){
    players.findOne({name: req.body.login}).then(function(doc){
      if (doc){
        console.log("user found")
        if (doc.rankEasy < req.body.rankEasyScore){
          doc.rankEasy = req.body.rankEasyScore
          doc.save()
          res.send([doc.rankEasy])
        }

      } else{
        console.log("No User Found- will continue with sign up")
        // var hashedPassword = passwordHash.generate(req.body.pw);
        // var newPlayer = new players({
        //   email_address:"yank",
        //   name: (req.body.login),
        //   password: hashedPassword
        //   })
        // newPlayer.save()
        // res.send(["User Created"])
      }
    })
  } 
  if (req.body.rankHardScore){
    players.findOne({name: req.body.login}).then(function(doc){
      if (doc){
        if (doc.rankHard < req.body.rankHardScore){
        console.log("user found")
        doc.rankHard = req.body.rankHardScore
        doc.save()
        res.send([doc.rankHard])
        }
      } else{
        console.log("No User Found- will continue with sign up")
        // var hashedPassword = passwordHash.generate(req.body.pw);
        // var newPlayer = new players({
        //   email_address:"yank",
        //   name: (req.body.login),
        //   password: hashedPassword
        //   })
        // newPlayer.save()
        // res.send(["User Created"])
      }
    })
  }
  

  console.log()
});



module.exports = router;
