const router = require("express").Router();
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const { User, validate } = require("../../DB/user");
const { loginValidation } = require("../../validations/login");
const { mailServer } = require("../../mailServer/mailServer");
const { AccountVerificationTemplate } = require("../../mailServer/template");
const {
  verificationSession,
  validateverificationSession,
} = require("../../DB/verificationSession");

// Register Route
// @ts-ignore
router.post("/register", async (req, res) => {
  // console.log(req.body);
  const { error } = validate(req.body);
  if (error) return res.status(400).send({ error: error.details[0].message });

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send({ error: "User alreay existing" });

  user = new User(_.pick(req.body, ["name", "email", "password"]));
  // @ts-ignore
  user.password = await user.encryptPassword();
  user.role = "admin";

  await user.save();
  return res
    .status(200)
    .send(_.pick(user, ["_id", "name", "email", "password"]));
});

// Login Route
// @ts-ignore
router.post("/login", async (req, res) => {
  // console.log(req.body);
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });

  if (!user) return res.status(400).send({ error: "user not found" });

  let result = bcrypt.compareSync(req.body.password, user.password);

  if (!result)
    return res.status(400).send({ error: "check the username password" });

  // console.log("user : ", user);
  const token = jwt.sign(
    _.pick(user, ["_id", "name", "email", "role"]),
    // @ts-ignore
    process.env.JWT_SECRET_KEY
  );
  // console.log(token);

  // if (user.status == "IA")
  //   return res.status(401).send("you need to be verified before login");

  return res
    .status(200)
    .header({ "x-auth-token": token })
    .header("access-control-expose-headers", "x-auth-token")
    .send("login post");
});

// Protected Route
router.get("/protected", (req, res) => {
  jwt.verify(
    // @ts-ignore
    req.header("x-auth-token"),
    process.env.JWT_SECRET_KEY,
    (error, decoded) => {
      if (error) return res.status(401).send({ error: "invalid token" });
      return res.status(200).send(decoded);
    }
  );
});

// sending Verification mail
router.get("/accountverificationmail", async (req, res) => {
  // jwt validation
  jwt.verify(
    // @ts-ignore
    req.header("x-auth-token"),
    process.env.JWT_SECRET_KEY,
    async (errormsg, decoded) => {
      if (errormsg) return res.status(401).send("invalid token. login first");
      // @ts-ignore
      if (decoded.status == "A") return res.send("account already verified !");

      const randomId = crypto.randomUUID();
      // @ts-ignore
      const data = { randomId: randomId, email: decoded.email };
      const { error } = validateverificationSession(data);
      if (error) return res.send(error.details[0].message);

      const sessionData = new verificationSession(data);

      const result = await sessionData.save();

      if (!result) return res.status(404).send("somthing went wrong try again");

      const mailInfo = await mailServer(
        data.email,
        "Account Verification !",
        AccountVerificationTemplate(
          `https://samay.atraski.com/auth/accountverification/${data.randomId}`
        )
      );
      if (!mailInfo) return res.status(400).send("mail not sent try again");

      return res.status(200).send(mailInfo);
    }
  );
});

// account verification route
// @ts-ignore
router.get("/accountverification/:id", async (req, res) => {
  const data = await verificationSession.findOne({ randomId: req.params.id });
  if (!data) return res.status(404).send("wrong link");

  const updateData = await User.updateOne(
    { email: data.email },
    { status: "A" }
  );

  if (!updateData) return res.status(404).send("not verifyed try again");

  const deletedData = await verificationSession.deleteOne({
    randomId: req.params.id,
  });
  if (!deletedData) return res.status(404).send("try again");
  res.status(200).send("data deleted");
});

module.exports = router;