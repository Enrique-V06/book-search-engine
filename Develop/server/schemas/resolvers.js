const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const{ signToken } = require('../utils/auth')

const resolvers ={
    Query:{
        // users: async () => {
        //     return User.find();
        // },
        // user: async (parent, args) => {
        //     return User.findOne({args});
        // },
        me: async (parent, args, context)=> {
            if (context.user){
                return await User.findOne({_id: context.user._id}).populate('savedBooks');
            }
        }
    },

    Mutation:{
        addUser: async (parent, { username, email, password }) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user);
            return { token, user };
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
            const correctPw = await user.isCorrectPassword(password);
            if (!user || !correctPw) {
                throw new AuthenticationError('Incorrect credentials');
            }
            const token = signToken(user);
            return { token, user };
        },
        saveBook: async(parent, args, context) => {
            if (context.user){
                const userBooks = await User.findOneAndUpdate(
                    {_id: context.user._id},
                    {$addToSet: {savedBooks: args}},
                    {new:true,
                    runValidators:true,}
                );
                return userBooks;
        }},
        removeBook: async(parent, { bookId }, context) => {
            if (context.user){
                const userBooks = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: {savedBooks: { bookId } } },
                    { new: true }
                );
                return userBooks;
            }
        }
    }
};

module.exports = resolvers;