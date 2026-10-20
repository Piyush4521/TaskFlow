import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Team member name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    role: {
      type: String,
      required: [true, 'Team member role is required'],
      trim: true,
      minlength: [2, 'Role must be at least 2 characters'],
      maxlength: [100, 'Role cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [254, 'Email cannot exceed 254 characters'],
    },
    department: {
      type: String,
      trim: true,
      default: 'General',
      maxlength: [60, 'Department cannot exceed 60 characters'],
    },
    isFixture: {
      type: Boolean,
      default: true,
    },
    source: {
      type: String,
      default: 'development_seed',
      maxlength: [50, 'Source cannot exceed 50 characters'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const TeamMember = mongoose.model('TeamMember', teamMemberSchema);

export default TeamMember;
