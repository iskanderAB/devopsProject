const { User } = require("../models");
const { jwtSign } = require("../helper/jwt");
const { bcryptHash, bcryptCompare } = require("../helper/bcrypt");
const {
  ValidationError,
  FieldRequiredError,
  AlreadyTakenError,
  NotFoundError,
} = require("../helper/customErrors");

// Register
const signUp = async (req, res, next) => {
  try {
    console.log(`[SIGNUP] Attempting user registration`);
    console.log(`[SIGNUP] Request body:`, JSON.stringify(req.body, null, 2));
    
    const { username, email, bio, image, password } = req.body.user;
    console.log(`[SIGNUP] Extracted fields - username: ${username}, email: ${email}`);
    
    if (!username) throw new FieldRequiredError(`A username`);
    if (!email) throw new FieldRequiredError(`An email`);
    if (!password) throw new FieldRequiredError(`A password`);

    console.log(`[SIGNUP] Checking if user exists with email: ${email}`);
    const userExists = await User.findOne({
      where: { email: req.body.user.email },
    });
    if (userExists) {
      console.log(`[SIGNUP] User already exists with email: ${email}`);
      throw new AlreadyTakenError("Email", "try logging in");
    }

    console.log(`[SIGNUP] Creating new user...`);
    const newUser = await User.create({
      email: email,
      username: username,
      bio: bio,
      image: image,
      password: await bcryptHash(password),
    });
    console.log(`[SIGNUP] ✓ User created successfully with ID: ${newUser.id}`);

    newUser.dataValues.token = await jwtSign(newUser);
    console.log(`[SIGNUP] ✓ JWT token generated`);

    res.status(201).json({ user: newUser });
  } catch (error) {
    console.error(`[SIGNUP] ✗ Registration failed:`, error.message);
    next(error);
  }
};

// Login
const signIn = async (req, res, next) => {
  try {
    console.log(`[SIGNIN] Attempting user login`);
    console.log(`[SIGNIN] Request body:`, JSON.stringify(req.body, null, 2));
    
    const { user } = req.body;
    console.log(`[SIGNIN] Login attempt for email: ${user?.email}`);

    console.log(`[SIGNIN] Searching for user in database...`);
    const existentUser = await User.findOne({ where: { email: user.email } });
    if (!existentUser) {
      console.log(`[SIGNIN] ✗ User not found with email: ${user.email}`);
      throw new NotFoundError("Email", "sign in first");
    }
    console.log(`[SIGNIN] ✓ User found with ID: ${existentUser.id}`);

    console.log(`[SIGNIN] Verifying password...`);
    const pwd = await bcryptCompare(user.password, existentUser.password);
    if (!pwd) {
      console.log(`[SIGNIN] ✗ Password verification failed for user: ${user.email}`);
      throw new ValidationError("Wrong email/password combination");
    }
    console.log(`[SIGNIN] ✓ Password verified`);

    console.log(`[SIGNIN] Generating JWT token...`);
    existentUser.dataValues.token = await jwtSign(user);
    console.log(`[SIGNIN] ✓ JWT token generated`);

    console.log(`[SIGNIN] ✓ Login successful for user: ${user.email}`);
    res.json({ user: existentUser });
  } catch (error) {
    console.error(`[SIGNIN] ✗ Login failed:`, error.message);
    next(error);
  }
};

module.exports = { signUp, signIn };
