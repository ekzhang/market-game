/**
 * EventController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  filterRoom: async function(req, res) {
    const room_id = req.param('room_id');
    const result = await Event.find({ room_id: room_id }, );
    return res.json(result);
  }

};

