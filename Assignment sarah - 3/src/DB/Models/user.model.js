import mongoose from "mongoose";

export const GenderEnum = { MALE: 1, FEMALE: 2 };
export const RoleEnum = { USER: 1, ADMIN: 2 };
export const ProviderEnum = { SYSTEM: 1, GOOGLE: 2 };

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "FirstName is Mandatory"],
      minLength: 2,
      maxLength: 25,
    },
    lastName: {
      type: String,
      required: [true, "LastName is Mandatory"],
      minLength: 2,
      maxLength: 25,
    },
    email: {
      type: String,
      required: [true, "Email is Mandatory"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        return this.provider === ProviderEnum.SYSTEM;
      },
    },
    DOB: Date,
    phone: String,
    gender: {
      type: Number,
      enum: Object.values(GenderEnum),
      default: GenderEnum.MALE,
    },
    role: {
      type: Number,
      enum: Object.values(RoleEnum),
      default: RoleEnum.USER,
    },
    provider: {
      type: Number,
      enum: Object.values(ProviderEnum),
      default: ProviderEnum.SYSTEM,
    },
    confirmEmail: Date,
    profilePic: String,
    coverImages: [String],
    isActive: Boolean,
    changeCredentialsTime: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema
  .virtual("username")
  .set(function (value) {
    const [firstName, lastName] = value?.split(" ") || [];
    this.set({ firstName, lastName });
  })
  .get(function () {
    return `${this.firstName} ${this.lastName}`;
  });

export const userModel =
  mongoose.models.User || mongoose.model("User", userSchema);
export default userModel;