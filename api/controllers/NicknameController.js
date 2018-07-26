/**
 * NicknameController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const uuid = require('uuid/v4');

module.exports = {

  setNick: function(req, res) {
    if (!req.session.uuid) {
      req.session.uuid = uuid();
    }
    if (!req.param('nick')) {
      return res.badRequest("No nickname provided");
    }
    req.session.nick = req.param('nick');
    req.session.uid = req.session.nick + "|" + req.session.uuid;
    return res.ok();
  }

};

