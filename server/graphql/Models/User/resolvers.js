const { PubSub } = require('graphql-yoga');
const User = require('./model');
const { comparePasswords, generateToken } = require('../../../helpers/auth');

const pubsub = new PubSub();

const resolvers = {
  Query: {
    users: () => User.find(),
  },

  Mutation: {
    createUser: async (_, {
      firstName, lastName, username, email, password,
    }) => {
      const user = new User({
        firstName, lastName, username, email, password,
      });
      await user.save();
      pubsub.publish('newUser', { newUser: user });
      return user;
    },

    loginUser: async (_, {
      email, username, password,
    }) => {
      const user = await User.findOne(
        { $or: [{ email }, { username }] },
      );
      const validatepassword = await comparePasswords(password, user.password);
      const token = validatepassword ? await generateToken(user.username, user.id) : null;
      console.log(user);
      console.log('token --->', token);
      return user;
    },

    updateUser: async (_, {
      id, firstName, lastName, username,
    }) => {
      const userData = { firstName, lastName, username };
      const user = await User.findOneAndUpdate(
        { _id: id },
        { $set: { ...userData } },
        { new: true },
      );
      return user;
    },
  },
};

module.exports = resolvers;
