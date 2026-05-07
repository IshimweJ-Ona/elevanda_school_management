const registerDTO = (data) => {
    const { name, email, phone_number, password, role } = data;

    if (!name || !email || !phone_number || !password) {
        throw new Error("Missing required fields")
    }

    const phoneRegex = /^(\+2507\d{8}|07\d{8})$/;

    if (!phoneRegex.test(phone_number)) {
        throw new Error("Invalid Rwanda phone number format");
    }
    return { name, email, phone_number, password, role };
};

const loginDTO = (data) => {
    const { email, phone_number, password } = data;

    if (!email && !phone_number || !password) {
        throw new Error("Provide email or phone number and password");
    }

    return { email,phone_number, password };
};

module.exports = { registerDTO, loginDTO }
