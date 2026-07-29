var express = require('express');
var path = require('path');
var router = express.Router();
const db = require("../db.js");
const bcrypt = require('bcryptjs');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

router.get('/login', function(req, res) {
  res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
});

router.get('/register', function(req, res) {
  res.sendFile(path.join(__dirname, '..', 'public', 'register.html'));
});

router.post('/api/register',async(req,res)=>{
  const {
    firstName,lastName,
    email,password,confirmPassword,terms
  } = req.body;
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({
      message: "Please complete all required fields"
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      message: "Password must be at least 8 characters"
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      message: "Passwords do not match"
    });
  }

  if (terms !== "accepted") {
    return res.status(400).json({
      message: "You must accept the terms"
    });
  }

  try {
    const passwordHash = await bcrypt.hash(password,12);
    const sql = `
      INSERT INTO customers (first_name,last_name,email,password,terms)
      VALUES (?,?,?,?,?)
    `;

    db.query(sql,
      [firstName,lastName,email,passwordHash,1],
      (err,result)=>{
        if(err){
          console.error(err);
          return res.status(500).json({
              message:"Failed to register"
          });
        }
        else {
          return res.redirect(303, "/login");
        }
    })
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to register"
    });
  } 
})

router.post('/api/login',async(req,res)=>{
  let {email,password} = req.body;
  try {
    const sql = `
      SELECT id,first_name,last_name,email,password
      FROM customers
      WHERE email = ?
      LIMIT 1
    `;
    let [result] = await db.promise().query(sql,[email]);
    if(result.length === 0){
      return res.status(404).json({
        message:"用户不存在"
      });
    }
    const isSame = await bcrypt.compare(password,result[0].password);
    if(!isSame){
      return res.status(401).json({
        message:"密码错误"
      });
    }
    else {
      req.session.regenerate(err=>{
        if(err){
          console.error(err);
          return res.status(500).send("Session error");
        }
        req.session.user = {
          id:result[0].id,
          firstName:result[0].first_name,
          lastName:result[0].last_name,
          email:result[0].email
        }
        req.session.save(err => {
          if (err) {
            console.error(err);

            return res.status(500).json({
              message: "Session 保存失败"
            });
          }
          return res.redirect(303, "/");
        });
      })
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({
        message:"服务器错误"
    });
  }
  
})

router.get('/api/check-login', (req, res) => {
  if (!req.session.user) {
    return res.json({
      loggedIn: false
    });
  }

  return res.json({
    loggedIn: true,
    user: req.session.user
  });
});

router.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        message: "退出登录失败"
      });
    }

    res.clearCookie('northstar.sid');
    return res.redirect(303, '/login');
  });
});

module.exports = router;
