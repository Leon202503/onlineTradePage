# Northstar Supply

Northstar Supply is a responsive online shopping demo built with native HTML, CSS, and JavaScript, backed by Express and MySQL. It includes a product storefront, registration and sign-in pages, password hashing, session-based authentication, and an account popover for signed-in users.

Repository: [Leon202503/onlineTradePage](https://github.com/Leon202503/onlineTradePage)

## Features

### Storefront

- Responsive desktop and mobile layouts
- Product category filters
- Product search and sorting
- Favorites interaction
- Shopping bag drawer
- Quantity and subtotal calculation
- Free-shipping progress indicator
- Newsletter form

### Authentication

- Customer registration
- Client-side and server-side form validation
- Password hashing with `bcryptjs`
- Customer sign-in
- Session-based login state
- Signed-in account popover
- Sign-out support

## Current Status

The storefront currently uses demonstration product data defined in `public/javascripts/shop.js`. Product management and product loading from MySQL are planned but have not been implemented yet.

Customer registration, sign-in, session checks, and sign-out are connected to MySQL and Express.

## Technology Stack

- Native HTML5
- CSS3
- Vanilla JavaScript
- Node.js
- Express 4
- MySQL 2
- `bcryptjs`
- `express-session`
- Lucide icons

## Project Structure

```text
04-onlineTrade/
|-- bin/
|   `-- www
|-- public/
|   |-- javascripts/
|   |   |-- auth.js
|   |   `-- shop.js
|   |-- stylesheets/
|   |   |-- auth.css
|   |   `-- style.css
|   |-- index.html
|   |-- login.html
|   `-- register.html
|-- routes/
|   |-- index.js
|   `-- users.js
|-- views/
|-- app.js
|-- db.js
|-- package.json
`-- README.md
```

## Requirements

- Node.js
- npm
- MySQL

## Installation

Clone the repository:

```bash
git clone https://github.com/Leon202503/onlineTradePage.git
cd onlineTradePage
```

Install dependencies:

```bash
npm install
```

## Database Setup

Create the database:

```sql
CREATE DATABASE onlinetrade
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE onlinetrade;
```

Create the customer table:

```sql
CREATE TABLE customers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  terms TINYINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Configure the connection in `db.js` for your local MySQL instance:

```javascript
const connection = mysql.createConnection({
  host: "localhost",
  port: "YOUR_MYSQL_PORT",
  user: "YOUR_MYSQL_USER",
  password: "YOUR_MYSQL_PASSWORD",
  database: "onlinetrade"
});
```

Do not commit real database credentials. Use environment variables before deploying the application.

## Running the Application

Start the development server:

```bash
npm start
```

Open:

```text
http://localhost:3000
```

Available pages:

```text
/           Storefront
/login      Sign-in page
/register   Registration page
```

## Authentication Flow

1. A customer submits the registration form.
2. Express validates the submitted fields.
3. `bcryptjs` hashes the password.
4. The customer record is stored in MySQL.
5. The customer submits the sign-in form.
6. Express retrieves the customer by email.
7. `bcryptjs` compares the submitted password with the stored hash.
8. Express creates a new session and stores basic customer information.
9. The browser receives the signed session cookie.
10. The storefront loads the signed-in account information from the session.

## Current Endpoints

```text
GET  /api/check-login   Check the current session
POST /api/register      Register a customer
POST /api/login         Sign in
POST /api/logout        Sign out
```

## Security Notes

- Passwords are hashed before being stored.
- Passwords and password hashes are not stored in the session.
- The Session Cookie uses `httpOnly` and `sameSite=lax`.
- The current default session store is intended for development only.
- Use a persistent session store such as MySQL in production.
- Set `SESSION_SECRET` to a long random value in production.
- Enable secure cookies when the site is served over HTTPS.

## Planned Work

- Load products from MySQL
- Product detail pages
- Database-backed shopping carts
- Customer favorites
- Customer account and order pages
- Order creation and stock updates
- Administration tools
- Persistent MySQL session storage

---

# 中文介绍

Northstar Supply 是一个响应式在线购物项目，前端使用原生 HTML、CSS 和 JavaScript，后端使用 Express 与 MySQL。项目目前包含商品展示、注册、登录、密码加密、Session 登录状态和登录用户悬浮面板。

仓库地址：[Leon202503/onlineTradePage](https://github.com/Leon202503/onlineTradePage)

## 已实现功能

### 商品页面

- 桌面端和移动端响应式布局
- 商品分类筛选
- 商品搜索和排序
- 商品收藏交互
- 购物车抽屉
- 商品数量与小计计算
- 免运费进度提示
- 邮件订阅表单

### 用户功能

- 用户注册
- 前端和后端表单校验
- 使用 `bcryptjs` 加密密码
- 用户登录
- 基于 Session 的登录状态
- 登录用户悬浮面板
- 退出登录

## 当前状态

商品页面目前使用 `public/javascripts/shop.js` 中的静态演示数据，尚未实现从 MySQL 查询商品。

用户注册、登录、Session 状态查询和退出登录已经连接 Express 与 MySQL。

## 安装与运行

克隆项目：

```bash
git clone https://github.com/Leon202503/onlineTradePage.git
cd onlineTradePage
```

安装依赖：

```bash
npm install
```

根据本机 MySQL 配置修改 `db.js`，并按照英文部分的 SQL 创建 `onlinetrade` 数据库和 `customers` 表。

启动项目：

```bash
npm start
```

访问：

```text
http://localhost:3000
```

## 当前接口

```text
GET  /api/check-login   查询登录状态
POST /api/register      用户注册
POST /api/login         用户登录
POST /api/logout        退出登录
```

## 注意事项

- 不要把真实数据库密码提交到 GitHub。
- 正式部署时应通过环境变量读取数据库配置。
- 当前 Session 默认保存在 Node.js 内存中，服务器重启后登录状态会丢失。
- 正式环境应使用 MySQL 等持久化 Session Store。
- 正式 HTTPS 环境应启用安全 Cookie。

## 后续计划

- 从 MySQL 加载商品
- 商品详情页面
- 数据库购物车
- 用户收藏
- 用户中心与订单页面
- 创建订单与库存管理
- 后台商品管理
- MySQL Session 持久化

## License

This project is licensed under the ISC License.
