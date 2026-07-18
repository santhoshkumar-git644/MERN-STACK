const logger = require('../config/logger');
const Team = require('../models/Team');
const Registration = require('../models/Registration');
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const User = require('../models/User');
const { generateQRCode } = require('../utils/qrGenerator');
const { sendTicketEmail } = require('../utils/emailService');
const { v4: uuidv4 } = require('uuid');

// @desc    Create a team for an event
// @route   POST /api/teams
// @access  Private (participant)
const createTeam = async (req, res, next) => {
  try {
    const { eventId, teamName, maxSize } = req.body;

    const event = await Event.findById(eventId);
    if (!event || !event.isTeamEvent) {
      return res.status(400).json({ message: 'This event does not support team registration' });
    }

    // Check if user already has a team for this event
    const existingTeam = await Team.findOne({ event: eventId, leader: req.user._id });
    if (existingTeam) return res.status(400).json({ message: 'You already created a team for this event' });

    const inviteCode = uuidv4().substring(0, 8).toUpperCase();

    const team = await Team.create({
      teamName,
      event: eventId,
      leader: req.user._id,
      members: [],
      inviteCode,
      maxSize: maxSize || event.maxTeamSize
    });

    res.status(201).json({ team, inviteCode });
  } catch (error) {
    next(error);
  }
};

// @desc    Join a team via invite code
// @route   POST /api/teams/join
// @access  Private (participant)
const joinTeam = async (req, res, next) => {
  try {
    const { inviteCode } = req.body;

    const team = await Team.findOne({ inviteCode }).populate('leader', 'firstName lastName');
    if (!team) return res.status(404).json({ message: 'Invalid invite code' });
    if (team.status !== 'forming') return res.status(400).json({ message: 'Team is no longer accepting members' });
    if (team.members.length >= team.maxSize - 1) return res.status(400).json({ message: 'Team is already full' });

    // Check if user is already in team
    const alreadyIn = team.members.find(m => m.user.toString() === req.user._id.toString());
    if (alreadyIn) return res.status(400).json({ message: 'You are already in this team' });
    if (team.leader.toString() === req.user._id.toString()) return res.status(400).json({ message: 'You are the team leader' });

    team.members.push({ user: req.user._id, status: 'accepted' });
    
    // Check if team is now complete
    if (team.members.filter(m => m.status === 'accepted').length >= team.maxSize - 1) {
      team.status = 'complete';
      // Generate tickets for all members
      await generateTeamTickets(team);
    }
    
    await team.save();
    res.json({ message: 'Joined team successfully', team });
  } catch (error) {
    next(error);
  }
};

// Helper to generate tickets for all team members
const generateTeamTickets = async (team) => {
  const event = await Event.findById(team.event);
  const allMembers = [team.leader, ...team.members.filter(m => m.status === 'accepted').map(m => m.user)];

  for (const memberId of allMembers) {
    const member = await User.findById(memberId);
    const ticketId = `TEAM-${uuidv4().substring(0, 8).toUpperCase()}`;
    const qrData = { ticketId, eventId: team.event.toString(), participantId: memberId.toString(), teamId: team._id.toString() };
    const qrCode = await generateQRCode(qrData);

    const registration = await Registration.findOneAndUpdate(
      { event: team.event, participant: memberId },
      { event: team.event, participant: memberId, registrationType: 'team', team: team._id, status: 'confirmed' },
      { upsert: true, new: true }
    );

    await Ticket.create({ ticketId, registration: registration._id, event: team.event, participant: memberId, qrCode, ticketType: 'team' });

    try {
      await sendTicketEmail({
        to: member.email,
        participantName: `${member.firstName} ${member.lastName}`,
        eventName: event.eventName,
        ticketId,
        qrCodeBase64: qrCode,
        eventDate: new Date(event.eventStartDate).toLocaleDateString()
      });
    } catch (e) {
      logger.error('Email error for team ticket:', e.message);
    }
  }
};

// @desc    Get team details
// @route   GET /api/teams/:id
// @access  Private
const getTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('leader', 'firstName lastName email')
      .populate('members.user', 'firstName lastName email')
      .populate('event', 'eventName eventStartDate');
    if (!team) return res.status(404).json({ message: 'Team not found' });
    res.json(team);
  } catch (error) {
    next(error);
  }
};

// @desc    Get my teams
// @route   GET /api/teams/my
// @access  Private
const getMyTeams = async (req, res, next) => {
  try {
    const teamsAsLeader = await Team.find({ leader: req.user._id }).populate('event', 'eventName');
    const teamsAsMember = await Team.find({ 'members.user': req.user._id }).populate('event', 'eventName');
    res.json({ leading: teamsAsLeader, member: teamsAsMember });
  } catch (error) {
    next(error);
  }
};

module.exports = { createTeam, joinTeam, getTeam, getMyTeams };
