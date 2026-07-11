const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: function () { return this.role === 'participant'; },
    trim: true
  },
  lastName: {
    type: String,
    required: function () { return this.role === 'participant'; },
    trim: true
  },
  name: {
    type: String,
    required: function () { return this.role === 'organizer'; },
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['participant', 'organizer', 'admin'],
    default: 'participant'
  },
  profilePictureUrl: {
    type: String,
    trim: true,
    default: ''
  },
  clubLogoUrl: {
    type: String,
    trim: true,
    default: ''
  },
  // Participant specific fields
  participantType: {
    type: String,
    enum: ['iiit', 'non-iiit'],
    required: function () { return this.role === 'participant'; }
  },
  contactNumber: {
    type: String,
    trim: true
  },
  collegeOrOrg: {
    type: String,
    trim: true
  },
  interests: [{ type: String }],
  followedClubs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // Organizer specific fields
  category: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  contactEmail: {
    type: String,
    trim: true
  },
  discordWebhook: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  onboardingComplete: {
    type: Boolean,
    default: false
  },
  tokenVersion: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
