import mongoose from "mongoose";

const threadSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    community: {
        type: mongoose.Schema.Types.ObjectId,
         ref: 'Community'
    },
    createdAt: {
        type: Date, 
        default: Date.now
    },
    parentId: {
        type: String
    },
    /* The `children` field in the `threadSchema` is an array of references to other `Thread`
    documents. This allows for a hierarchical structure where a thread can have
    multiple child threads. */
    children: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Thread'
        }
    ]
})

const Thread = mongoose.models.Thread || mongoose.model('Thread', threadSchema)
export default Thread;