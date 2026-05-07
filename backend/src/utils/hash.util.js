const crypto = require("crypto");

const hashPassword = (password) => {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.pbkdf2Sync(password, salt, 210000, 64, "sha512").toString("hex");
    return `pbkdf2_sha512$210000$${salt}$${hash}`;
};

const comparePassword = (password, hashed) => {
    if (!hashed) return false;

    if (hashed.startsWith("pbkdf2_sha512$")) {
        const [, iterations, salt, originalHash] = hashed.split("$");
        if (!iterations || !salt || !originalHash) return false;
        const hash = crypto
            .pbkdf2Sync(password, salt, Number(iterations), 64, "sha512")
            .toString("hex");
        if (hash.length !== originalHash.length) return false;
        return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(originalHash, "hex"));
    }

    // Backward compatibility for accounts created before the secure password format.
    const legacyHash = crypto.createHash("sha512").update(password).digest("hex");
    return legacyHash === hashed;
};

module.exports = { hashPassword, comparePassword };
