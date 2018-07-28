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
    if (!req.session.uid) {
      return res.redirect('/nick' + '?next=' + encodeURIComponent(req.url));
    }

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
    if (!host)
      return res.badRequest("No user host");
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
  }

};

