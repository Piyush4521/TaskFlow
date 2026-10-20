import TeamMember from '../models/TeamMember.js';

export async function getTeamMembers(req, res, next) {
  try {
    const members = await TeamMember.find()
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: members.length,
      data: members,
    });
  } catch (err) {
    next(err);
  }
}

export default { getTeamMembers };
