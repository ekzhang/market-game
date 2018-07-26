/**
 * NicknameController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  setNick: function(req, res) {
    if (req.session.nick) {
      return res.badRequest("Nickname already set");
    }
    req.session.nick = req.param('nick');
    req.session.uid = req.session.nick + "," + Math.random();
    return res.ok();
  }

};

