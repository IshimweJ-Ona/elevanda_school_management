const authService = require("../services/auth.service");
const { loginDTO, registerDTO } = require("../dtos/auth.dot");

const login = async (req, res) => {
  try {
    const data = loginDTO(req.body);
    const result = await authService.login(data);
    res.json(result);
  } catch (err) {
    if (err.code === "PENDING_APPROVAL") {
      return res.status(403).json({ message: err.message, code: "PENDING_APPROVAL" });
    }
    res.status(400).json({ message: err.message });
  }
};

const register = async (req, res) => {
  try {
    const data = registerDTO(req.body);
    const result = await authService.registerParent(data);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { login, register };
