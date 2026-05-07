const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const backupRoot = path.join(__dirname, "..", "..", "data", "backups");

const ensureDirectory = async (dirPath) => {
  await fs.mkdir(dirPath, { recursive: true });
};

const backupEntity = async (category, data) => {
  const folder = path.join(backupRoot, category);
  await ensureDirectory(folder);
  const fileName = `${Date.now()}_${data.id || uuidv4()}.json`;
  const filePath = path.join(folder, fileName);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
  return filePath;
};

module.exports = { backupEntity };
