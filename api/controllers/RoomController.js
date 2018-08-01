/**
 * RoomController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

function escapeStr(str) {
  return (str + '')
    .replace(/[\\"']/g, '\\$&')
    .replace(/\u0000/g, '\\0');
}

module.exports = {

  joinRoom: async function(req, res) {
    const room_id = req.param('room_id');
    const events = await Event.find({ room_id: room_id, type: 'created' });
    if (events.length !== 0)
      return res.view('pages/room.ejs', {
        room: escapeStr(room_id),
        uid: escapeStr(req.session.uid)
      });
    return res.redirect('/createRoom/' + room_id);
  },

  createRoom: function(req, res) {
    const room_id = req.param('room_id');
    return res.view('pages/createRoom.ejs', { room: escapeStr(room_id) });
  },

  newRoom: async function(req, res) {
    const host = req.session.uid;
    const question = req.param('question');
    const value = Number(req.param('value'));
    const options = req.param('options');
    const room_id = req.param('room_id');

    if (room_id == undefined || room_id.length === 0)
      return res.badRequest("Invalid room ID");
    if (!question)
      return res.badRequest("No question provided");
    if (isNaN(value) || !Number.isInteger(value) || value <= 0 || value > 1000)
      return res.badRequest("Invalid asset value");

    const events = await Event.find({ room_id: room_id, type: 'created' });
    if (events.length !== 0) {
      // Already created!
      return res.badRequest("Room already created");
    }

    await Event.create({
      room_id,
      type: 'created',
      user: host,
      data: {
        question, value, options
      }
    });

    return res.ok();
  },

  recentGames: async function(req, res) {
    let hourAgo = new Date() - 1000 * 60 * 60;
    // let weekAgo = new Date();
    // weekAgo.setDate(weekAgo.getDate() - 7);

    const result = await Event.find({
      where: {
        type: ['created', 'end'],
        // createdAt: {
        //   '>': weekAgo
        // }
      },
      sort: 'createdAt DESC'
    });

    const rooms = new Set();
    const ret = [];
    for (const e of result) {
      if (e.type === 'end') {
        rooms.add(e.room_id);
      }
      else if (e.type === 'created') {
        const ended = rooms.has(e.room_id);
        if (ended || e.createdAt > hourAgo) {
          // Only include ongoing games if they were
          // started less than an hour ago.
          ret.push({
            ended,
            event: e
          });
        }
      }
    }

    return res.json(ret);
  }

};
