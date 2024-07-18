const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "..", "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:5173"], // Replace with your frontend URL(s)
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  })
);

const UserRouter = require("./router/User.router");
const HomeworkRouter = require("./router/Homework.router");
const TestRouter = require("./router/Test.router");
const TeacherRouter = require("./router/Teacher.router");

app.use("/api", UserRouter);
app.use("/api/homework", HomeworkRouter);
app.use("/api/test", TestRouter);
app.use("/api/teacher", TeacherRouter);

app.use((req, res, next) => {
  if (req.url.includes("api")) {
    next();
  } else {
    res.sendFile(path.join(__dirname, "..", "public", "index.html"));
  }
});

app.listen(port, () => console.log(`http://localhost:${port}`));
