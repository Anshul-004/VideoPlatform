import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    subscriber: // subscribed count for a user (What channels a user has subscribed)
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

    channel:{ //subscriber count for a channel
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"        
    }
},{timestamps:true});

export const Subscription = mongoose.model("Subscription", subscriptionSchema);