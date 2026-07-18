const logger = require('../config/logger');
const Registration = require('../models/Registration');
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const User = require('../models/User');
const { generateQRCode } = require('../utils/qrGenerator');
const { addEmailJob } = require('../config/queue');
const { v4: uuidv4 } = require('uuid');

// @desc    Register for a normal event
// @route   POST /api/registrations/register
// @access  Private (participant)
const registerForEvent = async (req, res, next) => {
  try {
    const { eventId, formResponses } = req.body;

    const event = await Event.findById(eventId).populate('organizer', 'name');
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Validation checks
    if (new Date() > event.registrationDeadline) {
      return res.status(400).json({ message: 'Registration deadline has passed' });
    }
    if (event.registrationLimit && event.currentRegistrations >= event.registrationLimit) {
      return res.status(400).json({ message: 'Registration limit reached' });
    }

    // Check eligibility
    const participant = await User.findById(req.user._id);
    if (event.eligibility === 'iiit-only' && participant.participantType !== 'iiit') {
      return res.status(403).json({ message: 'This event is only for IIIT participants' });
    }
    if (event.eligibility === 'non-iiit-only' && participant.participantType !== 'non-iiit') {
      return res.status(403).json({ message: 'This event is only for Non-IIIT participants' });
    }

    // Check duplicate registration
    const existing = await Registration.findOne({ event: eventId, participant: req.user._id });
    if (existing) return res.status(400).json({ message: 'You are already registered for this event' });

    // Create registration
    const registration = await Registration.create({
      event: eventId,
      participant: req.user._id,
      registrationType: 'normal',
      formResponses,
      status: 'confirmed'
    });

    // Generate QR code
    const ticketId = `FELI-${uuidv4().substring(0, 8).toUpperCase()}`;
    const qrData = { 
      ticketId, 
      eventId: event._id.toString(), 
      eventName: event.eventName,
      type: event.eventType,
      participantId: participant._id.toString(),
      participantName: `${participant.firstName} ${participant.lastName}`,
      email: participant.email,
    };
    const qrCode = await generateQRCode(qrData);

    // Create ticket
    const ticket = await Ticket.create({
      ticketId,
      registration: registration._id,
      event: eventId,
      participant: req.user._id,
      qrCode,
      ticketType: 'normal'
    });

    // Update event registration count
    event.currentRegistrations += 1;
    if (event.currentRegistrations === 1) event.formLocked = true;
    await event.save();

    // Send email with ticket
    // Queue email with ticket
    await addEmailJob('registration-confirmation', {
      type: 'registration-confirmation',
      data: {
        email: participant.email,
        name: `${participant.firstName} ${participant.lastName}`,
        eventName: event.eventName,
        ticketType: 'normal',
        qrCodeBuffer: qrCode // passing base64 directly to queue
      }
    });

    res.status(201).json({
      message: 'Registration successful! Ticket sent to your email.',
      registration,
      ticket: { ticketId, qrCode }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }
    next(error);
  }
};

// @desc    Get participant's registrations
// @route   GET /api/registrations/my
// @access  Private (participant)
const getMyRegistrations = async (req, res, next) => {
  try {
    const registrations = await Registration.find({ participant: req.user._id })
      .populate({
        path: 'event',
        populate: { path: 'organizer', select: 'name category' }
      })
      .sort({ createdAt: -1 });

    // Attach ticket IDs
    const withTickets = await Promise.all(registrations.map(async (reg) => {
      const ticket = await Ticket.findOne({ registration: reg._id });
      return { ...reg.toObject(), ticket };
    }));

    res.json(withTickets);
  } catch (error) {
    next(error);
  }
};

// @desc    Get ticket by ID
// @route   GET /api/registrations/ticket/:ticketId
// @access  Private
const getTicketById = async (req, res, next) => {
  try {
    const ticket = await Ticket.findOne({ ticketId: req.params.ticketId })
      .populate('event', 'eventName eventStartDate eventType organizer')
      .populate('participant', 'firstName lastName email');

    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    // Only the ticket owner or organizer can view
    if (ticket.participant._id.toString() !== req.user._id.toString() && req.user.role !== 'organizer' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(ticket);
  } catch (error) {
    next(error);
  }
};

// @desc    Get registrations for an event (organizer)
// @route   GET /api/registrations/event/:eventId
// @access  Private (organizer)
const getEventRegistrations = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const registrations = await Registration.find({ event: req.params.eventId })
      .populate('participant', 'firstName lastName email contactNumber participantType collegeOrOrg');

    res.json(registrations);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark attendance via QR scan
// @route   POST /api/registrations/attendance
// @access  Private (organizer)
const markAttendance = async (req, res, next) => {
  try {
    const { ticketId } = req.body;

    const ticket = await Ticket.findOne({ ticketId }).populate('event');
    if (!ticket) return res.status(404).json({ message: 'Invalid ticket' });
    if (!ticket.isValid) return res.status(400).json({ message: 'Ticket is invalid' });

    // Verify organizer owns this event
    if (ticket.event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized for this event' });
    }

    const registration = await Registration.findById(ticket.registration).populate('participant', 'firstName lastName email');

    if (registration.attendanceMarked) {
      return res.status(400).json({ message: 'Attendance already marked for this ticket', alreadyScanned: true });
    }

    registration.attendanceMarked = true;
    registration.attendanceTimestamp = new Date();
    await registration.save();

    res.json({
      message: 'Attendance marked successfully',
      participant: registration.participant,
      timestamp: registration.attendanceTimestamp
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export attendance CSV
// @route   GET /api/registrations/event/:eventId/attendance-csv
// @access  Private (organizer)
const exportAttendanceCSV = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event || event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const registrations = await Registration.find({ event: req.params.eventId })
      .populate('participant', 'firstName lastName email participantType');

    const csvHeader = 'Name,Email,Participant Type,Attendance,Timestamp\n';
    const csvRows = registrations.map(r => {
      const p = r.participant;
      return `"${p.firstName} ${p.lastName}","${p.email}","${p.participantType}","${r.attendanceMarked ? 'Present' : 'Absent'}","${r.attendanceTimestamp ? r.attendanceTimestamp.toISOString() : '-'}"`;
    }).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${event.eventName}-attendance.csv`);
    res.send(csvHeader + csvRows);
  } catch (error) {
    next(error);
  }
};

module.exports = { registerForEvent, getMyRegistrations, getTicketById, getEventRegistrations, markAttendance, exportAttendanceCSV };
