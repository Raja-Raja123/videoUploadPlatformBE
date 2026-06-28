import mongoose, {isValidObjectId} from "mongoose"
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js"
import { asyncHandeler } from "../utils/asyncHandeler.js"


const toggleSubscription = asyncHandeler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandeler(async (req, res) => {
    const {channelId} = req.params
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandeler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}