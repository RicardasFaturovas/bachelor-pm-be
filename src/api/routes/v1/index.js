const express = require('express');
const userRoutes = require('./user.route');
const authRoutes = require('./auth.route');
const projectRoutes = require('./project.route');
const sprintRoutes = require('./sprint.route');
const storyRoutes = require('./story.route');
const adminRoutes = require('./admin.route');

const router = express.Router();

/**
 * GET v1/status
 */
router.get('/status', (req, res) => res.send('OK'));

/**
 * GET v1/docs
 */
router.use('/docs', express.static('docs'));

router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/stories', storyRoutes);
router.use('/sprints', sprintRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
