const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const resetPasswordTokenSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "user",
    },
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 18000,
    },
});

const ResetPasswordToken = model("ResetPasswordToken", resetPasswordTokenSchema);

module.exports = ResetPasswordToken;