var config = require('./config.js');
var crypto = require('crypto');
var mysql = require('mysql');
var _ = require('underscore');

var db = mysql.createConnection(config.db);

var auth = {

  checkCredentials: function(user, password, onSuccess, onError) {
    db.query('select credential from cwd_user where user_name = ?', [user], function(err, rows) {
      if(err || rows.length === 0) return onError();
      var fullHash = rows[0].credential;
      
      fullHash = fullHash.replace('{PKCS5S2}', '');
      var raw = new Buffer(fullHash, 'base64');
      var salt = raw.slice(0,16);
      var checksum = raw.slice(16);

      crypto.pbkdf2(password, salt, 10000, 32, 'sha1', function(err, key) {
          if(err) onError();
          else if(key.equals(checksum)) onSuccess();
          else onError();
      });
    });      
  },

  groupMemberships: function(user, password, onSuccess, onError) {
    this.checkCredentials(user, password, function() {
      db.query('select group_name \
        from cwd_user \
        join cwd_membership on cwd_membership.child_user_id = cwd_user.id \
        join cwd_group on cwd_membership.parent_id = cwd_group.id \
        where user_name = ?',
        [user],
        function(err, rows) {
          if(err) onError();
          else onSuccess(_.pluck(rows, 'group_name'));
        });
    }, onError);
  }
}

module.exports = auth;
