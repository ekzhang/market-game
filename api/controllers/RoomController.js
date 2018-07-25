/**
 * RoomController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  joinRoom: function(req, res) {
    const room_id = req.param('room_id');
    const events = await Event.find({ room_id: room_id, type: 'createRoom' });
    if (events.length !== 0)
      return res.view('pages/room.ejs', {room: room_id});
    return res.redirect('/createRoom/' + room_id);
  }

};

