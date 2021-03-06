const User = require('../models/User.model');
const Post = require('../models/Post.model');
const Section = require('../models/Section.model')
const bcrypt = require('bcrypt');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { findByIdAndUpdate } = require('../models/User.model');

// View user
exports.read = async (req, res) => {   
  const {role} = req.query
  try{
    const user = await User.find({"role":role}).populate('unit').populate('topics','name')

    return user ? res.json({
      ok: true,
      user
    }) :
    res.status(404).json({
      ok: false,
      msg: "Không tìm thấy người dùng!"
    })
  } catch (err){
    res.status(500)
    console.log(err)
  }
}
// Get user ID (profile)
exports.getUserDetail = async (req, res, next) => {
  console.log('From user.controller: Trang cá nhân của', req.params);

  try {
    const student = await User.findOne({
      fullname: req.params.user,
    });
    const faculty = await User.findOne({
      username: req.params.user,
    });

    const posts = await Post.find({
      username: req.params,
      fullname: req.params,
    })
      .sort({ createdAt: -1 })
      .lean();
    // for (let i = 0; i < posts.length; i++) {
    //   const getUserIndex = posts.findIndex(c =>
    //     console.log(c._id.toString() === req.params.id)
    //   );
    // }

    // Nếu truy cập vào xem trang cá nhân của admin thì sẽ quay về home
    if (req.user.role !== 'admin') {
      if (req.params.user === 'admin') return res.redirect('/');
    }

    res.render('users/profile', {
      user: req.user, // Current user logging in
      isUserAvatar: '../' + req.user,
      isProfilePage: true,
      currentProfile: student ? !faculty && student : faculty,
      admin: req.user.role === 'admin' ? true : false,
      post: posts,
    });
  } catch (err) {
    next(err);
  }
}

// View user detail
exports.readDetail = async (req, res) => {   
  const {userId} = req.params
  try{
    const user = await User.find({"_id":userId}).populate('unit').populate('topics')

    return user ? res.json({
      ok: true,
      user
    }) :
    res.status(404).json({
      ok: false,
      msg: "Không tìm thấy người dùng!"
    })
  } catch (err){
    res.status(500)
    console.log(err)
  }
}

// // Get user ID (profile)
// exports.getUserDetail = async (req, res, next) => {
//   console.log('From user.controller: Trang cá nhân của ', req.params);
//   try {
//     const student = await User.findOne({
//       fullname: req.params.user,
//     });
//     const faculty = await User.findOne({
//       username: req.params.user,
//     });

//     // Nếu truy cập vào xem trang cá nhân của admin thì sẽ quay về home
//     if (req.user.role !== 'admin') {
//       if (req.params.user === 'admin') return res.redirect('/');
//     }

//     res.render('users/profile', {
//       user: req.user, // Current user logging in
//       isUserAvatar: '../' + req.user,
//       isProfilePage: true,
//       currentProfile: student ? !faculty && student : faculty,
//       admin: req.user.role === 'admin' ? true : false,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// // Get all user (for admin)
// exports.get = async (req, res, next) => {
//   try {
//     const studentRole = await User.find({ role: 'student' }).lean();
//     const facultyRole = await User.find({ role: 'faculty' }).lean();
//     if (req.user.role === 'admin') {
//       return res.render('admin/management', {
//         user: req.user, // For showing who is logging in session
//         student: studentRole, // Show all of Student from database for admin to manage
//         faculty: facultyRole, // Show all of Faculty from database for admin to manage
//         exampleAvatar: '../../public/image/tdt.jpg',
//       });
//     }
//     res.redirect('/home');
//   } catch (err) {
//     next(err);
//   }
// };

// Create user
exports.create = async (req, res, next) => {

  // Generate salt
  const salt = await bcrypt.genSalt();
  // Hash password with bcrypt
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  try {
    console.log(req.body.email)

    // Check existed user
    const duplicateUser = await User.find({email:req.body.email});

    if(duplicateUser.length > 0){
      return res.json({
          ok: false,
          msg: 'Người dùng đã tồn tại!'
      })
    }

    const avatar_default = "https://res.cloudinary.com/dd27hshho/image/upload/v1641262805/Upload/tdt_wnobdu.jpg"

    // set fullname to user by get section name in Section model
    let fullname =''
    const section = await Section.find({_id:req.body.unit})
    console.log("section", section)
    
    section ?  fullname = section[0].name : null 

    const user = await User.create({
      username: req.body.email ? req.body.email.split('@')[0] : null,
      fullname,
      email: req.body.email ? req.body.email : null,
      password: hashedPassword,
      role: req.body.role,
      unit: req.body.unit ? req.body.unit : null,
      //  Since URLSearchParams transform value into string, format it to array
      topics: req.body.topics ? req.body.topics.split(",") : null,
      avatar: avatar_default,
    });
    return res.json({
      ok: true,
      msg: 'Tạo người dùng mới thành công!',
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// Update user
exports.update = async (req, res, next) => {
  const {userId} = req.params
  const update = req.body

  // username
  update.username = update.email.split("@")[0]

  // password
  if(update.password === 'null'){
    delete update.password
  }else{
    // Generate salt
    const salt = await bcrypt.genSalt();
    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(update.password, salt);
    update.password = hashedPassword
  }

  // topics
  update.topics = update.topics ? update.topics.split(",") : null 

  console.log("update topics",update.topics)

  try{
    const user = await User.findByIdAndUpdate(
      {_id: userId}, 
      update,
      {new: true}
    )

    if(user){
      return res.json({
        ok: true,
        msg: "Cập nhật người dùng thành công!"
      })
    } else{
      return res.json({
        ok: false,
        msg: "Không tìm thấy người dùng"
      })
    }

  } catch (err){
    next(err)
  }
}

// Delete user
exports.delete = async (req, res, next) => {
  const {userId} = req.params;

  const user = await User.findByIdAndDelete({_id: userId})

  if(user){
    return res.json({
      ok: true,
      msg: "Xóa người dùng thành công!"
    })
  } else{
    return ré.json({
      ok: false,
      msg: "Không tìm thấy thông tin người dùng!"
    })
  }
}

// exports.createFromGoogleAuth = async (req, res, next) =>{
//     passport.use(
//         new GoogleStrategy({
//             clientID: process.env.GOOGLE_CLIENT_ID,
//             clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//             callbackURL: "/api/auth/google/callback"
//         }
//     )
// }
