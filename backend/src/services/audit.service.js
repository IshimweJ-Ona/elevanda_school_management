const prisma = require("../config/prisma");

const logAction =  async ({ adminId, action, entity, entityId }) => {
    return await prisma.adminActionLog.create({
        data: {
            adminId,
            action,
            entity,
            entityId
        }
    });
};

module.exports = { logAction };