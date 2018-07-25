/**
 * RoomController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  joinRoom: async function(req, res) {
    const room_id = req.param('room_id');
    const events = await Event.find({ room_id: room_id, type: 'created' });
    if (events.length !== 0)
      return res.view('pages/room.ejs', {room: room_id});
    return res.redirect('/createRoom/' + room_id);
  },

  createRoom: function(req, res) {
    const room_id = req.param('room_id');
    return res.view('pages/createRoom.ejs', {room: room_id});
  },

  newRoom: async function(req, res) {
    const host = req.session.id;
    const question = req.param('question');
    const value = req.param('value');
    const options = req.param('options');
    const room_id = req.param('room_id');

    if (room_id == undefined || room_id.length === 0) {
      return res.badRequest("Invalid room ID");
    }

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

