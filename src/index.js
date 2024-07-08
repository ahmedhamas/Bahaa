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

app.use("/api", UserRouter);
app.use("/api/homework", HomeworkRouter);
app.use("/api/test", TestRouter);

app.use((req, res, next) => {
  if (req.url.includes("api")) {
    next();
  } else {
    res.sendFile(path.join(__dirname, "..", "public", "index.html"));
  }
});

app.listen(port, () => console.log(`http://localhost:${port}`));

//TODO: Add user blocking method
//TODO: Add auto correction for the test and home work for user but not public
//TODO: Add admin can publish test and home work
//TODO: Add admin can publich the user results on test and homework
//TODO: Add certificates
//TODO: Make test table for public test
//TODO: Make qr code for public test urls auto generated
//TODO: Add button to send the user test results to the user parrent whatsapp number
//TODO: Add admin can publish images as it's the question and can add text above the image
//TODO: Add list of animation for the quistions if the admin want to add it
//TODO: Add Timer for the test
//TODO: Get the qustions randomly and not in order
//TODO: Add auto correction for the test
//TODO: make certificates for the tests that user passed
