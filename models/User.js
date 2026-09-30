const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: 2,
            maxlength: 60
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"]
        },

        phone: {
            type: String,
            trim: true,
            match: [/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"]
        },

        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: 6,
            select: false // never return password by default in queries
        },

        role: {
            type: String,
            enum: ["customer", "admin"],
            default: "customer"
        },

        addresses: [
            {
                label: { type: String, default: "Home" }, // Home, Work, Other
                line1: String,
                line2: String,
                city: String,
                state: String,
                pincode: String,
                isDefault: { type: Boolean, default: false }
            }
        ],

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true // adds createdAt, updatedAt automatically
    }
);

/* Hash password before saving, only if it was modified */
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

/* Instance method to compare entered password with hashed password */
userSchema.methods.comparePassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

/* Remove sensitive fields when converting to JSON */
userSchema.methods.toSafeObject = function () {
    return {
        id: this._id,
        name: this.name,
        email: this.email,
        phone: this.phone,
        role: this.role,
        addresses: this.addresses,
        createdAt: this.createdAt
    };
};

module.exports = mongoose.model("User", userSchema);
