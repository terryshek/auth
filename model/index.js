/**
 * Created by terryshek on 11/12/14.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var objectId = Schema.ObjectId;
var User = mongoose.model('User',new Schema({
    id:objectId,
    firstname:String,
    lastname:String,
    email:{type:String,unique:true},
    password:String
}))
module.exports = User;
