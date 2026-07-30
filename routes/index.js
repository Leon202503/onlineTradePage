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

router.get('/product', function(req, res) {
  res.sendFile(path.join(__dirname, '..', 'public', 'product.html'));
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

router.get("/api/getProducts",async(req,res)=>{
  try {
    let sql = `
      SELECT 
        id,
        name,
        category,
        price,
        rating,
        badge,
        image_url AS image,
        stock,
        status,
        created_at
        FROM products 
          WHERE status=1 
            ORDER BY id DESC
    `;
    const [products] = await db.promise().query(sql);


    return res.status(200).json({
      success:true,
      products:products
    })
  } catch (error) {
      console.error(error);
      return res.status(500).json({
      success: false,
      message: "Failed to load products"
    });
  }
})

router.get("/api/getProduct", async (req, res) => {
  const productId = Number(req.query.id);

  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID"
    });
  }

  try {
    const sql = `
      SELECT
        id,
        name,
        category,
        description,
        price,
        rating,
        badge,
        image_url AS image,
        stock,
        status,
        created_at
      FROM products
      WHERE id = ? AND status = 1
      LIMIT 1
    `;
    const sql2 = `
      SELECT 
        id,
        rating,
        title,
        comment,
        created_at
      FROM product_reviews 
        WHERE product_id = ?;
    ` ;
    const [products] = await db.promise().query(sql, [productId]);
    const [reviews] = await db.promise().query(sql2, [productId]);
    
    // calculate average
    let ave = 0;
    if(reviews.length == 0)ave = 0;
    else {
      let total = reviews.reduce((sum,review)=>{
        return sum += review.rating;
      },0)
      ave = total / reviews.length;
    }
    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // count breakdown
    let ratingCount = reviews.reduce((count,review)=>{
      count[review.rating]++;
      return count;
    },{
      1:0,
      2:0,
      3:0,
      4:0,
      5:0
    });


    return res.status(200).json({
      success: true,
      product: {
        ...products[0],
        rating:ave,
        
        reviewSummary:{
        average:ave,
        total:reviews.length,
        breakdown:ratingCount
      },

      reviews:reviews
    }
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to load product"
    });
  }
});

router.post('/api/addReview',async(req,res)=>{
  if(!req.session.user){
    return res.status(401).json({
      success:false,
      message:"Please login in first"
    })
  }
  const productId = Number(req.body.productId);
  const rating = Number(req.body.rating);
  const title = String(req.body.title || "").trim();
  const comment = String(req.body.comment || "").trim();
  const userId = req.session.user.id;
  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID"
    });
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      message: "Rating must be between 1 and 5"
    });
  }

  if (!title || !comment) {
    return res.status(400).json({
      success: false,
      message: "Please complete all information"
    });
  }

  if (title.length > 100 || comment.length > 1000) {
    return res.status(400).json({
      success: false,
      message: "Review content is too long"
    });
  }
  try {
    let sql = `
      INSERT INTO product_reviews
      (
        product_id,
        customer_id,
        rating,
        title,
        comment,
        status
      )
      VALUES 
      (?,?,?,?,?,?)
    `;
    const [result] = await db.promise().execute(sql,
      [productId,userId,rating,title,comment,1]);
    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      reviewId: result.insertId
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success:false,
      message:"Failed to add reviews"
    })
  }
})

router.post('/api/createOrder',async(req,res)=>{
  
})
module.exports = router;
