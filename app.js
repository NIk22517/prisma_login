const { PrismaClient } = require("@prisma/client");
const express = require("express");
const bcrypt = require("bcrypt");
const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.get("/user", async (req, res) => {
  const userId = req.query.id;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: "Something went wrong",
    });
  }
});

app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashPassword = await bcrypt.hash(password, 10);

    const alreadyExists = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (alreadyExists) {
      res.status(401).json({
        success: false,
        error: "User already exists",
      });
    } else {
      const user = await prisma.user.create({
        data: {
          name: name,
          email: email,
          password: hashPassword,
        },
      });

      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: "Something went wrong",
    });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        res.status(200).json({
          success: true,
          data: {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
          },
        });
      } else {
        res.status(401).json({
          success: false,
          error: "Invalid Credentials",
        });
      }
    } else {
      res.status(404).json({
        success: false,
        error: "User Not Found",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Something went wrong",
    });
  }
});

app.listen(3001, () => {
  console.log("app is running on port 3001");
});
