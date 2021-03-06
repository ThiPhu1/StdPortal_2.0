const Router = require('express').Router();
const authRouter = require('./auth.routes');
const userRouter = require('./user.routes');
const postRouter = require('./post.routes');
const commentRouter = require('./comment.routes');
const announcementRouter = require('./announcement.routes');
const sectionRouter = require('./section.routes');
const { userAuth } = require('../middlewares/auth.middleware');

// /api/auth
Router.use('/auth', authRouter);

// Kiem tra token session
Router.use(userAuth);

// /api/user
Router.use('/user', userRouter);

// /api/post
Router.use('/post', postRouter);

// /api/comment
Router.use('/comment', commentRouter);

// /api/annoucement
Router.use('/announcement', announcementRouter);

// /api/section
Router.use('/section', sectionRouter);

Router.use((req, res) =>
  res.status(404).json({
    ok: false,
    msg: 'Không thể giải quyết yêu cầu!',
  })
);

// Handle error
Router.use((err, req, res) => {
  console.log(err);
  return res.status(500).json({
    ok: false,
    msg: 'Đã có lỗi xảy ra!',
  });
});

module.exports = Router;
